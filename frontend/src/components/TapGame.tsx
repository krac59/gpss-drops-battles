import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface TapGameProps {
  userId?: number;
  onUpdate?: (balance: any) => void;
}

const TapGame: React.FC<TapGameProps> = ({ userId, onUpdate }) => {
  const [coins, setCoins] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [lastTapTime, setLastTapTime] = useState(0);
  const tapQueue = useRef<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Загрузка состояния с сервера
  const fetchTapState = async () => {
    try {
      const response = await axios.get('/api/games/tap/state', {
        headers: { 'x-user-id': userId?.toString() || '1' }
      });
      setCoins(response.data.pendingCoins);
      setEnergy(response.data.energy);
    } catch (error) {
      console.error('Failed to fetch tap state:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTapState();
    }
  }, [userId]);

  // Восстановление энергии каждые 5 секунд
  useEffect(() => {
    const interval = setInterval(async () => {
      if (energy < 100) {
        try {
          const response = await axios.post('/api/games/tap/restore', {}, {
            headers: { 'x-user-id': userId?.toString() || '1' }
          });
          setEnergy(response.data.energy);
        } catch (error) {
          console.error('Energy restore error:', error);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [energy, userId]);

  // Отправка накопленных тапов на сервер каждые 2 секунды
  useEffect(() => {
    const sendInterval = setInterval(async () => {
      if (tapQueue.current.length > 0) {
        const tapsToSend = tapQueue.current.length;
        tapQueue.current = [];
        try {
          const response = await axios.post('/api/games/tap/submit', 
            { taps: tapsToSend },
            { headers: { 'x-user-id': userId?.toString() || '1' } }
          );
          setCoins(response.data.pendingCoins);
          setEnergy(response.data.energy);
        } catch (error) {
          console.error('Submit taps error:', error);
          tapQueue.current.push(...Array(tapsToSend).fill(0));
        }
      }
    }, 2000);
    return () => clearInterval(sendInterval);
  }, [userId]);

  const handleTap = () => {
    const now = Date.now();
    if (energy <= 0) {
      alert('Энергия закончилась! Ждите восстановления.');
      return;
    }
    if (now - lastTapTime < 100) return;
    setLastTapTime(now);
    setEnergy(prev => Math.max(0, prev - 1));
    tapQueue.current.push(now);
  };

  const claimCoins = async () => {
    if (coins === 0) return;
    setLoading(true);
    try {
      const response = await axios.post('/api/games/tap/claim', {},
        { headers: { 'x-user-id': userId?.toString() || '1' } }
      );
      if (response.data.success) {
        alert(`Вы получили ${coins} VTS!`);
        setCoins(0);
        // Обновляем баланс пользователя через колбэк
        if (onUpdate) {
          const balanceRes = await axios.get('/api/users/balance', {
            headers: { 'x-user-id': userId?.toString() || '1' }
          });
          onUpdate(balanceRes.data);
        }
      }
    } catch (error) {
      alert('Ошибка при получении VTS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-yellow-800 to-orange-800 p-6 rounded-2xl text-center shadow-2xl border border-yellow-400">
      <div className="text-3xl font-bold mb-2">👆 Тапалка</div>
      <div className="relative cursor-pointer inline-block" onClick={handleTap}>
        <div className="text-9xl transition-transform active:scale-95 drop-shadow-2xl">
          🪙
        </div>
      </div>
      <div className="mt-6">
        <div className="text-3xl font-bold text-yellow-300">💰 {coins} VTS</div>
        <div className="text-xs text-gray-300 mt-1">Накоплено за сессию</div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Энергия</span>
          <span>{Math.floor(energy)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-green-500 to-yellow-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${energy}%` }}
          />
        </div>
      </div>
      <button
        onClick={claimCoins}
        disabled={coins === 0 || loading}
        className={`mt-6 w-full py-3 rounded-full font-bold text-black transition-all ${
          coins > 0 && !loading
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 active:scale-95'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        {loading ? 'Обработка...' : `Забрать ${coins} VTS`}
      </button>
    </div>
  );
};

export default TapGame;