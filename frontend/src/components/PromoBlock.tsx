import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PromoBlockProps {
  userId?: number;
}

interface UserRank {
  id: number;
  username: string;
  starsBalance: number;
  vtsBalance: number;
  ntsBalance: number;
  tapsCount: number;
  battlesWon: number;
  betsWon: number;
}

const PromoBlock: React.FC<PromoBlockProps> = ({ userId }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeRankTab, setActiveRankTab] = useState<'wealth' | 'activity'>('wealth');
  const [wealthRanking, setWealthRanking] = useState<UserRank[]>([]);
  const [activityRanking, setActivityRanking] = useState<UserRank[]>([]);
  const [userRank, setUserRank] = useState<{ place: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка реальных данных с бэкенда
  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      // Запрашиваем список пользователей для рейтинга
      const response = await axios.get('/api/admin/users', {
        headers: { 'x-user-id': userId?.toString() || '1' }
      });
      
      const users = response.data || [];
      
      // Формируем рейтинг богатых (по Stars и VTS)
      const wealthData: UserRank[] = users.map((u: any) => ({
        id: u.id,
        username: u.username || u.firstName,
        starsBalance: u.starsBalance || 0,
        vtsBalance: u.vtsBalance || 0,
        ntsBalance: u.ntsBalance || 0,
        tapsCount: u.tapsCount || 0,
        battlesWon: u.battlesWon || 0,
        betsWon: u.betsWon || 0,
      }));
      
      // Сортируем по Stars (богатые)
      const sortedWealth = [...wealthData].sort((a, b) => b.starsBalance - a.starsBalance);
      setWealthRanking(sortedWealth);
      
      // Сортируем по активности (тапы + батлы)
      const sortedActivity = [...wealthData].sort((a, b) => (b.tapsCount + b.battlesWon) - (a.tapsCount + a.battlesWon));
      setActivityRanking(sortedActivity);
      
      // Находим место текущего пользователя
      if (userId) {
        const index = sortedWealth.findIndex(u => u.id === userId);
        if (index !== -1) {
          setUserRank({ place: index + 1, total: sortedWealth.length });
        } else if (sortedWealth.length > 0) {
          setUserRank({ place: sortedWealth.length + 1, total: sortedWealth.length });
        }
      }
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
      setWealthRanking([]);
      setActivityRanking([]);
    } finally {
      setLoading(false);
    }
  };

  const getMedal = (place: number) => {
    if (place === 1) return '🏆 ЗОЛОТО';
    if (place === 2) return '🥈 СЕРЕБРО';
    if (place === 3) return '🥉 БРОНЗА';
    return `${place} место`;
  };

  const getMedalIcon = (place: number) => {
    if (place === 1) return '🏆';
    if (place === 2) return '🥈';
    if (place === 3) return '🥉';
    return '📊';
  };

  const currentRanking = activeRankTab === 'wealth' ? wealthRanking : activityRanking;

  return (
    <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-5 border border-purple-500 shadow-xl transition-all">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-400">
          🚀 Будущее децентрализованных сервисов
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-yellow-300 text-sm underline hover:text-yellow-400"
        >
          {expanded ? 'Свернуть' : 'Подробнее'}
        </button>
      </div>

      {/* Рейтинги */}
      <div className="mt-4">
        <div className="flex gap-2 mb-3 border-b border-purple-700 pb-2">
          <button
            onClick={() => setActiveRankTab('wealth')}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              activeRankTab === 'wealth' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-purple-800/50'
            }`}
          >
            💰 Самые богатые
          </button>
          <button
            onClick={() => setActiveRankTab('activity')}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              activeRankTab === 'activity' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-purple-800/50'
            }`}
          >
            ⚡ Самые активные
          </button>
        </div>

        {/* Место пользователя в рейтинге */}
        {userRank && (
          <div className="bg-purple-800/50 rounded-lg p-2 mb-3 text-center">
            <span className="text-sm">📍 Ваше место в рейтинге: </span>
            <span className="font-bold text-yellow-300">{getMedal(userRank.place)}</span>
            <span className="text-xs text-gray-400 ml-2">(из {userRank.total} участников)</span>
          </div>
        )}

        {/* Таблица рейтинга */}
        <div className="bg-gray-900/50 rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Загрузка рейтинга...</div>
          ) : currentRanking.length === 0 ? (
            <div className="text-center text-gray-400 py-8">Нет пользователей для отображения рейтинга</div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-2 p-2 text-xs text-gray-400 border-b border-gray-700">
                <span>#</span><span>Пользователь</span><span>Stars</span><span>VTS</span>
              </div>
              {currentRanking.slice(0, 10).map((user, idx) => (
                <div key={user.id} className="grid grid-cols-4 gap-2 p-2 text-sm hover:bg-purple-800/30">
                  <span className="font-bold">{getMedalIcon(idx + 1)} {idx + 1}</span>
                  <span>{user.username}{user.id === userId && ' 👈'}</span>
                  <span className="text-yellow-400">{user.starsBalance.toLocaleString()}</span>
                  <span className="text-green-400">{user.vtsBalance.toLocaleString()}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-purple-700 text-gray-300 space-y-2">
          <p><strong>🔐 Почему мы уникальны?</strong></p>
          <p>• <strong>Визуальное шифрование</strong> — зашифрованные ключи -(двойное шифрование) находятся у пользователей, которые невозможно украсть.</p>
          <p>• <strong>Защита временем</strong> — код меняется каждые 00:30 - 1,5 часа. Без точного времени — ключ бесполезен.</p>
          <p>• <strong>Работа без интернета</strong> — локальная сеть внутри регионов.</p>
          <p>• <strong>ИИ-агенты</strong> — автоматизированы безопасность, налоги, инвестиции, споры.</p>
          <p>• <strong>Блокчейн</strong> — закрытая система с военной криптографией и протоколом - http/r2d.</p>

          <p className="mt-3 text-yellow-300 font-semibold">
            💎 Участвуйте в дропе сейчас — получите токены, которые станут вашим билетом в новую цифровую экономику. Чем раньше вы войдёте, тем больше выгода!
          </p>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 text-center">
        ⚡ Рейтинги обновляются ежедневно. Будьте активны — попадите в топ и получите бонусы!
      </div>
    </div>
  );
};

export default PromoBlock;