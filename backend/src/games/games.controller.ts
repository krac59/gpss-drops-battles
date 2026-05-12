import { Controller, Post, Get, Req, Body } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  private getUserId(req: any): number {
    return req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : 1;
  }

  @Post('wheel/spin')
  async spinWheel(@Req() req) { return this.gamesService.spinWheel(this.getUserId(req)); }

  @Post('battle/find')
  async findBattle(@Req() req) { return this.gamesService.findBattle(this.getUserId(req)); }

  @Post('battle/fight')
  async fightBattle(@Req() req, @Body('opponentId') opponentId: number) { return this.gamesService.fightBattle(this.getUserId(req), opponentId); }

  @Get('bets/events')
  async getBetEvents() { return this.gamesService.getBetEvents(); }

  @Post('bets/place')
  async placeBet(@Req() req, @Body() body: { eventId: number; choice: string; amount: number }) { return this.gamesService.placeBet(this.getUserId(req), body.eventId, body.choice, body.amount); }

  @Get('politics/events')
  async getPoliticsEvents() { return this.gamesService.getPoliticsEvents(); }

  @Post('politics/place')
  async placePoliticsBet(@Req() req, @Body() body: { eventId: number; choice: string; amount: number }) { return this.gamesService.placePoliticsBet(this.getUserId(req), body.eventId, body.choice, body.amount); }

  @Get('tap/state')
  async getTapState(@Req() req) { return this.gamesService.getTapState(this.getUserId(req)); }

  @Post('tap/submit')
  async submitTaps(@Req() req, @Body('taps') taps: number) { return this.gamesService.submitTaps(this.getUserId(req), taps); }

  @Post('tap/claim')
  async claimTapReward(@Req() req) { return this.gamesService.claimTapReward(this.getUserId(req)); }

  @Post('tap/restore')
  async restoreEnergy(@Req() req) { return this.gamesService.restoreEnergy(this.getUserId(req)); }
}