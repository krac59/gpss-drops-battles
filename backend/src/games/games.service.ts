import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class GamesService {
  private battleQueue: number[] = [];

  constructor(private prisma: PrismaService, private usersService: UsersService) {}

  async spinWheel(userId: number) {
    await this.usersService.deductStars(userId, 50);
    const rand = Math.random();
    let reward: number;
    let type: 'vts' | 'nts';
    
    if (rand < 0.4) { reward = 10; type = 'vts'; }
    else if (rand < 0.7) { reward = 20; type = 'vts'; }
    else if (rand < 0.9) { reward = 50; type = 'vts'; }
    else { reward = Math.floor(Math.random() * 5) + 1; type = 'nts'; }
    
    await this.usersService.addTokens(userId, reward, type);
    await this.prisma.spin.create({ data: { userId, reward, type } });
    return { reward, type };
  }

  async findBattle(userId: number) {
    await this.usersService.deductStars(userId, 100);
    if (this.battleQueue.length > 0) {
      const opponentId = this.battleQueue.shift()!;
      const opponent = await this.usersService.getUserProfile(opponentId);
      if (!opponent) throw new Error('Opponent not found');
      return { opponent: { id: opponent.id, username: opponent.username || 'Unknown', level: opponent.level } };
    }
    this.battleQueue.push(userId);
    throw new BadRequestException('Waiting for opponent...');
  }

  async fightBattle(userId: number, opponentId: number) {
    const user = await this.usersService.getUserProfile(userId);
    const opponent = await this.usersService.getUserProfile(opponentId);
    if (!user || !opponent) throw new Error('User or opponent not found');
    
    const userPower = (user.level || 1) * 10 + Math.floor(Math.random() * 50);
    const opponentPower = (opponent.level || 1) * 10 + Math.floor(Math.random() * 50);
    const userWins = userPower > opponentPower;
    if (userWins) await this.usersService.addTokens(userId, 150, 'vts');
    await this.prisma.battle.create({
      data: { winnerId: userWins ? userId : opponentId, loserId: userWins ? opponentId : userId, stake: 100, reward: userWins ? 150 : 0 },
    });
    return { winner: userWins ? 'user' : 'opponent', reward: userWins ? 150 : 0, userDamage: Math.floor(Math.random() * 50), opponentDamage: Math.floor(Math.random() * 50) };
  }

  async getBetEvents() {
    return [
      { id: 1, name: '?? ?????? ???????? $70,000 ???????', options: ['?', '??'], endDate: '2026-05-01', totalYes: 1250, totalNo: 890 },
      { id: 2, name: '?? Ethereum ????????? $4000 ?? ????? ???????', options: ['?', '??'], endDate: '2026-05-07', totalYes: 3400, totalNo: 2100 },
    ];
  }

  async placeBet(userId: number, eventId: number, choice: string, amount: number) {
    await this.usersService.deductStars(userId, amount);
    await this.prisma.bet.create({ data: { userId, eventId, choice, amount, status: 'pending' } });
    return { success: true };
  }

  async getPoliticsEvents() {
    return [
      { id: 1, name: '??? ???????? ??????????? ?????? ? 2026?', options: ['?', '??'], endDate: '2026-12-31', totalAmount: 12500, userCount: 245 },
      { id: 2, name: '??? ???? ????? Brent ????????? 250$ ?? ??????? ? 2026?', options: ['?', '??'], endDate: '2026-12-31', totalAmount: 8700, userCount: 189 },
      { id: 3, name: '???? ??????? ??????   ???????? 25% ?? ????? ?????', options: ['?', '??'], endDate: '2026-12-31', totalAmount: 15300, userCount: 312 },
      { id: 4, name: '?? ????????? ? ? ????? ?????? (?? ) ? 2026?', options: ['?', '??'], endDate: '2026-12-31', totalAmount: 6200, userCount: 98 },
    ];
  }

  async placePoliticsBet(userId: number, eventId: number, choice: string, amount: number) {
    await this.usersService.deductStars(userId, amount);
    await this.prisma.politicsBet.create({ data: { userId, eventId, choice, amount, status: 'pending' } });
    return { success: true };
  }

  async getTapState(userId: number) {
    const user = await this.usersService.getUserProfile(userId);
    const pending = await this.prisma.tapSession.findFirst({ where: { userId, claimed: false } });
    return { pendingCoins: pending?.coins || 0, energy: user?.energy || 100 };
  }

  async submitTaps(userId: number, taps: number) {
    const user = await this.usersService.getUserProfile(userId);
    if (!user || user.energy < taps) throw new BadRequestException('Not enough energy');
    await this.prisma.user.update({ where: { id: userId }, data: { energy: { decrement: taps } } });
    let session = await this.prisma.tapSession.findFirst({ where: { userId, claimed: false } });
    if (!session) session = await this.prisma.tapSession.create({ data: { userId, coins: 0 } });
    await this.prisma.tapSession.update({ where: { id: session.id }, data: { coins: { increment: taps } } });
    const updated = await this.prisma.tapSession.findFirst({ where: { userId, claimed: false } });
    const updatedUser = await this.usersService.getUserProfile(userId);
    return { pendingCoins: updated?.coins || 0, energy: updatedUser?.energy || 100 };
  }

  async claimTapReward(userId: number) {
    const session = await this.prisma.tapSession.findFirst({ where: { userId, claimed: false } });
    if (!session || session.coins === 0) throw new BadRequestException('Nothing to claim');
    await this.usersService.addTokens(userId, session.coins, 'vts');
    await this.prisma.tapSession.update({ where: { id: session.id }, data: { claimed: true } });
    return { success: true, amount: session.coins };
  }

  async restoreEnergy(userId: number) {
    const user = await this.usersService.getUserProfile(userId);
    const newEnergy = Math.min(100, (user?.energy || 0) + 5);
    await this.prisma.user.update({ where: { id: userId }, data: { energy: newEnergy } });
    return { energy: newEnergy };
  }
}