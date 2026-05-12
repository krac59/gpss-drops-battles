import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentGatewayService {
  async getCurrencies(): Promise<string[]> {
    return ['BTC', 'ETH', 'USDT', 'TON'];
  }

  async createNowPaymentsInvoice(amount: number, currency: string) {
    return { id: 'test', url: 'https://test.com', amount, currency };
  }

  async checkNowPaymentsStatus(id: string): Promise<string> {
    return 'pending';
  }

  verifyIpnSignature(body: any, signature: string): boolean {
    return true;
  }

  async handleWebhook(body: any) {
    console.log('Webhook received:', body);
    return { received: true };
  }

  async createCryptomusInvoice(amount: number, currency: string) {
    return { id: 'test', url: 'https://test.com', amount, currency };
  }

  async checkCryptomusStatus(orderId: string): Promise<string> {
    return 'pending';
  }
}