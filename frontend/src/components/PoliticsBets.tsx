import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PoliticsBetsProps {
  userId?: number;
  onUpdate?: (balance: any) => void;
}

interface PoliticsEvent {
  id: number;
  name: string;
  options: string[];
  endDate: string;
  totalAmount: number;
  userCount: number;
  userBet?: string;
}

const PoliticsBets: React.FC<PoliticsBetsProps> = ({ userId, onUpdate }) => {
  const [events, setEvents] = useState<PoliticsEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const demoEvents: PoliticsEvent[] = [
    { id: 1, name: '🏛️ Досрочное отстранение Трампа в 2026?', options: ['Да', 'Нет'], endDate: '2026-12-31', totalAmount: 12500, userCount: 245 },
    { id: 2, name: '🛢️ Нефть марки Brent достигнет 250$ за баррель в 2026?', options: ['Да', 'Нет'], endDate: '2026-12-31', totalAmount: 8700, userCount: 189 },
    { id: 3, name: '🇷🇺 Ключевая ставка ЦБ РФ превысит 25% до конца года?', options: ['Да', 'Нет'], endDate: '2026-12-31', totalAmount: 15300, userCount: 312 },
    { id: 4, name: '🌍 Вступление в БРИКС новой страны (не РФ) в 2026?', options: ['Да', 'Нет'], endDate: '2026-12-31', totalAmount: 6200, userCount: 98 },
  ];

  const fetchEvents = async () => {
    try {
      setFetchLoading(true);
      const response = await axios.get('/api/games/politics/events', {
        headers: { 'x-user-id': userId?.toString() || '1' }
      });
      if (response.data && response.data.length > 0) {
        setEvents(response.data);
      } else {
        setEvents(demoEvents);
      }
    } catch (error) {
      console.error('Failed to fetch politics events, using demo data:', error);
      setEvents(demoEvents);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [userId]);

  const placeBet = async (eventId: number, choice: string) => {
    setLoading(true);
    try {
      await axios.post('/api/games/politics/place', 
        { eventId, choice, amount: 50 },
        { headers: { 'x-user-id': userId?.toString() || '1' } }
      );
      alert(`Политическая ставка "${choice}" принята!`);
      
      if (onUpdate) {
        const balanceRes = await axios.get('/api/users/balance', {
          headers: { 'x-user-id': userId?.toString() || '1' }
        });
        onUpdate(balanceRes.data);
      }
      
      await fetchEvents();
    } catch (e: any) {
      const message = e.response?.data?.message || 'Ошибка при размещении ставки';
      if (message.includes('Insufficient')) {
        alert('Недостаточно VTS! Нужно 50 VTS для ставки.');
      } else {
        alert(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="bg-gray-800/90 backdrop-blur-sm p-4 rounded-2xl text-center">
        <div className="text-gray-400">Загрузка политических событий...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm p-4 rounded-2xl border border-purple-500/50">
      <div className="text-2xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
        🏛️ Политические и сырьевые ставки
      </div>
      
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center text-gray-400 py-8">Нет доступных политических событий</div>
        ) : (
          events.map(event => (
            <div key={event.id} className="bg-gray-700 p-4 rounded-xl hover:bg-gray-650 transition-all">
              <div className="font-bold text-lg mb-1">{event.name}</div>
              <div className="text-xs text-gray-400 mb-2">
                До: {new Date(event.endDate).toLocaleDateString('ru-RU')}
              </div>
              
              <div className="flex justify-between text-xs mb-2">
                <span>💰 Пул: {event.totalAmount.toLocaleString()} VTS</span>
                <span>👥 Участников: {event.userCount}</span>
              </div>
              
              <div className="flex gap-3 mt-2">
                {event.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => placeBet(event.id, opt)}
                    disabled={loading || !!event.userBet}
                    className={`flex-1 py-2 rounded-full font-bold transition-all active:scale-95 ${
                      event.userBet === opt
                        ? 'bg-green-600 shadow-green-500/50 cursor-default'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'
                    } ${(loading || event.userBet) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {opt} {event.userBet === opt && '✅'}
                  </button>
                ))}
              </div>
              
              <div className="text-xs text-gray-400 text-center mt-2">
                Ставка: 50 VTS
              </div>
              
              {event.userBet && (
                <div className="mt-2 text-xs text-center text-green-400">
                  Вы сделали ставку "{event.userBet}" ✅
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center bg-gray-900/50 p-2 rounded-lg">
        💎 Ставки принимаются в токенах VTS. В случае выигрыша вы получите часть пула пропорционально вашей ставке.
      </div>
    </div>
  );
};

export default PoliticsBets;