import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReferralService {
  constructor(private prisma: PrismaService, private usersService: UsersService) {}

  async getReferralLink(userId: number) {
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'gccpdrop';
    return { link: `https://t.me/${botUsername}?start=ref_${userId}` };
  }

  async getReferrals(userId: number) {
    const referrals = await this.prisma.referral.findMany({ where: { referrerId: userId } });
    const totalEarned = referrals.filter(r => r.status === 'completed').reduce((s, r) => s + (r.bonusReferrer || 0), 0);
    return { referrals, totalEarned };
  }

  async processReferral(refereeId: number, referrerId: number, depositStars: number) {
    const MIN = 50, PERCENT = 0.1, BONUS = 5;
    if (depositStars < MIN) {
      await this.prisma.referral.create({ data: { referrerId, refereeId, status: 'pending', depositStars } });
      return { status: 'pending', message: `Minimum ${MIN} Stars` };
    }
    const bonusReferrer = depositStars * PERCENT;
    await this.usersService.addTokens(referrerId, bonusReferrer, 'vts');
    await this.usersService.addTokens(refereeId, BONUS, 'vts');
    await this.prisma.referral.updateMany({ where: { refereeId }, data: { status: 'completed', bonusReferrer, bonusReferee: BONUS, completedAt: new Date() } });
    return { status: 'completed', bonusReferrer, bonusReferee: BONUS };
  }
}