import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

const DAILY_BONUS_AMOUNTS = [0, 5, 10, 20, 40, 80, 150, 300];

@Injectable()
export class BonusService {
  constructor(private prisma: PrismaService, private usersService: UsersService) {}

  async getBonusInfo(userId: number) {
    const record = await this.prisma.userBonus.findFirst({ where: { userId } });
    const today = new Date().toDateString();
    const lastClaim = record?.lastClaimDate?.toDateString();
    const canClaim = lastClaim !== today;
    let streak = record?.streak || 0;
    if (!canClaim) streak = record?.streak || 0;
    else if (lastClaim !== today && record?.streak) streak = (record.streak % 7) + 1;
    else if (!record) streak = 1;
    const amount = DAILY_BONUS_AMOUNTS[Math.min(streak, 7)];
    return { day: streak, amount, canClaim };
  }

  async claimBonus(userId: number) {
    const info = await this.getBonusInfo(userId);
    if (!info.canClaim) throw new BadRequestException('Already claimed today');
    const newStreak = (info.day % 7) + 1;
    await this.prisma.userBonus.upsert({
      where: { id: userId },
      update: { streak: newStreak, lastClaimDate: new Date() },
      create: { userId, streak: newStreak, lastClaimDate: new Date() },
    });
    await this.usersService.addTokens(userId, info.amount, 'vts');
    return { amount: info.amount };
  }
}