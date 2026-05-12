import { Injectable } from '@nestjs/common';
@Injectable()
export class StarsService {
  async createInvoice(userId: number, amount: number) {
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'gccpdrop';
    return { id: `inv_${Date.now()}`, url: `https://t.me/${botUsername}?start=pay_${userId}_${amount}`, amount, currency: 'STARS' };
  }
}