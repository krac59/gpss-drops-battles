import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ReferralBlockProps {
  userId?: number;
}

interface Referral {
  id: number;
  refereeId: number;
  referrerId: number;
  status: string;
  depositStars: number;
  bonusReferrer: number;
  bonusReferee: number;
  completedAt: string;
  createdAt: string;
  referee: {
    username: string;
    firstName: string;
  };
}

const ReferralBlock: React.FC<ReferralBlockProps> = ({ userId }) => {
  const [link, setLink] = useState('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchReferralLink();
      fetchReferrals();
    }
  }, [userId]);

  const fetchReferralLink = async () => {
    try {
      const response = await axios.get('/api/referral/link', {
        headers: { 'x-user-id': userId?.toString() || '1' }
      });
      setLink(response.data.link);
    } catch (error) {
      console.error('Failed to fetch referral link:', error);
      // Демо-ссылка на случай ошибки
      setLink(`https://t.me/gccp_drop_bot?start=ref_${userId}`);
    }
  };

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/referral/list', {
        headers: { 'x-user-id': userId?.toString() || '1' }
      });
      setReferrals(response.data.referrals);
      setTotalEarned(response.data.totalEarned);
    } catch (error) {
      console.error('Failed to fetch referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    const text = `Присоединяйся ко мне в Drops & Battles! Зарабатывай токены, играй в игры и получай бонусы. ${link}`;
    navigator.clipboard.writeText(text);
    alert('Ссылка скопирована! Поделитесь с друзьями в Telegram.');
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <span className="px-2 py-0.5 rounded-full text-xs bg-green-600">Активен</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-600">Ожидает</span>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm p-4 rounded-2xl border border-blue-500/30">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">👥</span>
        <span className="font-bold text-lg">Реферальная программа</span>
      </div>
      
      <p className="text-sm text-gray-300 mb-3">
        Приглашай друзей — получай <span className="text-green-400 font-bold">10% от их пополнений</span> (от 50 Stars)
      </p>

      <div className="bg-gray-900/50 p-3 rounded-lg mb-3">
        <div className="text-xs text-gray-400 mb-1">Ваша реферальная ссылка:</div>
        <div className="flex gap-2">
          <input
            type="text"
            value={link}
            readOnly
            className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 font-mono"
          />
          <button
            onClick={copyLink}
            className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition"
          >
            {copied ? '✅' : '📋'}
          </button>
        </div>
      </div>

      <button
        onClick={shareLink}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-2 rounded-full text-sm font-semibold mb-4 hover:opacity-90 transition"
      >
        📤 Пригласить друзей
      </button>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-700 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-400">
            {loading ? '...' : referrals.length}
          </div>
          <div className="text-xs text-gray-400">Приглашено друзей</div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {loading ? '...' : totalEarned}
          </div>
          <div className="text-xs text-gray-400">Заработано VTS</div>
        </div>
      </div>

      {/* Список рефералов */}
      {!loading && referrals.length > 0 && (
        <div className="border-t border-gray-700 pt-3">
          <div className="text-sm font-semibold mb-2">📋 История приглашений:</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {referrals.map(ref => (
              <div key={ref.id} className="flex justify-between items-center text-sm bg-gray-700/50 p-2 rounded-lg">
                <div>
                  <div className="font-medium">{ref.referee?.username || `ID: ${ref.refereeId}`}</div>
                  <div className="text-xs text-gray-400">{formatDate(ref.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div>{getStatusBadge(ref.status)}</div>
                  {ref.status === 'completed' && (
                    <div className="text-xs text-green-400">+{ref.bonusReferrer} VTS</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && referrals.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-2">
          У вас пока нет приглашённых друзей
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 bg-gray-900/50 p-2 rounded-lg">
        <div className="font-bold mb-1">ℹ️ Как работает реферальная программа:</div>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>Вы получаете 10% от пополнений приглашённого (в VTS)</li>
          <li>Приглашённый получает 5 VTS при первом пополнении от 50 Stars</li>
          <li>Токены конвертируются в GPSS после окончания дропа</li>
          <li>Примерный курс: 1 VTS ≈ 0.001 Stars, 1 NTS ≈ 0.1 Stars</li>
        </ul>
      </div>
    </div>
  );
};

export default ReferralBlock;