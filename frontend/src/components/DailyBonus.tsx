import React, { useState, useEffect } from 'react';

interface DailyBonusProps {
  userId?: number;
  onUpdate?: (user: any) => void;
}

const DailyBonus: React.FC<DailyBonusProps> = ({ userId, onUpdate }) => {
  const [bonus, setBonus] = useState({ day: 0, amount: 0, canClaim: false });
  const [loading, setLoading] = useState(false);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);

  useEffect(() => {
    loadBonusInfo();
  }, [userId]);

  const loadBonusInfo = () => {
    // Загружаем данные из localStorage (демо-режим)
    const saved = localStorage.getItem('dailyBonus');
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toDateString();
      const lastClaim = data.lastClaimDate;
      const canClaim = lastClaim !== today;
      let streak = data.streak || 0;
      
      if (canClaim) {
        streak = streak % 7 + 1;
      }
      
      const amounts = [0, 5, 10, 20, 40, 80, 150, 300];
      const amount = amounts[Math.min(streak, 7)];
      
      setBonus({ day: streak, amount, canClaim });
      setLastClaimDate(lastClaim);
    } else {
      // Первый день
      setBonus({ day: 1, amount: 5, canClaim: true });
    }
  };

  const claimBonus = () => {
    if (!bonus.canClaim) return;
    
    setLoading(true);
    
    setTimeout(() => {
      // Сохраняем в localStorage
      const today = new Date().toDateString();
      const newStreak = bonus.day + 1;
      const amounts = [0, 5, 10, 20, 40, 80, 150, 300];
      const nextAmount = amounts[Math.min(newStreak, 7)];
      
      localStorage.setItem('dailyBonus', JSON.stringify({
        streak: newStreak,
        lastClaimDate: today
      }));
      
      setBonus({ day: newStreak, amount: nextAmount, canClaim: false });
      setLastClaimDate(today);
      
      // Обновляем баланс пользователя (VTS)
      if (onUpdate) {
        onUpdate((prev: any) => ({
          ...prev,
          vtsBalance: prev.vtsBalance + bonus.amount
        }));
      }
      
      alert(`🎁 Вы получили ${bonus.amount} VTS!`);
      setLoading(false);
    }, 500);
  };

  const getDayName = (day: number) => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return days[(day - 1) % 7];
  };

  const getTimeUntilTomorrow = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}ч ${minutes}м`;
  };

  return (
    <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 p-4 rounded-2xl border border-yellow-500/30">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🎁</span>
          <div>
            <div className="font-bold text-lg">Ежедневный бонус</div>
            <div className="text-xs text-gray-400">
              День {bonus.day} из 7 — {getDayName(bonus.day)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-yellow-400">+{bonus.amount}</div>
          <div className="text-xs text-gray-400">VTS</div>
        </div>
      </div>

      {/* Прогресс-бар стрика */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5, 6, 7].map(day => (
          <div
            key={day}
            className={`flex-1 h-2 rounded-full transition-all ${
              day <= bonus.day ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Награды по дням */}
      <div className="grid grid-cols-7 gap-1 mb-4 text-center text-xs">
        {[5, 10, 20, 40, 80, 150, 300].map((amt, idx) => (
          <div key={idx} className={`p-1 rounded ${idx + 1 === bonus.day ? 'bg-yellow-600/50 text-yellow-300' : 'text-gray-500'}`}>
            {amt}
          </div>
        ))}
      </div>

      <button
        onClick={claimBonus}
        disabled={!bonus.canClaim || loading}
        className={`w-full py-3 rounded-full font-bold transition-all ${
          bonus.canClaim && !loading
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:opacity-90 active:scale-95'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        {loading ? 'Забираю...' : bonus.canClaim ? '🎁 Забрать бонус' : `⏰ Доступно через ${getTimeUntilTomorrow()}`}
      </button>

      <div className="mt-3 text-xs text-gray-500 text-center bg-gray-900/50 p-2 rounded-lg">
        💡 Забирайте бонус каждый день! Пропуск дня сбрасывает счётчик до 1 дня.
        <br />
        Максимальный бонус на 7-й день: <span className="text-yellow-400 font-bold">300 VTS</span>
      </div>
    </div>
  );
};

export default DailyBonus;