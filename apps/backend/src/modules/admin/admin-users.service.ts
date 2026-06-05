import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { search?: string; plan?: string; page?: number }) {
    const { search, plan, page = 1 } = params;
    const take = 20;
    const skip = (page - 1) * take;

    const where: any = {};

    if (search) {
      where.email = { contains: search };
    }

    if (plan) {
      where.subscription = { plan };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          subscription: { select: { plan: true, status: true } },
          role: { select: { name: true } },
          _count: { select: { flashcardSets: true, quizAttempts: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.user.count({ where }),
    ]);

    // Map singular role to roles array for frontend compatibility
    const formattedUsers = users.map(u => ({
      ...u,
      roles: u.role ? [u.role] : [],
    }));

    return { users: formattedUsers, total, page, totalPages: Math.ceil(total / take) };
  }

  async create(data: {
    email: string;
    password: string;
    role?: string;
    plan?: string;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already exists');

    const hash = await bcrypt.hash(data.password, 10);
    const roleRecord = await this.prisma.role.findFirst({
      where: { name: data.role ?? 'USER' },
    });

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hash,
        fullName: data.email.split('@')[0],
        roleId: roleRecord ? roleRecord.id : 2, // 2 is default USER role
      },
    });

    // Create subscription
    await this.prisma.subscription.create({
      data: {
        userId: user.id,
        plan: (data.plan ?? 'FREE') as any,
      },
    });

    return user;
  }

  async update(id: string, data: { email?: string; plan?: string; role?: string }) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) throw new NotFoundException('Invalid user ID');

    const user = await this.prisma.user.findUnique({ where: { id: numId } });
    if (!user) throw new NotFoundException('User not found');

    const updateData: any = {};
    if (data.email) {
      updateData.email = data.email;
    }

    if (data.role) {
      const roleRecord = await this.prisma.role.findFirst({
        where: { name: data.role },
      });
      if (roleRecord) {
        updateData.roleId = roleRecord.id;
      }
    }

    await this.prisma.user.update({
      where: { id: numId },
      data: updateData,
    });

    if (data.plan) {
      await this.prisma.subscription.upsert({
        where: { userId: numId },
        update: { plan: data.plan as any },
        create: { userId: numId, plan: data.plan as any },
      });
    }

    const updatedUser = await this.prisma.user.findUnique({
      where: { id: numId },
      include: { subscription: true, role: true },
    });

    if (!updatedUser) throw new NotFoundException('User not found');

    return {
      ...updatedUser,
      roles: updatedUser.role ? [updatedUser.role] : [],
    };
  }

  async delete(id: string) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) throw new NotFoundException('Invalid user ID');

    const user = await this.prisma.user.findUnique({ where: { id: numId } });
    if (!user) throw new NotFoundException('User not found');
    
    await this.prisma.user.delete({ where: { id: numId } });
    return { message: 'User deleted' };
  }

  async ban(id: string) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) throw new NotFoundException('Invalid user ID');

    return this.prisma.user.update({
      where: { id: numId },
      data: { banned: true },
    });
  }

  async unban(id: string) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) throw new NotFoundException('Invalid user ID');

    return this.prisma.user.update({
      where: { id: numId },
      data: { banned: false },
    });
  }
}
