import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { createHash, createHmac } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateTelegramUser(initData: string) {
    // 1. Проверяем подпись Telegram
    const isValid = this.verifyTelegramInitData(initData);
    if (!isValid) {
      throw new UnauthorizedException('Invalid Telegram data');
    }

    // 2. Извлекаем данные пользователя из initData
    const params = new URLSearchParams(initData);
    const userJson = params.get('user');
    if (!userJson) {
      throw new UnauthorizedException('No user data');
    }

    const telegramUser = JSON.parse(userJson);
    
    // 3. Ищем или создаём пользователя в БД
    let user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramUser.id) },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId: BigInt(telegramUser.id),
          username: telegramUser.username,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          role: telegramUser.id === parseInt(process.env.ADMIN_TELEGRAM_ID || '0') ? 'admin' : 'user',
          starsBalance: 0,
          vtsBalance: 0,
          ntsBalance: 0,
        },
      });
    }

    // 4. Генерируем JWT токен
    const token = this.jwtService.sign({
      sub: user.id,
      telegramId: user.telegramId.toString(),
      role: user.role,
    });

    return { user, token };
  }

  private verifyTelegramInitData(initData: string): boolean {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.warn('TELEGRAM_BOT_TOKEN not set, skipping verification');
      return true; // В разработке без токена пропускаем
    }

    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;

    params.delete('hash');
    const paramsArray = Array.from(params.entries());
    paramsArray.sort(([a], [b]) => a.localeCompare(b));
    const dataCheckString = paramsArray.map(([k, v]) => `${k}=${v}`).join('\n');
    
    const secretKey = createHash('sha256').update(botToken).digest();
    const computedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return computedHash === hash;
  }
}