import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BoxAvatarOverlay } from '../../components/common/BoxAvatarOverlay';

const ProviderDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <BoxAvatarOverlay role="donor" size="lg" showBadge badgeText="Provider" />
        <div>
          <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white">
            Food Donors Dashboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Welcome back, {currentUser?.name || 'Donor'}! Here&apos;s your rescue overview.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: '🥗', label: 'Active Listings', value: '12', color: 'emerald' },
          { icon: '🍲', label: 'Meals Donated', value: '1,420', color: 'amber' },
          { icon: '🌱', label: 'CO₂ Diverted', value: '2,125 kg', color: 'emerald' },
          { icon: '✨', label: 'Barakah Points', value: '14,200', color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border-2 border-emerald-900/15 dark:border-emerald-700/20 rounded-2xl p-5 shadow-soft">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="font-display font-black text-2xl text-slate-900 dark:text-white">{stat.value}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-900/15 dark:border-emerald-700/20 rounded-2xl p-6 shadow-soft">
        <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button className="px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-display font-bold text-sm rounded-xl border-2 border-emerald-900 shadow-pop-sm transition-all active:scale-95">
            + New Food Listing
          </button>
          <button className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-bold text-sm rounded-xl border-2 border-amber-700 shadow-pop-gold transition-all active:scale-95">
            View Incoming Claims
          </button>
          <button className="px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-display font-bold text-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 transition-all active:scale-95">
            Download ESG Report
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-900/15 dark:border-emerald-700/20 rounded-2xl p-6 shadow-soft">
        <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { icon: '🍞', text: '35 portions of fresh sourdough claimed by Hope Haven', time: '10 min ago' },
            { icon: '🚐', text: 'Volunteer pickup completed — 50 meal batch delivered', time: '2 hours ago' },
            { icon: '✨', text: 'AI matched 2 new community kitchens in your radius', time: '4 hours ago' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm text-slate-800 dark:text-slate-200">{item.text}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
