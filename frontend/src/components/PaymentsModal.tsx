import React, { useState } from 'react';
import axios from 'axios';

interface PaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onSuccess?: (amount: number, currency: string) => void;
}

const PaymentsModal: React.FC<PaymentsModalProps> = ({ isOpen, onClose, userId, onSuccess }) => {
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<{ url: string; amount: number } | null>(null);

  const handleStarsPayment = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/payments/stars/create', { amount });
      setInvoice({ url: response.data.url, amount: response.data.amount });
      if (onSuccess) onSuccess(amount, 'Stars');
    } catch (error) {
      alert('Ошибка создания платежа. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">⭐ Пополнение Stars</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>

        {!invoice ? (
          <>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Сумма (Stars)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-xl font-bold"
                />
                <span className="bg-gray-700 px-4 py-2 rounded-lg text-xl">⭐</span>
              </div>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              {[50, 100, 250, 500, 1000].map(s => (
                <button key={s} onClick={() => setAmount(s)} className="px-3 py-1 bg-gray-700 rounded-full text-sm hover:bg-gray-600">
                  {s}
                </button>
              ))}
            </div>

            <button onClick={handleStarsPayment} disabled={loading || amount <= 0} className="w-full bg-green-600 py-3 rounded-full font-bold text-lg disabled:opacity-50">
              {loading ? 'Создание...' : `⭐ Оплатить ${amount} Stars`}
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="text-5xl mb-4">⭐</div>
            <p className="text-lg font-bold mb-2">Перейдите к оплате</p>
            <p className="text-gray-400 mb-4">Сумма: {invoice.amount} Stars</p>
            <a href={invoice.url} target="_blank" rel="noopener noreferrer" className="block w-full bg-blue-600 py-3 rounded-full font-bold mb-3">
              Оплатить через Telegram
            </a>
            <button onClick={onClose} className="text-gray-400 text-sm">Закрыть</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsModal;