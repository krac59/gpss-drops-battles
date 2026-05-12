import axios from 'axios';

export interface Invoice {
  id: string;
  url: string;
  amount: number;
  currency: string;
  wallet?: string;
  memo?: string;
}

export const paymentService = {
  // Telegram Stars
  async createStarsInvoice(amount: number): Promise<Invoice> {
    const response = await axios.post('/api/payments/stars/create', { amount });
    return response.data;
  },

  // Криптовалюты
  async createCryptoInvoice(amount: number, currency: string): Promise<Invoice> {
    const response = await axios.post('/api/payments/crypto/create', { amount, currency });
    return response.data;
  },

  // Проверка статуса платежа
  async checkPaymentStatus(invoiceId: string): Promise<{ status: string; transactionId?: string }> {
    const response = await axios.get(`/api/payments/status/${invoiceId}`);
    return response.data;
  },

  // Список доступных криптовалют
  async getCryptoCurrencies(): Promise<{ code: string; name: string; minAmount: number }[]> {
    const response = await axios.get('/api/payments/crypto/currencies');
    return response.data;
  }
};