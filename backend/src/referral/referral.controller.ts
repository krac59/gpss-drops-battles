import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ReferralService } from './referral.service';

@Controller('referral')
export class ReferralController {
  constructor(private referralService: ReferralService) {}

  private getUserId(req: any): number {
    return req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : 1;
  }

  @Get('link')
  async getLink(@Req() req) { return this.referralService.getReferralLink(this.getUserId(req)); }

  @Get('list')
  async getReferrals(@Req() req) { return this.referralService.getReferrals(this.getUserId(req)); }

  @Post('process')
  async process(@Body() body: { refereeId: number; referrerId: number; depositStars: number }) {
    return this.referralService.processReferral(body.refereeId, body.referrerId, body.depositStars);
  }
}