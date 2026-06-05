import {
    Controller, Get, Post, Delete, Body, UseGuards, Request,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { PlanType } from '@prisma/client';

class UpgradePlanDto {
    @IsEnum(PlanType)
    plan: PlanType;

    @IsIn(['monthly', 'annual'])
    billingCycle: 'monthly' | 'annual';

    @IsOptional()
    @IsString()
    mockCardLast4?: string;
}

@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Get('subscription')
    getSubscription(@Request() req: any) {
        return this.paymentService.getSubscription(req.user.id);
    }

    @Get('limits')
    getLimits(@Request() req: any) {
        return this.paymentService.getLimits(req.user.id);
    }

    @Get('usage')
    getUsage(@Request() req: any) {
        return this.paymentService.getUsage(req.user.id);
    }

    @Post('upgrade')
    upgrade(@Body() dto: UpgradePlanDto, @Request() req: any) {
        return this.paymentService.upgradePlan(req.user.id, dto);
    }

    @Delete('subscription')
    cancel(@Request() req: any) {
        return this.paymentService.cancelSubscription(req.user.id);
    }
}