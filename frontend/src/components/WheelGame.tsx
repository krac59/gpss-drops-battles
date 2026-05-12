import React, { useState } from 'react';
import axios from 'axios';

interface WheelGameProps {
  userId?: number;
  onUpdate?: (balance: any) => void;
}

const WheelGame: React.FC<WheelGameProps> = ({ userId, onUpdate }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState('');

  const spin = async () => {
    setSpinning(true);
    setResult('');

    try {
      const response = await axios.post('/api/games/wheel/spin', {}, {
        headers: { 'x-user-id': userId?.toString() || '1' }
      });
      const { reward, type } = response.data;
      setResult(`🎉 Вы выиграли ${reward} ${type.toUpperCase()}!`);
      
      // Обновляем баланс
      if (onUpdate) {
        const balanceRes = await axios.get('/api/users/balance', {
          headers: { 'x-user-id': userId?.toString() || '1' }
        });
        onUpdate(balanceRes.data);
      }
    } catch (e: any) {
      const message = e.response?.data?.message || 'Ошибка при вращении';
      if (message.includes('Insufficient')) {
        setResult(`❌ Недостаточно Stars! Нужно 50 Stars.`);
      } else {
        setResult(`❌ ${message}`);
      }
    } finally {
      setSpinning(false);
    }
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm p-4 rounded-2xl">
      <div className="text-2xl font-bold text-center mb-4">🎡 Колесо фортуны</div>
      <div className="relative w-64 h-64 mx-auto mb-6">
        <div className={`w-full h-full rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 flex items-center justify-center shadow-2xl ${spinning ? 'animate-spin-slow' : ''}`}>
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <div className="text-6xl">🎡</div>
          </div>
        </div>
      </div>
      <button
        onClick={spin}
        disabled={spinning}
        className={`w-full py-3 rounded-full text-xl font-bold transition-all ${
          spinning
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:opacity-90 active:scale-95'
        }`}
      >
        {spinning ? 'Крутится...' : 'Крутить за 50 Stars'}
      </button>
      {result && (
        <div className={`mt-4 text-center p-3 rounded-lg ${
          result.includes('🎉') ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'
        }`}>
          {result}
        </div>
      )}
    </div>
  );
};

export default WheelGame;