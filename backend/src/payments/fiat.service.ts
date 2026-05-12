import { Injectable } from '@nestjs/common';
@Injectable()
export class FiatService {
  async createInvoice(amount: number) { throw new Error('Fiat payments disabled. Use Stars or Crypto.'); }
}