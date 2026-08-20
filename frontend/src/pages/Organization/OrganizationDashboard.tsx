import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BoxAvatarOverlay } from '../../components/common/BoxAvatarOverlay';

const OrganizationDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex items-center gap-4">
        <BoxAvatarOverlay role="organization" size="lg" showBadge badgeText="Org" />
        <div>
          <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white">
            Community Hub Overview
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Welcome, {currentUser?.name || 'Organization'}! Browse available food surplus.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: '🔍', label: 'Available Listings', value: '24', color: 'amber' },
          { icon: '📦', label: 'My Active Claims', value: '5', color: 'emerald' },
          { icon: '🍲', label: 'Meals Received', value: '5,760', color: 'amber' },
          { icon: '🌱', label: 'CO₂ Diverted', value: '5,760 kg', color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border-2 border-emerald-900/15 dark:border-emerald-700/20 rounded-2xl p-5 shadow-soft">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="font-display font-black text-2xl text-slate-900 dark:text-white">{stat.value}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-900/15 dark:border-emerald-700/20 rounded-2xl p-6 shadow-soft">
        <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Nearby Available Food</h2>
        <div className="space-y-3">
          {[
            { name: 'Fresh Sourdough Bread', provider: 'Artisan Bakery', qty: '35 portions', distance: '1.2 km' },
            { name: 'Mixed Vegetable Platter', provider: 'Green Grocery', qty: '50 kg', distance: '2.5 km' },
            { name: 'Catering Leftover Meals', provider: 'Grand Hotel Kitchen', qty: '80 portions', distance: '3.1 km' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🥗</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                  <p className="text-[10px] text-slate-400">{item.provider} • {item.distance}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{item.qty}</p>
                <button className="text-[10px] text-amber-700 dark:text-amber-400 font-bold hover:underline mt-0.5">Claim</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
