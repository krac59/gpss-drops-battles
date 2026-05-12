import React, { useState } from 'react';
import Balance from './components/Balance';
import DailyBonus from './components/DailyBonus';
import PromoBlock from './components/PromoBlock';
import TapGame from './components/TapGame';
import WheelGame from './components/WheelGame';
import Battles from './components/Battles';
import Bets from './components/Bets';
import PoliticsBets from './components/PoliticsBets';
import ReferralBlock from './components/ReferralBlock';
import AdminPanel from './components/AdminPanel';

function App() {
  const [user, setUser] = useState({
    id: 1,
    starsBalance: 1000,
    vtsBalance: 500,
    ntsBalance: 100,
    role: 'admin',
    energy: 100,
    level: 1
  });

  const [activeTab, setActiveTab] = useState('tap');

  const tabs = [
    { id: 'tap', label: 'Tap', icon: '👆' },
    { id: 'wheel', label: 'Wheel', icon: '🎡' },
    { id: 'battles', label: 'Battle', icon: '⚔️' },
    { id: 'bets', label: 'Bets', icon: '📈' },
    { id: 'politics', label: 'Politics', icon: '🏛️' },
    { id: 'referral', label: 'Referral', icon: '👥' },
    { id: 'admin', label: 'Admin', icon: '👑' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 pb-20">
      <div className="p-4 space-y-4">
        <Balance userId={user.id} onUpdate={setUser} />
        <DailyBonus userId={user.id} onUpdate={setUser} />
        <PromoBlock userId={user.id} />
      </div>

      <div className="px-4">
        {activeTab === 'tap' && <TapGame userId={user.id} onUpdate={setUser} />}
        {activeTab === 'wheel' && <WheelGame userId={user.id} onUpdate={setUser} />}
        {activeTab === 'battles' && <Battles userId={user.id} onUpdate={setUser} />}
        {activeTab === 'bets' && <Bets userId={user.id} onUpdate={setUser} />}
        {activeTab === 'politics' && <PoliticsBets userId={user.id} onUpdate={setUser} />}
        {activeTab === 'referral' && <ReferralBlock userId={user.id} />}
        {activeTab === 'admin' && <AdminPanel userId={user.id} />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-lg border-t border-gray-700 flex justify-around p-2 z-50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-2 px-2 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;