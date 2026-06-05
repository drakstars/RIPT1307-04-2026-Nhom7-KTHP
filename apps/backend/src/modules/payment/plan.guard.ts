import {
    Injectable, CanActivate, ExecutionContext, ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PLAN_LIMITS } from '../../modules/payment/plan.config';

export const REQUIRE_PLAN_KEY = 'requirePlan';

// Usage: @RequirePlan('canAccessGames')
export const RequirePlan = (feature: keyof typeof PLAN_LIMITS.FREE) =>
    Reflect.metadata(REQUIRE_PLAN_KEY, feature);

@Injectable()
export class PlanGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const feature = this.reflector.get<string>(REQUIRE_PLAN_KEY, context.getHandler());
        if (!feature) return true;

        const req = context.switchToHttp().getRequest();
        const userId = req.user?.id;
        if (!userId) return false;

        const sub = await this.prisma.subscription.findUnique({
            where: { userId },
            select: { plan: true, status: true },
        });

        if (!sub || sub.status !== 'ACTIVE') throw new ForbiddenException('No active subscription');

        const limits = PLAN_LIMITS[sub.plan];
        const allowed = limits[feature as keyof typeof limits];

        if (!allowed) {
            throw new ForbiddenException({
                message: 'Upgrade required',
                requiredFeature: feature,
                currentPlan: sub.plan,
            });
        }

        // Attach plan to request for downstream use
        req.plan = sub.plan;
        req.limits = limits;

        return true;
    }
}