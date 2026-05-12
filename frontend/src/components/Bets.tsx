import React, { useState } from 'react';
import axios from 'axios';

interface BetsProps {
  userId?: number;
  onUpdate?: (balance: any) => void;
}

const Bets: React.FC<BetsProps> = ({ userId, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  
  // Демо-данные для теста
  const [events] = useState([
    { id: 1, name: '📈 Биткоин превысит $70,000 завтра?', options: ['Да', 'Нет'], endDate: '2026-12-31' },
    { id: 2, name: '💰 Ethereum достигнет $4000 до конца недели?', options: ['Да', 'Нет'], endDate: '2026-12-31' },
    { id: 3, name: '🚀 Solana обгонит Ethereum по транзакциям?', options: ['Да', 'Нет'], endDate: '2026-12-31' },
  ]);

  const placeBet = (eventId: number, choice: string) => {
    alert(`Ставка "${choice}" на событие ${eventId} принята! (демо-режим)`);
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm p-4 rounded-2xl">
      <div className="text-2xl font-bold text-center mb-4">📈 Ставки на события</div>
      
      <div className="space-y-4">
        {events.map(event => (
          <div key={event.id} className="bg-gray-700 p-4 rounded-xl">
            <div className="font-bold text-lg mb-1">{event.name}</div>
            <div className="text-xs text-gray-400 mb-3">
              До: {new Date(event.endDate).toLocaleDateString('ru-RU')}
            </div>
            
            <div className="flex gap-3">
              {event.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => placeBet(event.id, opt)}
                  disabled={loading}
                  className="flex-1 py-2 rounded-full font-bold bg-green-700 hover:bg-green-600 active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>
            
            <div className="text-xs text-gray-400 text-center mt-2">
              Ставка: 50 Stars
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bets;