import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PaymentsModal from './PaymentsModal';
import CryptoPayment from './CryptoPayment';

interface BalanceProps {
  userId?: number;
  onUpdate?: (user: any) => void;
}

const Balance: React.FC<BalanceProps> = ({ userId, onUpdate }) => {
  const [balance, setBalance] = useState({ starsBalance: 0, vtsBalance: 0, ntsBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [showPayments, setShowPayments] = useState(false);
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/balance', {
        headers: { 'x-user-id': userId?.toString() || '1' }
      });
      setBalance({
        starsBalance: response.data.starsBalance ?? 0,
        vtsBalance: response.data.vtsBalance ?? 0,
        ntsBalance: response.data.ntsBalance ?? 0
      });
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance({ starsBalance: 0, vtsBalance: 0, ntsBalance: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  // Функция для безопасного форматирования чисел
  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString();
  };

  return (
    <>
      <div className="bg-gray-800/90 backdrop-blur-sm p-4 rounded-2xl border border-purple-500/30">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {loading ? '...' : formatNumber(balance.starsBalance)}
              </div>
              <div className="text-xs text-gray-400">Stars</div>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-600 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-2xl">🟢</span>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {loading ? '...' : formatNumber(balance.vtsBalance)}
              </div>
              <div className="text-xs text-gray-400">VTS</div>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-600 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔵</span>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {loading ? '...' : formatNumber(balance.ntsBalance)}
              </div>
              <div className="text-xs text-gray-400">NTS</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowPayments(true)} className="bg-green-600 px-3 py-1 rounded-full text-sm hover:bg-green-500 transition">⭐ Пополнить Stars</button>
            <button onClick={() => setShowCryptoPayment(true)} className="bg-purple-600 px-3 py-1 rounded-full text-sm hover:bg-purple-500 transition">💎 Крипта</button>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          1 VTS ≈ 0.001 Stars | 1 NTS ≈ 0.1 Stars
        </div>
        <div className="mt-2 text-center">
          <button onClick={fetchBalance} disabled={loading} className="text-xs text-gray-400 hover:text-white transition">
            {loading ? 'Обновление...' : '🔄 Обновить баланс'}
          </button>
        </div>
      </div>

      <PaymentsModal isOpen={showPayments} onClose={() => setShowPayments(false)} userId={userId || 1} onSuccess={() => fetchBalance()} />
      <CryptoPayment isOpen={showCryptoPayment} onClose={() => setShowCryptoPayment(false)} userId={userId || 1} onSuccess={() => fetchBalance()} />
    </>
  );
};

export default Balance;