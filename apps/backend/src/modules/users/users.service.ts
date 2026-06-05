import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        subscription: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: number, dto: { firstName?: string; lastName?: string; bio?: string; avatarUrl?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const firstName = dto.firstName ?? user.firstName;
    const lastName = dto.lastName ?? user.lastName;
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || user.fullName;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        fullName,
      },
      include: {
        role: true,
        subscription: true,
      },
    });

    return this.sanitizeUser(updatedUser);
  }

  async getSettings(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.settings ?? {};
  }

  async updateSettings(userId: number, settings: any) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { settings },
      select: { settings: true },
    });

    return updatedUser.settings;
  }

  async updatePassword(userId: number, dto: { currentPassword?: string; newPassword?: string }) {
    if (!dto.currentPassword || !dto.newPassword) {
      throw new BadRequestException('Current password and new password are required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt();
    const newHash = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { success: true, message: 'Password updated successfully' };
  }

  async deleteAccount(userId: number) {
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { success: true, message: 'Account deleted successfully' };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, refreshTokenHash, ...safeUser } = user;
    return safeUser;
  }
}
