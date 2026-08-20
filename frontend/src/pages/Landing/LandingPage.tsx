import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiCheckCircle,
  FiHeart,
  FiShield,
  FiUsers,
  FiPackage,
  FiTruck,
  FiMapPin,
  FiClock,
  FiTrendingUp,
  FiBarChart2,
  FiCpu,
} from 'react-icons/fi';
import { TiltCard } from '../../components/common/TiltCard';
import { BoxAvatarOverlay } from '../../components/common/BoxAvatarOverlay';

export const LandingPage: React.FC = () => {
  const [mealCount, setMealCount] = useState<number>(75);

  const co2SavedKg = Math.round(mealCount * 1.85);
  const familiesFed = Math.round(mealCount / 3.2);
  const barakahPoints = mealCount * 10;
  const moneySavedVal = Math.round(mealCount * 4.5);

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20 w-full" data-testid="landing-page-container">

      {/* ========== 1. HERO SECTION ========== */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-emerald-900/30 dark:border-emerald-700/40 bg-gradient-to-br from-emerald-900 via-emerald-950 to-[#041c10] text-white p-6 sm:p-10 md:p-16 shadow-pop-gold">
        <div className="absolute inset-0 opacity-10 bg-islamic-lattice pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left Content */}
          <div className="flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/40 text-xs font-display font-bold tracking-wide w-fit">
              <span>🌙</span>
              <span>Zero Food Waste Movement</span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08] text-white">
              Donate Food.{' '}
              <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-300 bg-clip-text text-transparent">
                Save Lives.
              </span>
              <br />
              <span className="text-emerald-200">Share Blessed Rizq.</span>
            </h1>

            <p className="text-emerald-100/80 text-base md:text-lg leading-relaxed max-w-xl">
              Transform surplus commercial meals and fresh harvest into wholesome sustenance for local shelters and families. Verified logistics, safety compliance, and direct community impact.
            </p>

            <div className="flex flex-wrap gap-2 text-xs font-semibold text-emerald-100">
              <span className="flex items-center gap-1.5 bg-emerald-950/70 px-3 py-1.5 rounded-xl border border-emerald-600/50">
                <FiCheckCircle className="text-amber-400" /> Save Food
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-950/70 px-3 py-1.5 rounded-xl border border-emerald-600/50">
                <FiHeart className="text-rose-400" /> Save Lives
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-950/70 px-3 py-1.5 rounded-xl border border-emerald-600/50">
                <FiShield className="text-amber-400" /> Legal Shield
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-950/70 px-3 py-1.5 rounded-xl border border-emerald-600/50">
                <FiUsers className="text-emerald-300" /> Share Rizq
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to="/register/provider"
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-display font-bold text-sm rounded-xl border-2 border-slate-900 shadow-pop-gold transition-all flex items-center justify-center gap-2 group active:scale-95"
              >
                <span>Donate Surplus Food</span>
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register/organization"
                className="px-6 py-3.5 bg-emerald-950/80 hover:bg-emerald-900 text-amber-200 font-display font-bold text-sm rounded-xl border-2 border-amber-400/50 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Browse Community Relief</span>
              </Link>
              <Link
                to="/login"
                className="px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-display font-semibold text-sm rounded-xl border border-white/25 backdrop-blur-sm transition-all flex items-center justify-center gap-1.5"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right: Animated Food Rescue Visual (no images, pure CSS) */}
          <div className="relative flex justify-center items-center">
            <div className="relative w-full max-w-sm">
              {/* Glowing backdrop */}
              <div className="absolute -inset-6 bg-gradient-to-r from-amber-400/20 via-emerald-400/20 to-amber-500/20 rounded-3xl blur-2xl animate-pulse-glow" />

              {/* Main card */}
              <div className="relative border-2 border-amber-400/60 rounded-3xl overflow-hidden shadow-pop-gold bg-emerald-950/90 backdrop-blur-sm p-8">
                <div className="text-center space-y-4">
                  <div className="text-7xl animate-float-slow">🧺</div>
                  <h3 className="font-display font-bold text-xl text-amber-200">Fresh Food Basket</h3>
                  <p className="text-emerald-200/70 text-sm">Ready for rescue & redistribution</p>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="bg-emerald-900/60 rounded-xl p-3 border border-emerald-700/50">
                      <div className="text-2xl mb-1">🍞</div>
                      <div className="font-display font-bold text-amber-200 text-lg">1,420</div>
                      <div className="text-[10px] text-emerald-300">Meals Rescued</div>
                    </div>
                    <div className="bg-emerald-900/60 rounded-xl p-3 border border-emerald-700/50">
                      <div className="text-2xl mb-1">👨‍👩‍👧</div>
                      <div className="font-display font-bold text-amber-200 text-lg">480</div>
                      <div className="text-[10px] text-emerald-300">Families Fed</div>
                    </div>
                    <div className="bg-emerald-900/60 rounded-xl p-3 border border-emerald-700/50">
                      <div className="text-2xl mb-1">🏪</div>
                      <div className="font-display font-bold text-amber-200 text-lg">85+</div>
                      <div className="text-[10px] text-emerald-300">Partner Stores</div>
                    </div>
                    <div className="bg-emerald-900/60 rounded-xl p-3 border border-emerald-700/50">
                      <div className="text-2xl mb-1">🚐</div>
                      <div className="font-display font-bold text-amber-200 text-lg">45 min</div>
                      <div className="text-[10px] text-emerald-300">Avg Pickup Time</div>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-2 -right-2 bg-emerald-800 text-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-600 animate-float-reverse shadow-sm">
                  100% Halal Verified
                </div>
                <div className="absolute -bottom-2 -left-2 bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500 animate-float-slow shadow-sm">
                  AI Matched
                </div>
              </div>

              {/* Box avatars floating around */}
              <div className="absolute -left-8 top-1/4 animate-float-slow">
                <BoxAvatarOverlay role="chef" size="sm" />
              </div>
              <div className="absolute -right-8 top-1/3 animate-float-reverse">
                <BoxAvatarOverlay role="volunteer" size="sm" />
              </div>
              <div className="absolute -bottom-4 left-1/4 animate-float-slow">
                <BoxAvatarOverlay role="family" size="sm" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 2. THE PROBLEM SECTION ========== */}
      <section id="problem" className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-display font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            The Crisis We Face
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mt-3">
            Surplus Food Goes to Waste Every Single Day
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Restaurants, bakeries, and grocery stores throw away tons of perfectly edible food daily, while families go hungry. This is the paradox we must solve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 shadow-soft text-center">
            <div className="text-5xl mb-4">🗑️</div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">1.3 Billion Tons</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">of food is wasted globally each year, producing harmful methane gas in landfills.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 shadow-soft text-center">
            <div className="text-5xl mb-4">😔</div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">828 Million Hungry</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">people worldwide face food insecurity while edible surplus gets destroyed daily.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft text-center">
            <div className="text-5xl mb-4">🏭</div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">8-10% Global Emissions</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">from food waste alone. If food waste were a country, it would be the 3rd largest emitter.</p>
          </div>
        </div>
      </section>

      {/* ========== 3. THE ROAD: PROBLEM → SOLUTION ========== */}
      <section id="solution" className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-display font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            The FoodLoop Journey
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mt-3">
            From Surplus Waste to Families Fed
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Follow the rescue road — every meal has a journey from kitchen to community table.
          </p>
        </div>

        {/* Road with checkpoints */}
        <div className="relative">
          {/* Road line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 via-amber-400 to-emerald-500 rounded-full transform -translate-x-1/2 animate-road-pulse" />

          {/* Mobile road line */}
          <div className="md:hidden absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-400 via-amber-400 to-emerald-500 rounded-full" />

          <div className="flex flex-col gap-8 md:gap-12">
            {/* Checkpoint 1: Surplus Identified */}
            <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div className="md:w-1/2 md:text-right md:pr-12 pl-14 md:pl-0">
                <div className="bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900/40 rounded-2xl p-5 shadow-soft">
                  <div className="flex items-center gap-2 mb-2 md:justify-end">
                    <span className="text-2xl">🏪</span>
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Surplus Identified</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Restaurants, bakeries, and grocery stores identify excess food before expiration.</p>
                </div>
              </div>
              {/* Pit stop marker */}
              <div className="absolute left-3 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full bg-rose-500 border-4 border-white dark:border-slate-900 shadow-pop-sm flex items-center justify-center z-10">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div className="md:w-1/2 md:pl-12" />
            </div>

            {/* Checkpoint 2: AI Matching */}
            <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div className="md:w-1/2 md:pr-12" />
              <div className="absolute left-3 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full bg-amber-500 border-4 border-white dark:border-slate-900 shadow-pop-sm flex items-center justify-center z-10">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div className="md:w-1/2 md:pl-12 pl-14">
                <div className="bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900/40 rounded-2xl p-5 shadow-soft">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🤖</span>
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">AI Smart Matching</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">FoodLoop AI matches surplus batches with nearby community organizations based on need, distance, and dietary requirements.</p>
                </div>
              </div>
            </div>

            {/* Checkpoint 3: Claim & Verify */}
            <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div className="md:w-1/2 md:text-right md:pr-12 pl-14 md:pl-0">
                <div className="bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-5 shadow-soft">
                  <div className="flex items-center gap-2 mb-2 md:justify-end">
                    <span className="text-2xl">✅</span>
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Claim & Verify</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Organizations claim food batches. Safety checks verify temperature compliance and halal requirements.</p>
                </div>
              </div>
              <div className="absolute left-3 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full bg-emerald-400 border-4 border-white dark:border-slate-900 shadow-pop-sm flex items-center justify-center z-10">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div className="md:w-1/2 md:pl-12" />
            </div>

            {/* Checkpoint 4: Volunteer Pickup */}
            <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div className="md:w-1/2 md:pr-12" />
              <div className="absolute left-3 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 shadow-pop-sm flex items-center justify-center z-10">
                <span className="text-white text-xs font-bold">4</span>
              </div>
              <div className="md:w-1/2 md:pl-12 pl-14">
                <div className="bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-5 shadow-soft">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🚐</span>
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Volunteer Fleet Pickup</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Temperature-controlled volunteer vehicles pick up surplus within 45 minutes and deliver to verified shelters.</p>
                </div>
              </div>
            </div>

            {/* Checkpoint 5: Families Fed */}
            <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div className="md:w-1/2 md:text-right md:pr-12 pl-14 md:pl-0">
                <div className="bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950/50 dark:to-amber-950/30 border-2 border-emerald-400 dark:border-emerald-600 rounded-2xl p-5 shadow-pop-sm">
                  <div className="flex items-center gap-2 mb-2 md:justify-end">
                    <span className="text-2xl">🤲</span>
                    <h3 className="font-display font-bold text-base text-emerald-900 dark:text-emerald-200">Families Blessed with Rizq</h3>
                  </div>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">Verified food pantries and shelters receive warm meal batches. Community Barakah multiplies. Zero waste achieved.</p>
                </div>
              </div>
              <div className="absolute left-3 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 border-4 border-white dark:border-slate-900 shadow-pop-gold flex items-center justify-center z-10">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <div className="md:w-1/2 md:pl-12" />
            </div>
          </div>
        </div>
      </section>

      {/* ========== 4. WHY FOODLOOP (4 Pillars) ========== */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white">
            Why We Rescue & Share Surplus
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: '📋', title: 'Benefits of Donations', desc: 'Tax-deductible ESG receipts, automated pickup in 60s, Good Samaritan legal shield, real-time Barakah tracking.', color: 'amber' },
            { icon: '🥗', title: 'Donate Surplus Food', desc: 'Bakeries, restaurants & catering list surplus. Instant camera expiry analysis, portion tracking.', color: 'emerald' },
            { icon: '🌱', title: 'Save Food & Earth', desc: 'Divert edible meals from landfills, prevent methane emission, align with UN SDGs.', color: 'emerald' },
            { icon: '❤️', title: 'Save Lives & Dignity', desc: 'Verified food pantries & shelters receive meals. 1-Click claiming, respectful transparent aid.', color: 'rose' },
          ].map((card, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border-2 border-emerald-900/20 dark:border-emerald-700/30 rounded-2xl p-5 shadow-soft hover:shadow-pop-sm transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1.5">{card.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== 5. 3D DASHBOARD PREVIEW CARDS ========== */}
      <section id="dashboards" className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-display font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            Three Powerful Dashboards
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mt-3">
            A Dashboard for Every Role
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Each portal is purpose-built with AI-powered tools for donors, relief organizations, and city administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Food Donors Hub */}
          <TiltCard intensity={12}>
            <div className="bg-white dark:bg-slate-900 border-2 border-emerald-900/20 dark:border-emerald-700/30 rounded-2xl p-6 shadow-soft hover:shadow-pop-sm transition-all h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <BoxAvatarOverlay role="donor" size="md" showBadge badgeText="Provider" />
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Food Donors Hub</h3>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Commercial Kitchens & Markets</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 flex-1">
                List surplus meals in 60 seconds. Track batches, review claims, download ESG receipts.
              </p>
              <div className="space-y-2 mb-4">
                {['Donors Dashboard', 'Surplus Inventory', 'Incoming Claims', 'Rescue Impact Stats', 'AI Redistribution'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <FiCheckCircle className="text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/register/provider"
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-display font-bold text-xs rounded-xl border-2 border-emerald-900 shadow-pop-sm transition-all flex items-center justify-center gap-1.5"
              >
                <span>Launch Donors Hub</span>
                <FiArrowRight />
              </Link>
            </div>
          </TiltCard>

          {/* Card 2: Community Relief Portal */}
          <TiltCard intensity={12}>
            <div className="bg-white dark:bg-slate-900 border-2 border-amber-400/40 dark:border-amber-700/30 rounded-2xl p-6 shadow-soft hover:shadow-pop-sm transition-all h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <BoxAvatarOverlay role="organization" size="md" showBadge badgeText="Org" />
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Community Relief</h3>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Food Banks & Shelters</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 flex-1">
                Browse live surplus listings. Submit claims, schedule pickup times, track meal distribution.
              </p>
              <div className="space-y-2 mb-4">
                {['Community Hub Overview', 'Browse Food Surplus', 'My Claim Orders', 'Meal Analytics', 'AI Safety & Assist'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <FiCheckCircle className="text-amber-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/register/organization"
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-display font-bold text-xs rounded-xl border-2 border-amber-800 shadow-pop-sm transition-all flex items-center justify-center gap-1.5"
              >
                <span>Launch Relief Portal</span>
                <FiArrowRight />
              </Link>
            </div>
          </TiltCard>

          {/* Card 3: Municipal Governance */}
          <TiltCard intensity={12}>
            <div className="bg-white dark:bg-slate-900 border-2 border-indigo-400/40 dark:border-indigo-700/30 rounded-2xl p-6 shadow-soft hover:shadow-pop-sm transition-all h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <BoxAvatarOverlay role="admin" size="md" showBadge badgeText="Admin" />
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Municipal Governance</h3>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Citywide Administration</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 flex-1">
                Monitor zero-waste metrics, verify organizations, audit safety compliance, track UN SDGs.
              </p>
              <div className="space-y-2 mb-4">
                {['Platform Overview', 'Surplus Oversight', 'Org Verification', 'User Directory', 'AI Governance'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <FiCheckCircle className="text-indigo-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/login"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-xs rounded-xl border-2 border-indigo-800 shadow-pop-sm transition-all flex items-center justify-center gap-1.5"
              >
                <span>Launch Governance Hub</span>
                <FiArrowRight />
              </Link>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ========== 6. INTERACTIVE BARAKAH CALCULATOR ========== */}
      <section id="impact" className="bg-white dark:bg-slate-900 border-2 border-emerald-900/20 dark:border-emerald-700/30 rounded-3xl p-6 sm:p-10 shadow-soft relative overflow-hidden">
        <div className="absolute inset-0 bg-food-dots opacity-50 pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left */}
          <div className="space-y-5 text-left">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-display font-bold text-xs border border-amber-300 dark:border-amber-800">
              <span>⚡</span> Interactive Impact Simulator
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Calculate Your Food Rescue Impact
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Slide the meal quantity to see how surplus portions prevent environmental damage and feed local households.
            </p>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold text-slate-800 dark:text-slate-200">
                <span>Surplus Meals Donated:</span>
                <span className="text-xl font-display font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-300 dark:border-emerald-800">
                  {mealCount} Meals
                </span>
              </div>
              <input
                type="range" min="10" max="500" step="5" value={mealCount}
                onChange={(e) => setMealCount(parseInt(e.target.value))}
                className="w-full h-2.5 bg-emerald-100 dark:bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                aria-label="Adjust surplus meals quantity"
              />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Quick:</span>
                {[25, 50, 100, 250, 500].map((preset) => (
                  <button
                    key={preset} type="button" onClick={() => setMealCount(preset)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                      mealCount === preset
                        ? 'bg-emerald-700 text-amber-200 border-emerald-900 shadow-pop-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
              <span className="text-2xl">🌱</span>
              <div className="font-display font-black text-2xl text-emerald-800 dark:text-emerald-300 mt-1">{co2SavedKg} kg</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">CO₂ Prevented</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Zero landfill decomposition</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
              <div className="font-display font-black text-2xl text-amber-800 dark:text-amber-300 mt-1">{familiesFed}</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">Families Nourished</div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">Warm meal portions</div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4">
              <span className="text-2xl">💰</span>
              <div className="font-display font-black text-2xl text-indigo-800 dark:text-indigo-300 mt-1">${moneySavedVal}</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">Food Value Rescued</div>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">Tax-deductible ESG credit</div>
            </div>
            <div className="bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 rounded-2xl p-4 shadow-pop-sm">
              <span className="text-2xl">✨</span>
              <div className="font-display font-black text-2xl text-amber-900 dark:text-amber-200 mt-1">+{barakahPoints}</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">Barakah Points</div>
              <div className="text-[10px] text-amber-700 dark:text-amber-300 mt-1">Community blessing multiplier</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 7. BOTTOM CTA ========== */}
      <section className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-[#041c10] border-2 border-amber-400/60 rounded-3xl p-8 sm:p-12 text-center text-white shadow-pop-gold relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-islamic-lattice pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-amber-100">
            Ready to Share Rizq & Stop Food Waste?
          </h2>
          <p className="text-sm text-emerald-100/80 leading-relaxed">
            Whether you are a commercial kitchen donating excess or a community kitchen feeding families, FoodLoop brings everyone together with dignity and Barakah.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-display font-bold text-sm rounded-xl border-2 border-slate-900 shadow-pop-gold transition-all flex items-center justify-center gap-2"
            >
              <span>Create Free Account</span>
              <FiArrowRight />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3.5 bg-emerald-950/80 hover:bg-emerald-900 text-amber-200 font-display font-bold text-sm rounded-xl border-2 border-amber-400/50 transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to Portal</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
