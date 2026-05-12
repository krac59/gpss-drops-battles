import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async checkAdmin(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }

  async getStats() {
    const totalUsers = await this.prisma.user.count();
    const activeToday = await this.prisma.user.count({
      where: { updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
    const totalSpins = await this.prisma.spin.count();
    const totalBattles = await this.prisma.battle.count();
    return { totalUsers, activeToday, totalSpins, totalBattles };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true, telegramId: true, username: true, firstName: true, lastName: true,
        role: true, starsBalance: true, vtsBalance: true, ntsBalance: true,
        energy: true, level: true,
      },
    });
  }

  async updateUserBalance(userId: number, vts?: number, nts?: number, stars?: number, role?: string) {
    const updateData: any = {};
    if (vts !== undefined) updateData.vtsBalance = vts;
    if (nts !== undefined) updateData.ntsBalance = nts;
    if (stars !== undefined) updateData.starsBalance = stars;
    if (role !== undefined) updateData.role = role;
    return this.prisma.user.update({ where: { id: userId }, data: updateData });
  }

  async getWallets() {
    return this.prisma.walletConfig.findMany();
  }

  async updateWallet(currency: string, address: string) {
    const existing = await this.prisma.walletConfig.findUnique({ where: { currency } });
    if (existing) {
      return this.prisma.walletConfig.update({
        where: { currency },
        data: { address, isActive: true },
      });
    }
    return this.prisma.walletConfig.create({
      data: { currency, address, isActive: true },
    });
  }

  async addWallet(currency: string, address: string, minAmount: number) {
    // minAmount пока не используется
    return this.prisma.walletConfig.create({
      data: { currency, address, isActive: true },
    });
  }

  async toggleWallet(currency: string, isActive: boolean) {
    return this.prisma.walletConfig.update({
      where: { currency },
      data: { isActive },
    });
  }

  async getPayments() {
    return [];
  }

  async getExchangeRates() {
    return [
      { currency: 'TON', rate: 5.2, updatedAt: new Date().toISOString() },
      { currency: 'NOT', rate: 0.008, updatedAt: new Date().toISOString() },
      { currency: 'USDT', rate: 1, updatedAt: new Date().toISOString() },
    ];
  }

  async updateExchangeRate(currency: string, rate: number) {
    return { currency, rate, updatedAt: new Date().toISOString() };
  }

  async sendGlobalBonus(amount: number, type: 'vts' | 'nts' | 'stars') {
    const users = await this.prisma.user.findMany();
    for (const user of users) {
      if (type === 'stars') {
        await this.usersService.addStars(user.id, amount);
      } else if (type === 'vts') {
        await this.usersService.addTokens(user.id, amount, 'vts');
      } else if (type === 'nts') {
        await this.usersService.addTokens(user.id, amount, 'nts');
      }
    }
    return { success: true, count: users.length };
  }

  async sendNotificationToAll(title: string, content: string) {
    console.log(`Notification to all: ${title} - ${content}`);
    return { success: true, message: 'Notification sent' };
  }
}