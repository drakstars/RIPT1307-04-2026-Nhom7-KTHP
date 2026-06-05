import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existedUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existedUser) {
      throw new BadRequestException('Email already exists');
    }

    const userRole = await this.prisma.role.findUnique({
      where: { name: 'USER' },
    });

    if (!userRole) {
      throw new BadRequestException('USER role not found');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        roleId: userRole.id,
      },
      include: {
        role: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role.name);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'BLOCKED') {
      throw new UnauthorizedException('Account is blocked');
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);

    if (!validPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role.name);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
      },
    });

    return {
      message: 'Logout success',
    };
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || !user.refreshTokenHash) throw new UnauthorizedException();

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role.name },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
    );

    return { accessToken };
  }

  private async generateTokens(userId: number, email: string, role: string) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async saveRefreshToken(userId: number, refreshToken: string) {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash,
      },
    });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, refreshTokenHash, ...safeUser } = user;
    return safeUser;
  }
}