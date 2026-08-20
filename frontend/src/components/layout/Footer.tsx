import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiGlobe,
  FiShield,
  FiUsers,
  FiPackage,
  FiArrowUpRight,
} from 'react-icons/fi';
import { FoodLoopLogo } from '../common/FoodLoopLogo';

const sdgs = [
  { id: 2,  name: 'Zero Hunger',              color: '#ca8a04', bg: 'rgba(202,138,4,0.12)',   border: 'rgba(202,138,4,0.25)'  },
  { id: 11, name: 'Sustainable Cities',        color: '#d97706', bg: 'rgba(217,119,6,0.12)',   border: 'rgba(217,119,6,0.25)'  },
  { id: 12, name: 'Responsible Consumption',   color: '#059669', bg: 'rgba(5,150,105,0.12)',   border: 'rgba(5,150,105,0.25)'  },
  { id: 13, name: 'Climate Action',            color: '#0891b2', bg: 'rgba(8,145,178,0.12)',   border: 'rgba(8,145,178,0.25)'  },
];

const platformLinks = [
  { label: 'How It Works', href: '/#solution' },
  { label: 'The Problem',  href: '/#problem' },
  { label: 'Dashboards',   href: '/#dashboards' },
  { label: 'Impact',       href: '/#impact' },
];

const portalLinks = [
  { label: 'Food Donors Hub',       to: '/login', icon: <FiPackage className="text-emerald-500" /> },
  { label: 'Community Relief',      to: '/login', icon: <FiUsers    className="text-amber-500"   /> },
  { label: 'Municipal Governance',  to: '/login', icon: <FiShield   className="text-indigo-500"  /> },
];

const Footer: React.FC = () => (
  <footer
    className="mt-16 border-t"
    style={{ borderColor: 'rgba(6,61,39,0.10)' }}
    data-testid="foodloop-footer"
  >
    {/* Main content grid */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Column 1: Brand */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <FoodLoopLogo size={34} />
            <span className="font-display font-extrabold text-lg text-emerald-950 dark:text-emerald-100 tracking-tight">
              FoodLoop
            </span>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[220px]">
            A smart surplus-food rescue platform connecting commercial kitchens with community organizations — zero waste, maximum Barakah.
          </p>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase"
            style={{
              background: 'rgba(5,150,105,0.08)',
              border: '1px solid rgba(5,150,105,0.18)',
              color: '#059669',
            }}
          >
            <FiGlobe className="text-[10px]" />
            LoopLearn Hackathon 2026
          </div>
        </div>

        {/* Column 2: Platform */}
        <div className="space-y-4">
          <h4
            className="font-mono font-bold uppercase text-[10px] tracking-widest"
            style={{ color: 'rgba(6,61,39,0.45)' }}
          >
            Platform
          </h4>
          <ul className="space-y-2.5">
            {platformLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-1 group"
                >
                  {link.label}
                  <FiArrowUpRight className="text-[10px] opacity-0 group-hover:opacity-60 transition-opacity" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Portals */}
        <div className="space-y-4">
          <h4
            className="font-mono font-bold uppercase text-[10px] tracking-widest"
            style={{ color: 'rgba(6,61,39,0.45)' }}
          >
            Portals
          </h4>
          <ul className="space-y-2.5">
            {portalLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors flex items-center gap-2 group"
                >
                  {link.icon}
                  {link.label}
                  <FiArrowUpRight className="text-[10px] opacity-0 group-hover:opacity-60 transition-opacity ml-auto" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: UN SDGs */}
        <div className="space-y-4">
          <h4
            className="font-mono font-bold uppercase text-[10px] tracking-widest"
            style={{ color: 'rgba(6,61,39,0.45)' }}
          >
            UN Sustainable Development Goals
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {sdgs.map((sdg) => (
              <div
                key={sdg.id}
                data-testid={`sdg-card-${sdg.id}`}
                className="rounded-xl p-2.5 text-center"
                style={{
                  background: sdg.bg,
                  border: `1px solid ${sdg.border}`,
                }}
              >
                <div
                  className="font-display font-black text-base mb-0.5"
                  style={{ color: sdg.color }}
                >
                  {sdg.id}
                </div>
                <div
                  className="text-[9px] font-mono font-bold uppercase tracking-wide leading-tight"
                  style={{ color: sdg.color, opacity: 0.85 }}
                >
                  SDG {sdg.id}
                </div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                  {sdg.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div
      className="border-t"
      style={{ borderColor: 'rgba(6,61,39,0.08)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-sm text-emerald-950 dark:text-emerald-100">
            FoodLoop
          </span>
          <span
            className="w-1 h-1 rounded-full"
            style={{ background: 'rgba(6,61,39,0.25)' }}
          />
          <span className="text-xs text-slate-400">
            LoopLearn Hackathon 2026 &bull; PS-04
          </span>
        </div>
        <p className="text-[11px] text-slate-400 text-center">
          Smart Food Rescue Platform &mdash; Built with purpose &amp; Barakah
        </p>
        <p className="text-[10px] text-slate-300 dark:text-slate-600">
          &copy; 2026 FoodLoop Team
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
