import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { starsBalance: true, vtsBalance: true, ntsBalance: true },
    });
    if (!user) {
      return { starsBalance: 0, vtsBalance: 0, ntsBalance: 0 };
    }
    return user;
  }

  async deductStars(userId: number, amount: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.starsBalance < amount) {
      throw new BadRequestException('Insufficient Stars');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { starsBalance: { decrement: amount } },
    });
  }

  async addStars(userId: number, amount: number) {
    if (amount < 0) throw new BadRequestException('Amount must be positive');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { starsBalance: { increment: amount } },
    });
  }

  async addTokens(userId: number, amount: number, type: 'vts' | 'nts') {
    if (amount < 0) throw new BadRequestException('Amount must be positive');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: type === 'vts' 
        ? { vtsBalance: { increment: amount } }
        : { ntsBalance: { increment: amount } },
    });
  }

  async deductTokens(userId: number, amount: number, type: 'vts' | 'nts') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const balance = type === 'vts' ? user.vtsBalance : user.ntsBalance;
    if (balance < amount) {
      throw new BadRequestException(`Insufficient ${type.toUpperCase()} balance`);
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: type === 'vts' 
        ? { vtsBalance: { decrement: amount } }
        : { ntsBalance: { decrement: amount } },
    });
  }

  async updateEnergy(userId: number, energy: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { energy: Math.min(energy, 100) },
    });
  }

  async getUserProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        starsBalance: true,
        vtsBalance: true,
        ntsBalance: true,
        energy: true,
        maxEnergy: true,
        level: true,
        xp: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }
}