import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AdminPanelProps {
  userId?: number;
}

interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    error: string;
    warning: string;
  };
  borderRadius: {
    button: string;
    card: string;
    modal: string;
  };
  fontFamily: string;
  animations: boolean;
  buttonStyle: 'filled' | 'outline' | 'ghost' | 'gradient';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalBonus, setGlobalBonus] = useState({ amount: 0, type: 'vts' });
  const [messageAll, setMessageAll] = useState({ title: '', content: '' });
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ vts: 0, nts: 0, stars: 0, role: 'user' });
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [newWallet, setNewWallet] = useState({ currency: '', address: '', minAmount: 10 });
  const [notification, setNotification] = useState<{ title: string; message: string; type: string } | null>(null);

  // Тема оформления
  const [theme, setTheme] = useState<ThemeConfig>({
    id: 'dark',
    name: 'Тёмная',
    colors: {
      primary: '#7c3aed',
      secondary: '#ec4899',
      accent: '#fbbf24',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
    },
    borderRadius: { button: '9999px', card: '16px', modal: '24px' },
    fontFamily: 'Inter, system-ui, sans-serif',
    animations: true,
    buttonStyle: 'gradient',
  });

  const colorSchemes: ThemeConfig[] = [
    {
      id: 'dark', name: 'Тёмная (по умолчанию)',
      colors: { primary: '#7c3aed', secondary: '#ec4899', accent: '#fbbf24', background: '#0f172a', surface: '#1e293b', text: '#f8fafc', textSecondary: '#94a3b8', success: '#10b981', error: '#ef4444', warning: '#f59e0b' },
      borderRadius: { button: '9999px', card: '16px', modal: '24px' }, fontFamily: 'Inter, system-ui, sans-serif', animations: true, buttonStyle: 'gradient',
    },
    {
      id: 'light', name: 'Светлая',
      colors: { primary: '#7c3aed', secondary: '#ec4899', accent: '#f59e0b', background: '#f8fafc', surface: '#ffffff', text: '#1e293b', textSecondary: '#64748b', success: '#10b981', error: '#ef4444', warning: '#f59e0b' },
      borderRadius: { button: '9999px', card: '16px', modal: '24px' }, fontFamily: 'Inter, system-ui, sans-serif', animations: true, buttonStyle: 'gradient',
    },
    {
      id: 'ocean', name: 'Океан',
      colors: { primary: '#0ea5e9', secondary: '#06b6d4', accent: '#fbbf24', background: '#082f49', surface: '#0c4a6e', text: '#f0f9ff', textSecondary: '#7dd3fc', success: '#10b981', error: '#ef4444', warning: '#f59e0b' },
      borderRadius: { button: '12px', card: '12px', modal: '20px' }, fontFamily: 'Inter, system-ui, sans-serif', animations: true, buttonStyle: 'filled',
    },
    {
      id: 'forest', name: 'Лес',
      colors: { primary: '#22c55e', secondary: '#84cc16', accent: '#fbbf24', background: '#14532d', surface: '#166534', text: '#f0fdf4', textSecondary: '#86efac', success: '#10b981', error: '#ef4444', warning: '#f59e0b' },
      borderRadius: { button: '8px', card: '8px', modal: '16px' }, fontFamily: 'Inter, system-ui, sans-serif', animations: true, buttonStyle: 'outline',
    },
    {
      id: 'cyberpunk', name: 'Киберпанк',
      colors: { primary: '#d946ef', secondary: '#06b6d4', accent: '#fbbf24', background: '#0a0a0a', surface: '#1a1a2e', text: '#00ffff', textSecondary: '#ff00ff', success: '#10b981', error: '#ef4444', warning: '#f59e0b' },
      borderRadius: { button: '4px', card: '4px', modal: '8px' }, fontFamily: 'Courier New, monospace', animations: true, buttonStyle: 'outline',
    },
  ];

  const applyTheme = (newTheme: ThemeConfig) => {
    const root = document.documentElement;
    Object.entries(newTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    root.style.setProperty('--radius-button', newTheme.borderRadius.button);
    root.style.setProperty('--radius-card', newTheme.borderRadius.card);
    root.style.setProperty('--radius-modal', newTheme.borderRadius.modal);
    root.style.setProperty('--font-family', newTheme.fontFamily);
    localStorage.setItem('app_theme', JSON.stringify(newTheme));
    setTheme(newTheme);
    showNotification('Тема применена', `Схема "${newTheme.name}" активирована`, 'success');
  };

  const loadSavedTheme = () => {
    const saved = localStorage.getItem('app_theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTheme(parsed);
        applyTheme(parsed);
      } catch (e) {}
    }
  };

  // Загрузка данных
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats', { headers: { 'x-user-id': userId?.toString() || '1' } });
      setStats(response.data);
    } catch (error) { console.error('Failed to fetch stats:', error); }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users', { headers: { 'x-user-id': userId?.toString() || '1' } });
      setUsers(response.data || []);
    } catch (error) { console.error('Failed to fetch users:', error); setUsers([]); }
  };

  const fetchWallets = async () => {
    try {
      const response = await axios.get('/api/admin/wallets', { headers: { 'x-user-id': userId?.toString() || '1' } });
      setWallets(response.data || []);
    } catch (error) { console.error('Failed to fetch wallets:', error); setWallets([]); }
  };

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/admin/payments', { headers: { 'x-user-id': userId?.toString() || '1' } });
      setPayments(response.data || []);
    } catch (error) { console.error('Failed to fetch payments:', error); setPayments([]); }
  };

  const fetchExchangeRates = async () => {
    try {
      const response = await axios.get('/api/admin/rates', { headers: { 'x-user-id': userId?.toString() || '1' } });
      setExchangeRates(response.data || []);
    } catch (error) {
      setExchangeRates([
        { currency: 'TON', rate: 5.2, updatedAt: new Date().toISOString() },
        { currency: 'NOT', rate: 0.008, updatedAt: new Date().toISOString() },
        { currency: 'USDT', rate: 1, updatedAt: new Date().toISOString() },
      ]);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchWallets(), fetchPayments(), fetchExchangeRates()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
    loadSavedTheme();
  }, [userId]);

  const showNotification = (title: string, message: string, type: string = 'info') => {
    setNotification({ title, message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const updateWallet = async (currency: string, address: string) => {
    try {
      await axios.post('/api/admin/wallets/update', { currency, address }, { headers: { 'x-user-id': userId?.toString() || '1' } });
      await fetchWallets();
      showNotification('Кошелёк обновлён', `${currency} адрес успешно обновлён`, 'success');
    } catch (error) { showNotification('Ошибка', 'Не удалось обновить кошелёк', 'error'); }
  };

  const addWallet = async () => {
    if (!newWallet.currency || !newWallet.address) { showNotification('Ошибка', 'Заполните все поля', 'error'); return; }
    try {
      await axios.post('/api/admin/wallets/add', newWallet, { headers: { 'x-user-id': userId?.toString() || '1' } });
      await fetchWallets();
      setShowAddWalletModal(false);
      setNewWallet({ currency: '', address: '', minAmount: 10 });
      showNotification('Кошелёк добавлен', `${newWallet.currency} успешно добавлен`, 'success');
    } catch (error) { showNotification('Ошибка', 'Не удалось добавить кошелёк', 'error'); }
  };

  const toggleWalletStatus = async (currency: string, isActive: boolean) => {
    try {
      await axios.post('/api/admin/wallets/toggle', { currency, isActive: !isActive }, { headers: { 'x-user-id': userId?.toString() || '1' } });
      await fetchWallets();
      showNotification('Статус изменён', `${currency} ${!isActive ? 'активирован' : 'деактивирован'}`, 'success');
    } catch (error) { showNotification('Ошибка', 'Не удалось изменить статус', 'error'); }
  };

  const updateUserBalance = async (userIdToUpdate: number) => {
    try {
      await axios.post('/api/admin/users/update', { userId: userIdToUpdate, vts: editForm.vts, nts: editForm.nts, stars: editForm.stars, role: editForm.role }, { headers: { 'x-user-id': userId?.toString() || '1' } });
      await fetchUsers();
      setEditingUserId(null);
      showNotification('Баланс обновлён', `Пользователь ID ${userIdToUpdate} успешно обновлён`, 'success');
    } catch (error) { showNotification('Ошибка', 'Не удалось обновить баланс', 'error'); }
  };

  const sendGlobalBonus = async () => {
    if (globalBonus.amount <= 0) { showNotification('Ошибка', 'Введите сумму бонуса', 'error'); return; }
    try {
      await axios.post('/api/admin/bonus/global', { amount: globalBonus.amount, type: globalBonus.type }, { headers: { 'x-user-id': userId?.toString() || '1' } });
      showNotification('Бонус отправлен', `${globalBonus.amount} ${globalBonus.type.toUpperCase()} отправлен всем пользователям!`, 'success');
      setGlobalBonus({ amount: 0, type: 'vts' });
      await fetchStats();
    } catch (error) { showNotification('Ошибка', 'Не удалось отправить бонус', 'error'); }
  };

  const sendMassMessage = async () => {
    if (!messageAll.title || !messageAll.content) { showNotification('Ошибка', 'Заполните заголовок и текст сообщения', 'error'); return; }
    try {
      await axios.post('/api/admin/notify', messageAll, { headers: { 'x-user-id': userId?.toString() || '1' } });
      showNotification('Рассылка отправлена', `Сообщение "${messageAll.title}" отправлено всем пользователям`, 'success');
      setMessageAll({ title: '', content: '' });
    } catch (error) { showNotification('Ошибка', 'Не удалось отправить рассылку', 'error'); }
  };

  const updateExchangeRate = async (currency: string, rate: number) => {
    try {
      await axios.post('/api/admin/rates/update', { currency, rate }, { headers: { 'x-user-id': userId?.toString() || '1' } });
      await fetchExchangeRates();
      showNotification('Курс обновлён', `${currency}: ${rate} USD`, 'success');
    } catch (error) { showNotification('Ошибка', 'Не удалось обновить курс', 'error'); }
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; className: string }> = {
      pending: { label: '⏳ Ожидает', className: 'bg-yellow-600' },
      completed: { label: '✅ Завершён', className: 'bg-green-600' },
      failed: { label: '❌ Ошибка', className: 'bg-red-600' },
      processing: { label: '🔄 Обработка', className: 'bg-blue-600' },
    };
    const s = statuses[status] || { label: status, className: 'bg-gray-600' };
    return <span className={`px-2 py-0.5 rounded-full text-xs ${s.className}`}>{s.label}</span>;
  };

  if (loading) {
    return <div className="bg-gray-800/90 backdrop-blur-sm p-4 rounded-2xl text-center"><div className="text-gray-400">Загрузка данных...</div></div>;
  }

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm p-4 rounded-2xl relative" style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all animate-bounce-short ${notification.type === 'success' ? 'bg-green-600' : notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'} text-white max-w-sm`}>
          <div className="font-bold">{notification.title}</div>
          <div className="text-sm">{notification.message}</div>
        </div>
      )}

      <div className="text-2xl font-bold text-center mb-4" style={{ color: theme.colors.primary }}>👑 Админ-панель</div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-full text-sm transition-all ${activeTab === 'dashboard' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>📊 Дашборд</button>
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-full text-sm transition-all ${activeTab === 'users' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>👥 Пользователи</button>
        <button onClick={() => setActiveTab('wallets')} className={`px-4 py-2 rounded-full text-sm transition-all ${activeTab === 'wallets' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>💰 Кошельки</button>
        <button onClick={() => setActiveTab('payments')} className={`px-4 py-2 rounded-full text-sm transition-all ${activeTab === 'payments' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>💳 Платежи</button>
        <button onClick={() => setActiveTab('rates')} className={`px-4 py-2 rounded-full text-sm transition-all ${activeTab === 'rates' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>💱 Курсы</button>
        <button onClick={() => setActiveTab('design')} className={`px-4 py-2 rounded-full text-sm transition-all ${activeTab === 'design' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>🎨 Дизайн</button>
        <button onClick={() => setActiveTab('communications')} className={`px-4 py-2 rounded-full text-sm transition-all ${activeTab === 'communications' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>📨 Рассылка</button>
      </div>

      {/* DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: theme.colors.surface }}><div className="text-2xl font-bold text-yellow-400">{stats.totalUsers || 0}</div><div className="text-xs text-gray-400">Всего пользователей</div></div>
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: theme.colors.surface }}><div className="text-2xl font-bold text-green-400">{stats.activeToday || 0}</div><div className="text-xs text-gray-400">Активных сегодня</div></div>
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: theme.colors.surface }}><div className="text-2xl font-bold text-purple-400">{stats.totalSpins || 0}</div><div className="text-xs text-gray-400">Вращений колеса</div></div>
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: theme.colors.surface }}><div className="text-2xl font-bold text-orange-400">{stats.totalBattles || 0}</div><div className="text-xs text-gray-400">Батлов проведено</div></div>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: theme.colors.surface }}>
            <h3 className="font-bold mb-2">🎁 Глобальный бонус</h3>
            <div className="flex gap-2"><input type="number" placeholder="Сумма" value={globalBonus.amount} onChange={e => setGlobalBonus({ ...globalBonus, amount: parseInt(e.target.value) || 0 })} className="flex-1 bg-gray-700 rounded-lg px-3 py-2" /><select value={globalBonus.type} onChange={e => setGlobalBonus({ ...globalBonus, type: e.target.value })} className="bg-gray-700 rounded-lg px-3 py-2"><option value="vts">🟢 VTS</option><option value="nts">🔵 NTS</option><option value="stars">⭐ Stars</option></select><button onClick={sendGlobalBonus} className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500 transition">Отправить</button></div>
          </div>
        </div>
      )}

      {/* USERS */}
      {activeTab === 'users' && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-6 gap-2 text-xs text-gray-400 pb-2 border-b border-gray-700"><span>ID</span><span>Имя</span><span>Stars</span><span>VTS</span><span>NTS</span><span>Действия</span></div>
          {users && users.length > 0 ? users.map(u => (
            <div key={u.id} className="grid grid-cols-6 gap-2 text-sm border-b border-gray-700 py-2 items-center">
              <span>{u.id}</span><span>{u.username || u.firstName}</span><span className="text-yellow-400">{u.starsBalance}</span><span className="text-green-400">{u.vtsBalance}</span><span className="text-blue-400">{u.ntsBalance}</span>
              <div className="flex gap-1"><button onClick={() => { setEditingUserId(u.id); setEditForm({ vts: u.vtsBalance, nts: u.ntsBalance, stars: u.starsBalance, role: u.role }); }} className="bg-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-500 transition">✏️</button></div>
            </div>
          )) : <div className="text-center text-gray-400 py-8">Нет пользователей</div>}
          {editingUserId && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"><div className="bg-gray-800 rounded-xl p-6 w-96"><h3 className="font-bold mb-4">Редактирование пользователя</h3><input type="number" placeholder="Stars" value={editForm.stars} onChange={e => setEditForm({ ...editForm, stars: parseInt(e.target.value) })} className="w-full bg-gray-700 rounded-lg px-3 py-2 mb-2" /><input type="number" placeholder="VTS" value={editForm.vts} onChange={e => setEditForm({ ...editForm, vts: parseInt(e.target.value) })} className="w-full bg-gray-700 rounded-lg px-3 py-2 mb-2" /><input type="number" placeholder="NTS" value={editForm.nts} onChange={e => setEditForm({ ...editForm, nts: parseInt(e.target.value) })} className="w-full bg-gray-700 rounded-lg px-3 py-2 mb-2" /><select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="w-full bg-gray-700 rounded-lg px-3 py-2 mb-4"><option value="user">👤 user</option><option value="admin">👑 admin</option></select><div className="flex gap-2"><button onClick={() => updateUserBalance(editingUserId)} className="flex-1 bg-green-600 py-2 rounded-lg hover:bg-green-500 transition">Сохранить</button><button onClick={() => setEditingUserId(null)} className="flex-1 bg-gray-600 py-2 rounded-lg hover:bg-gray-500 transition">Отмена</button></div></div></div>
          )}
        </div>
      )}

      {/* WALLETS */}
      {activeTab === 'wallets' && (
        <div className="space-y-2"><div className="flex justify-between items-center mb-2"><h3 className="font-bold">Криптокошельки</h3><button onClick={() => setShowAddWalletModal(true)} className="bg-green-600 px-3 py-1 rounded-lg text-sm hover:bg-green-500 transition">➕ Добавить</button></div>
          {wallets && wallets.length > 0 ? wallets.map(w => (
            <div key={w.id} className="p-3 rounded-lg" style={{ backgroundColor: theme.colors.surface }}>
              <div className="flex justify-between items-center mb-1"><div className="font-bold">{w.currency}</div><button onClick={() => toggleWalletStatus(w.currency, w.isActive)} className={`px-2 py-0.5 rounded text-xs ${w.isActive ? 'bg-green-600' : 'bg-gray-500'} hover:opacity-80 transition`}>{w.isActive ? 'Активен' : 'Отключён'}</button></div>
              <div className="flex gap-2"><input type="text" defaultValue={w.address} onBlur={e => updateWallet(w.currency, e.target.value)} className="flex-1 bg-gray-700 rounded-lg px-3 py-1 text-sm font-mono" /></div>
            </div>
          )) : <div className="text-center text-gray-400 py-4">Нет настроенных кошельков</div>}
        </div>
      )}

      {/* PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="space-y-2 max-h-96 overflow-y-auto"><div className="grid grid-cols-6 gap-2 text-xs text-gray-400 pb-2 border-b border-gray-700"><span>ID</span><span>Пользователь</span><span>Сумма</span><span>Валюта</span><span>Статус</span><span>Дата</span></div>
          {payments && payments.length > 0 ? payments.map(p => (
            <div key={p.id} className="grid grid-cols-6 gap-2 text-sm border-b border-gray-700 py-2 items-center">
              <span className="text-xs font-mono">{p.id.slice(0, 8)}</span><span>{p.userId}</span><span>{p.amount}</span><span>{p.currency}</span>{getStatusBadge(p.status)}<span className="text-xs">{new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
          )) : <div className="text-center text-gray-400 py-4">Нет платежей</div>}
        </div>
      )}

      {/* EXCHANGE RATES */}
      {activeTab === 'rates' && (
        <div className="space-y-2"><h3 className="font-bold mb-2">💱 Курсы валют (USD)</h3>
          {exchangeRates.map(rate => (
            <div key={rate.currency} className="p-3 rounded-lg flex justify-between items-center" style={{ backgroundColor: theme.colors.surface }}>
              <span className="font-bold w-20">{rate.currency}</span>
              <input type="number" step="0.0001" defaultValue={rate.rate} onBlur={e => updateExchangeRate(rate.currency, parseFloat(e.target.value))} className="w-32 bg-gray-700 rounded-lg px-3 py-1 text-right" />
              <span className="text-xs text-gray-400">Обновлён: {new Date(rate.updatedAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* DESIGN */}
      {activeTab === 'design' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl" style={{ backgroundColor: theme.colors.surface }}>
            <h3 className="font-bold mb-3">🎨 Готовые цветовые схемы</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {colorSchemes.map(scheme => (
                <button key={scheme.id} onClick={() => applyTheme(scheme)} className="p-3 rounded-lg text-left transition-all hover:scale-105" style={{ backgroundColor: scheme.colors.surface, border: `2px solid ${theme.colors.primary}`, color: scheme.colors.text }}>
                  <div className="flex gap-2 mb-2"><div className="w-6 h-6 rounded-full" style={{ backgroundColor: scheme.colors.primary }}></div><div className="w-6 h-6 rounded-full" style={{ backgroundColor: scheme.colors.secondary }}></div><div className="w-6 h-6 rounded-full" style={{ backgroundColor: scheme.colors.accent }}></div></div>
                  <div className="font-bold text-sm">{scheme.name}</div>
                  <div className="text-xs opacity-70">{scheme.buttonStyle}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: theme.colors.surface }}>
            <h3 className="font-bold mb-3">🎨 Ручная настройка цветов</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(theme.colors).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center"><span className="text-sm capitalize">{key}</span><input type="color" value={value} onChange={(e) => { const newColors = { ...theme.colors, [key]: e.target.value }; const newTheme = { ...theme, colors: newColors }; applyTheme(newTheme); }} className="w-10 h-8 rounded cursor-pointer" /></div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: theme.colors.surface }}>
            <h3 className="font-bold mb-3">📐 Скругления (px)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-sm text-gray-400">Кнопки</label><input type="range" min="0" max="40" value={parseInt(theme.borderRadius.button)} onChange={(e) => { const newTheme = { ...theme, borderRadius: { ...theme.borderRadius, button: `${e.target.value}px` } }; applyTheme(newTheme); }} className="w-full" /><div className="text-center text-sm">{theme.borderRadius.button}</div></div>
              <div><label className="text-sm text-gray-400">Карточки</label><input type="range" min="0" max="40" value={parseInt(theme.borderRadius.card)} onChange={(e) => { const newTheme = { ...theme, borderRadius: { ...theme.borderRadius, card: `${e.target.value}px` } }; applyTheme(newTheme); }} className="w-full" /><div className="text-center text-sm">{theme.borderRadius.card}</div></div>
              <div><label className="text-sm text-gray-400">Модалки</label><input type="range" min="0" max="40" value={parseInt(theme.borderRadius.modal)} onChange={(e) => { const newTheme = { ...theme, borderRadius: { ...theme.borderRadius, modal: `${e.target.value}px` } }; applyTheme(newTheme); }} className="w-full" /><div className="text-center text-sm">{theme.borderRadius.modal}</div></div>
            </div>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: theme.colors.surface }}>
            <h3 className="font-bold mb-3">✏️ Шрифты и кнопки</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-gray-400">Шрифт</label><select value={theme.fontFamily} onChange={(e) => applyTheme({ ...theme, fontFamily: e.target.value })} className="w-full bg-gray-700 rounded-lg px-3 py-2 mt-1"><option value="Inter, system-ui, sans-serif">Inter</option><option value="Roboto, system-ui, sans-serif">Roboto</option><option value="Courier New, monospace">Courier New</option><option value="Georgia, serif">Georgia</option></select></div>
              <div><label className="text-sm text-gray-400">Стиль кнопок</label><select value={theme.buttonStyle} onChange={(e) => applyTheme({ ...theme, buttonStyle: e.target.value as any })} className="w-full bg-gray-700 rounded-lg px-3 py-2 mt-1"><option value="filled">Заливка</option><option value="outline">Контур</option><option value="ghost">Прозрачные</option><option value="gradient">Градиент</option></select></div>
            </div>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: theme.colors.surface }}>
            <h3 className="font-bold mb-3">✨ Анимации</h3>
            <div className="flex gap-4"><button onClick={() => applyTheme({ ...theme, animations: true })} className={`px-4 py-2 rounded-lg transition ${theme.animations ? 'bg-green-600' : 'bg-gray-600'}`}>✅ Включены</button><button onClick={() => applyTheme({ ...theme, animations: false })} className={`px-4 py-2 rounded-lg transition ${!theme.animations ? 'bg-red-600' : 'bg-gray-600'}`}>❌ Выключены</button></div>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: theme.colors.surface }}>
            <h3 className="font-bold mb-3">📱 Пример кнопок</h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 transition-all" style={{ backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.button, color: '#fff' }}>Обычная кнопка</button>
              <button className="px-4 py-2 transition-all" style={{ border: `2px solid ${theme.colors.primary}`, borderRadius: theme.borderRadius.button, color: theme.colors.primary, background: 'transparent' }}>Контурная</button>
              <button className="px-4 py-2 transition-all" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`, borderRadius: theme.borderRadius.button, color: '#fff' }}>Градиент</button>
            </div>
          </div>
          <button onClick={() => applyTheme(colorSchemes[0])} className="w-full py-2 rounded-lg mt-2" style={{ backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.button, color: '#fff' }}>🔄 Сбросить к стандартной теме</button>
        </div>
      )}

      {/* COMMUNICATIONS */}
      {activeTab === 'communications' && (
        <div className="space-y-4"><input type="text" placeholder="Заголовок сообщения" value={messageAll.title} onChange={e => setMessageAll({ ...messageAll, title: e.target.value })} className="w-full bg-gray-700 rounded-lg px-4 py-2" /><textarea placeholder="Текст сообщения" rows={4} value={messageAll.content} onChange={e => setMessageAll({ ...messageAll, content: e.target.value })} className="w-full bg-gray-700 rounded-lg px-4 py-2" /><button onClick={sendMassMessage} className="w-full py-2 rounded-full transition" style={{ backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.button }}>📨 Отправить всем пользователям</button></div>
      )}

      {/* MODAL */}
      {showAddWalletModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-96" style={{ borderRadius: theme.borderRadius.modal }}><h3 className="font-bold mb-4">Добавить кошелёк</h3>
            <input type="text" placeholder="Валюта (TON, NOT, USDT...)" value={newWallet.currency} onChange={e => setNewWallet({ ...newWallet, currency: e.target.value.toUpperCase() })} className="w-full bg-gray-700 rounded-lg px-3 py-2 mb-2" />
            <input type="text" placeholder="Адрес кошелька" value={newWallet.address} onChange={e => setNewWallet({ ...newWallet, address: e.target.value })} className="w-full bg-gray-700 rounded-lg px-3 py-2 mb-2" />
            <div className="flex gap-2"><button onClick={addWallet} className="flex-1 bg-green-600 py-2 rounded-lg hover:bg-green-500 transition">Добавить</button><button onClick={() => setShowAddWalletModal(false)} className="flex-1 bg-gray-600 py-2 rounded-lg hover:bg-gray-500 transition">Отмена</button></div>
          </div>
        </div>
      )}

      <style>{`
        ${theme.animations && `button, .transition-all { transition: all 0.2s ease; } button:hover { transform: scale(1.02); } button:active { transform: scale(0.98); }`}
        body { font-family: ${theme.fontFamily}; }
      `}</style>
    </div>
  );
};

export default AdminPanel;