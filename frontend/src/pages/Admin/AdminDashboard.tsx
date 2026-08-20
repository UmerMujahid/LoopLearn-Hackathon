import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BoxAvatarOverlay } from '../../components/common/BoxAvatarOverlay';

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex items-center gap-4">
        <BoxAvatarOverlay role="admin" size="lg" showBadge badgeText="Admin" />
        <div>
          <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white">
            Municipal Platform Overview
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Welcome, {currentUser?.name || 'Admin'}! Citywide zero-waste monitoring dashboard.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: '📊', label: 'Total Listings', value: '342', color: 'emerald' },
          { icon: '🍲', label: 'Meals Rescued', value: '48,500', color: 'amber' },
          { icon: '🏛️', label: 'Verified Orgs', value: '85', color: 'indigo' },
          { icon: '🌱', label: 'Citywide CO₂', value: '36.6 tonnes', color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border-2 border-emerald-900/15 dark:border-emerald-700/20 rounded-2xl p-5 shadow-soft">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="font-display font-black text-2xl text-slate-900 dark:text-white">{stat.value}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border-2 border-emerald-900/15 dark:border-emerald-700/20 rounded-2xl p-6 shadow-soft">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Pending Verifications</h2>
          <div className="space-y-2">
            {['Hope Kitchen Shelter', 'City Food Bank Inc.', 'Neighborhood Pantry'].map((org, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                <span className="text-sm text-slate-800 dark:text-slate-200">{org}</span>
                <button className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg border border-emerald-800 hover:bg-emerald-700 transition-colors">
                  Verify
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-emerald-900/15 dark:border-emerald-700/20 rounded-2xl p-6 shadow-soft">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">UN SDG Progress</h2>
          <div className="space-y-3">
            {[
              { goal: 'SDG 2: Zero Hunger', progress: 72 },
              { goal: 'SDG 11: Sustainable Cities', progress: 58 },
              { goal: 'SDG 12: Responsible Consumption', progress: 81 },
              { goal: 'SDG 13: Climate Action', progress: 65 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.goal}</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{item.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
