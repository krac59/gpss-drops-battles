import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CryptoService {
  async createInvoice(amount: number, currency: string) {
    // Демо-данные для тестирования
    const wallets: Record<string, string> = {
      TON: 'EQD84uoS1fYwqBxDF9f3kcXTgN4HjK5q5q5q5q5q5q5q5q5q5q5q5q5q',
      DOGE: 'D8q5q5q5q5q5q5q5q5q5q5q5q5q5q5q',
      POLYGON: '0x8q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q',
      BNB: '0x8q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q',
      SEI: 'sei1q5q5q5q5q5q5q5q5q5q5q5q5q5q5q',
      TRON: 'TQ5q5q5q5q5q5q5q5q5q5q5q5q5q5q',
    };

    const wallet = wallets[currency.toUpperCase()];
    if (!wallet) {
      throw new BadRequestException(`Unsupported currency: ${currency}`);
    }

    return {
      id: `crypto_${Date.now()}`,
      wallet: wallet,
      amount,
      currency: currency.toUpperCase(),
      memo: `DropsBattle_${Date.now()}`,
    };
  }

  async getCurrencies() {
    return [
      { code: 'TON', name: 'Toncoin', minAmount: 10 },
      { code: 'DOGE', name: 'Dogecoin', minAmount: 50 },
      { code: 'POLYGON', name: 'Polygon', minAmount: 5 },
      { code: 'BNB', name: 'Binance Coin', minAmount: 5 },
      { code: 'SEI', name: 'Sei Network', minAmount: 20 },
      { code: 'TRON', name: 'TRON', minAmount: 100 },
    ];
  }

  async getPaymentStatus(id: string) {
    return {
      id,
      status: 'pending',
      message: 'Payment is being processed',
    };
  }
}