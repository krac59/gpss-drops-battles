import { Controller, Post, Get, Body, Param, Req, Headers, UnauthorizedException } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { TonkeeperService } from './tonkeeper.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentGateway: PaymentGatewayService,
    private tonkeeper: TonkeeperService,
  ) {}

  // ============ Tonkeeper ============
  
  @Get('tonkeeper/currencies')
  async getTonkeeperCurrencies() {
    return {
      currencies: this.tonkeeper.getSupportedCurrencies(),
      rates: await this.tonkeeper.getExchangeRates(),
      minAmounts: this.tonkeeper.getSupportedCurrencies().map(c => ({
        currency: c,
        minAmount: this.tonkeeper.getMinAmount(c),
      })),
    };
  }

  @Post('tonkeeper/generate')
  async generateTonkeeperAddress(@Body() body: { 
    currency: string; 
    amount: number; 
    orderId: string;
    lifetime?: number;
  }) {
    return this.tonkeeper.generateAddress({
      currency: body.currency,
      amount: body.amount,
      orderId: body.orderId,
      lifetime: body.lifetime,
    });
  }

  @Post('tonkeeper/not/create')
  async createNotPayment(@Body() body: { amount: number; orderId: string }) {
    return this.tonkeeper.createNotPayment({
      amount: body.amount,
      orderId: body.orderId,
    });
  }

  @Get('tonkeeper/status/:paymentId')
  async getTonkeeperStatus(@Param('paymentId') paymentId: string) {
    return this.tonkeeper.checkPaymentStatus(paymentId);
  }

  @Post('tonkeeper/webhook')
  async tonkeeperWebhook(@Body() payload: any) {
    return this.tonkeeper.handleWebhook(payload);
  }

  @Post('tonkeeper/validate')
  async validateAddress(@Body() body: { address: string; currency: string }) {
    const isValid = await this.tonkeeper.validateAddress(body.address, body.currency);
    return { valid: isValid };
  }

  // ============ NowPayments ============
  
  @Get('nowpayments/currencies')
  async getNowPaymentsCurrencies() {
    return this.paymentGateway.getCurrencies();
  }

  @Post('nowpayments/create')
  async createNowPaymentsPayment(@Body() body: { amount: number; currency: string; orderId: string }) {
    return this.paymentGateway.createNowPaymentsInvoice(body.amount, body.currency);
  }

  @Post('nowpayments/invoice')
  async createNowPaymentsInvoice(@Body() body: { amount: number; currency: string; orderId: string }) {
    return this.paymentGateway.createNowPaymentsInvoice(body.amount, body.currency);
  }

  @Post('nowpayments/webhook')
  async nowPaymentsWebhook(@Req() req: Request, @Headers('x-nowpayments-sig') signature: string) {
    const isValid = this.paymentGateway.verifyIpnSignature(req.body, signature);
    if (!isValid) throw new UnauthorizedException('Invalid signature');
    return this.paymentGateway.handleWebhook(req.body);
  }

  @Get('nowpayments/status/:id')
  async getNowPaymentsStatus(@Param('id') id: string) {
    return { status: await this.paymentGateway.checkNowPaymentsStatus(id) };
  }

  // ============ Cryptomus ============
  
  @Post('cryptomus/create')
  async createCryptomusPayment(@Body() body: { amount: number; currency: string; orderId: string }) {
    return this.paymentGateway.createCryptomusInvoice(body.amount, body.currency);
  }

  @Get('cryptomus/status/:orderId')
  async getCryptomusStatus(@Param('orderId') orderId: string) {
    return { status: await this.paymentGateway.checkCryptomusStatus(orderId) };
  }

  // ============ Stars (Telegram) ============
  
  @Post('stars/create')
  async createStarsInvoice(@Body('amount') amount: number, @Req() req) {
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : 1;
    return {
      id: `inv_${Date.now()}`,
      url: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=pay_${userId}_${amount}`,
      amount,
      currency: 'STARS',
    };
  }

  // ============ Общие методы ============
  
  @Get('crypto/currencies')
  async getCryptoCurrencies() {
    const tonkeeperCurrencies = this.tonkeeper.getSupportedCurrencies();
    return tonkeeperCurrencies.map(currency => ({
      code: currency,
      name: this.getCurrencyName(currency),
      minAmount: this.tonkeeper.getMinAmount(currency),
      supportedBy: 'tonkeeper',
    }));
  }

  @Get('status/:id')
  async getPaymentStatus(@Param('id') id: string) {
    return {
      id,
      status: 'pending',
      message: 'Payment is being processed. Will be confirmed within 10-30 minutes.',
    };
  }

  private getCurrencyName(currency: string): string {
    const names: Record<string, string> = {
      TON: 'Toncoin',
      NOT: 'Notcoin (Telegram)',
      USDT: 'Tether USD',
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      BNB: 'Binance Coin',
      DOGE: 'Dogecoin',
      TRX: 'TRON',
      SOL: 'Solana',
      MATIC: 'Polygon',
      AVAX: 'Avalanche',
      LTC: 'Litecoin',
      DOT: 'Polkadot',
      UNI: 'Uniswap',
      LINK: 'Chainlink',
      DAI: 'Dai',
      SHIB: 'Shiba Inu',
      PEPE: 'Pepe',
    };
    return names[currency] || currency;
  }
}