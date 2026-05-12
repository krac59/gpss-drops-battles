import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

export interface TonkeeperPayment {
  id: string;
  address: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'expired' | 'failed';
  createdAt: Date;
  expiresAt: Date;
  txHash?: string;
}

export interface TonkeeperWebhookPayload {
  payment_id: string;
  status: string;
  amount: string;
  currency: string;
  tx_hash?: string;
  from_address?: string;
}

@Injectable()
export class TonkeeperService {
  private apiKey = process.env.TONKEEPER_API_KEY || '';
  private apiUrl = 'https://api.tonkeeper.com/v1';
  private webhookSecret = process.env.TONKEEPER_WEBHOOK_SECRET || '';

  // Поддерживаемые валюты
  private supportedCurrencies: string[] = [
    'TON', 'NOT', 'USDT', 'BTC', 'ETH', 'BNB', 
    'DOGE', 'TRX', 'SOL', 'MATIC', 'AVAX', 'LTC', 
    'DOT', 'UNI', 'LINK', 'DAI', 'SHIB', 'PEPE'
  ];

  // Минимальные суммы для каждой валюты
  private minAmounts: Record<string, number> = {
    TON: 1,
    NOT: 1000,
    USDT: 10,
    BTC: 0.0001,
    ETH: 0.01,
    BNB: 0.05,
    DOGE: 50,
    TRX: 100,
    SOL: 0.5,
    MATIC: 5,
    AVAX: 1,
    LTC: 0.1,
    DOT: 5,
    UNI: 1,
    LINK: 2,
    DAI: 10,
    SHIB: 100000,
    PEPE: 1000000,
  };

  // Генерация адреса для получения платежа
  async generateAddress(params: {
    currency: string;
    amount?: number;
    orderId: string;
    lifetime?: number;
  }): Promise<TonkeeperPayment> {
    const currencyUpper = params.currency.toUpperCase();
    
    if (!this.supportedCurrencies.includes(currencyUpper)) {
      throw new BadRequestException(`Currency ${currencyUpper} not supported by Tonkeeper`);
    }

    const minAmount = this.getMinAmount(currencyUpper);
    if (params.amount && params.amount < minAmount) {
      throw new BadRequestException(`Minimum amount for ${currencyUpper} is ${minAmount}`);
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/payments`,
        {
          currency: currencyUpper.toLowerCase(),
          amount: params.amount,
          order_id: params.orderId,
          lifetime: params.lifetime || 3600,
          callback_url: `${process.env.API_URL}/api/payments/tonkeeper/webhook`,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-Webhook-Secret': this.webhookSecret,
          },
        }
      );

      return {
        id: response.data.payment_id,
        address: response.data.address,
        amount: response.data.amount,
        currency: response.data.currency,
        status: response.data.status || 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + (params.lifetime || 3600) * 1000),
      };
    } catch (error) {
      console.error('Tonkeeper generate address error:', error.response?.data || error.message);
      throw new BadRequestException('Failed to generate payment address');
    }
  }

  // Создание платежа для NOT (Telegram Coin)
  async createNotPayment(params: {
    amount: number;
    orderId: string;
  }): Promise<TonkeeperPayment> {
    return this.generateAddress({
      currency: 'NOT',
      amount: params.amount,
      orderId: params.orderId,
    });
  }

  // Проверка статуса платежа
  async checkPaymentStatus(paymentId: string): Promise<TonkeeperPayment> {
    try {
      const response = await axios.get(`${this.apiUrl}/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });

      return {
        id: response.data.payment_id,
        address: response.data.address,
        amount: response.data.amount,
        currency: response.data.currency,
        status: response.data.status,
        createdAt: new Date(response.data.created_at),
        expiresAt: new Date(response.data.expires_at),
        txHash: response.data.tx_hash,
      };
    } catch (error) {
      console.error('Tonkeeper status check error:', error.message);
      throw new BadRequestException('Failed to check payment status');
    }
  }

  // Получение курсов валют
  async getExchangeRates(): Promise<Record<string, number>> {
    try {
      const response = await axios.get(`${this.apiUrl}/rates`, {
        params: { base: 'USD' },
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });
      return response.data.rates;
    } catch (error) {
      console.error('Failed to get exchange rates, using fallback:', error.message);
      return {
        TON: 5.2,
        NOT: 0.008,
        USDT: 1,
        BTC: 60000,
        ETH: 3000,
        BNB: 500,
        DOGE: 0.15,
        TRX: 0.12,
        SOL: 140,
        MATIC: 0.8,
        AVAX: 35,
        LTC: 80,
        DOT: 7,
        UNI: 8,
        LINK: 15,
        DAI: 1,
        SHIB: 0.00002,
        PEPE: 0.00001,
      };
    }
  }

  // Обработка вебхука
  async handleWebhook(payload: TonkeeperWebhookPayload): Promise<{ received: boolean; status: string }> {
    console.log(`Tonkeeper webhook received: ${payload.payment_id} -> ${payload.status}`);
    
    switch (payload.status) {
      case 'paid':
        await this.confirmPayment(payload.payment_id, payload.tx_hash);
        return { received: true, status: 'payment_confirmed' };
      case 'expired':
        console.log(`Payment ${payload.payment_id} expired`);
        return { received: true, status: 'payment_expired' };
      case 'failed':
        console.log(`Payment ${payload.payment_id} failed`);
        return { received: true, status: 'payment_failed' };
      default:
        console.log(`Payment ${payload.payment_id} status: ${payload.status}`);
        return { received: true, status: 'pending' };
    }
  }

  private async confirmPayment(paymentId: string, txHash?: string): Promise<void> {
    // Здесь будет логика начисления средств пользователю
    console.log(`✅ Payment ${paymentId} confirmed! Transaction: ${txHash}`);
    // TODO: Обновить баланс пользователя в базе данных
  }

  // Получение списка поддерживаемых валют
  getSupportedCurrencies(): string[] {
    return this.supportedCurrencies;
  }

  // Получение минимальной суммы для валюты
  getMinAmount(currency: string): number {
    const amount = this.minAmounts[currency.toUpperCase()];
    return amount || 10;
  }

  // Валидация адреса кошелька
  async validateAddress(address: string, currency: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/validate`,
        { address, currency: currency.toLowerCase() },
        { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
      );
      return response.data.valid;
    } catch (error) {
      console.error('Address validation error:', error.message);
      return address.length > 20; // fallback
    }
  }
}