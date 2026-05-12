import React, { useState } from 'react';
import axios from 'axios';

interface BattlesProps {
  userId?: number;
  onUpdate?: (balance: any) => void;
}

const Battles: React.FC<BattlesProps> = ({ userId, onUpdate }) => {
  const [searching, setSearching] = useState(false);
  const [fighting, setFighting] = useState(false);
  const [result, setResult] = useState('');
  const [opponent, setOpponent] = useState<any>(null);

  const findBattle = async () => {
    setSearching(true);
    setResult('');
    setOpponent(null);

    try {
      const response = await axios.post('/api/games/battle/find', {}, {
        headers: { 'x-user-id': userId?.toString() || '1' }
      });
      setOpponent(response.data.opponent);
      setResult(`⚔️ Соперник найден! ${response.data.opponent.username} (уровень ${response.data.opponent.level})`);
    } catch (e: any) {
      const message = e.response?.data?.message || 'Ошибка поиска соперника';
      if (message.includes('Waiting for opponent')) {
        setResult('⏳ Ожидание соперника... Вы в очереди.');
      } else if (message.includes('Insufficient')) {
        setResult('❌ Недостаточно Stars! Нужно 100 Stars.');
      } else {
        setResult(`❌ ${message}`);
      }
    } finally {
      setSearching(false);
    }
  };

  const fight = async () => {
    if (!opponent) return;
    setFighting(true);

    try {
      const response = await axios.post('/api/games/battle/fight', 
        { opponentId: opponent.id },
        { headers: { 'x-user-id': userId?.toString() || '1' } }
      );
      const { winner, reward } = response.data;
      
      if (winner === 'user') {
        setResult(`🏆 ПОБЕДА! Вы выиграли ${reward} VTS!`);
        // Обновляем баланс
        if (onUpdate) {
          const balanceRes = await axios.get('/api/users/balance', {
            headers: { 'x-user-id': userId?.toString() || '1' }
          });
          onUpdate(balanceRes.data);
        }
      } else {
        setResult(`💀 ПОРАЖЕНИЕ! Соперник победил. Вы проиграли 100 Stars.`);
        if (onUpdate) {
          const balanceRes = await axios.get('/api/users/balance', {
            headers: { 'x-user-id': userId?.toString() || '1' }
          });
          onUpdate(balanceRes.data);
        }
      }
      setOpponent(null);
    } catch (e: any) {
      setResult(`❌ ${e.response?.data?.message || 'Ошибка боя'}`);
    } finally {
      setFighting(false);
    }
  };

  const cancel = () => {
    setOpponent(null);
    setResult('');
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm p-4 rounded-2xl">
      <div className="text-2xl font-bold text-center mb-4">⚔️ Батлы 1v1</div>
      
      {result && !opponent && (
        <div className={`mb-4 text-center p-3 rounded-lg ${
          result.includes('ПОБЕДА') ? 'bg-green-600/30 text-green-300' : 
          result.includes('ПОРАЖЕНИЕ') ? 'bg-red-600/30 text-red-300' : 
          result.includes('Ожидание') ? 'bg-yellow-600/30 text-yellow-300' :
          'bg-blue-600/30 text-blue-300'
        }`}>
          {result}
        </div>
      )}
      
      {!opponent ? (
        <button
          onClick={findBattle}
          disabled={searching}
          className={`w-full py-3 rounded-full text-lg font-bold transition-all ${
            searching
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-600 to-orange-600 hover:opacity-90 active:scale-95'
          }`}
        >
          {searching ? 'Поиск соперника...' : 'Найти соперника за 100 Stars'}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-xl text-center">
            <div className="text-lg font-bold">Противник</div>
            <div className="text-3xl my-2">{opponent.username}</div>
            <div className="text-sm text-gray-400">Уровень {opponent.level}</div>
          </div>
          <button
            onClick={fight}
            disabled={fighting}
            className="w-full py-3 rounded-full text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 active:scale-95"
          >
            {fighting ? 'Бой...' : '⚔️ Начать бой'}
          </button>
          <button
            onClick={cancel}
            className="w-full py-2 rounded-full text-sm bg-gray-600 hover:bg-gray-500 transition"
          >
            Отмена
          </button>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-400 text-center">
        ⚔️ Ставка: 100 Stars | Победитель получает 150 VTS
      </div>
    </div>
  );
};

export default Battles;