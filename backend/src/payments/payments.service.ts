import { Injectable } from '@nestjs/common';
import { StarsService } from './stars.service';
import { CryptoService } from './crypto.service';
import { FiatService } from './fiat.service';

@Injectable()
export class PaymentsService {
  constructor(private starsService: StarsService, private cryptoService: CryptoService, private fiatService: FiatService) {}
  async createStarsInvoice(userId: number, amount: number) { return this.starsService.createInvoice(userId, amount); }
  async createCryptoInvoice(amount: number, currency: string) { return this.cryptoService.createInvoice(amount, currency); }
  async createFiatInvoice(amount: number) { return this.fiatService.createInvoice(amount); }
}