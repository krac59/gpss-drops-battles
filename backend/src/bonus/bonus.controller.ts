import { Controller, Get, Post, Req } from '@nestjs/common';
import { BonusService } from './bonus.service';

@Controller('bonus')
export class BonusController {
  constructor(private bonusService: BonusService) {}

  private getUserId(req: any): number {
    return req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : 1;
  }

  @Get('info')
  async getInfo(@Req() req) { return this.bonusService.getBonusInfo(this.getUserId(req)); }

  @Post('claim')
  async claim(@Req() req) { return this.bonusService.claimBonus(this.getUserId(req)); }
}