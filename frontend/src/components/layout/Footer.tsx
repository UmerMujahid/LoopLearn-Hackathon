import React from 'react';

const Footer: React.FC = () => {
  const sdgs = [
    { id: 2, name: 'Zero Hunger', color: 'bg-yellow-500', emoji: '🌾' },
    { id: 11, name: 'Sustainable Cities', color: 'bg-amber-600', emoji: '🏙️' },
    { id: 12, name: 'Responsible Consumption', color: 'bg-emerald-600', emoji: '♻️' },
    { id: 13, name: 'Climate Action', color: 'bg-teal-600', emoji: '🌍' },
  ];

  return (
    <footer className="bg-white dark:bg-slate-900 border-t-2 border-emerald-900/15 dark:border-emerald-700/20 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* UN SDGs */}
        <div className="mb-8">
          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white mb-4 text-center">
            UN Sustainable Development Goals
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sdgs.map((sdg) => (
              <div
                key={sdg.id}
                className={`${sdg.color} rounded-xl p-3 text-white text-center shadow-sm`}
                data-testid={`sdg-card-${sdg.id}`}
              >
                <div className="text-2xl mb-1">{sdg.emoji}</div>
                <div className="font-display font-bold text-xs">SDG {sdg.id}</div>
                <div className="text-[10px] opacity-90">{sdg.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽️</span>
            <span className="font-display font-bold text-sm text-slate-900 dark:text-white">FoodLoop</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
            LoopLearn Hackathon 2026 &bull; Problem Statement PS-04 &bull; Smart Food Rescue Platform
          </div>
          <div className="text-[10px] text-slate-400">
            Built with purpose & Barakah
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
