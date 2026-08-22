import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BoxAvatarOverlay } from '../../components/common/BoxAvatarOverlay';
import { TiltCard } from '../../components/common/TiltCard';
import { MarkdownRenderer } from '../../components/common/MarkdownRenderer';
import { statsService } from '../../services/statsService';
import { authService } from '../../services/authService';
import { foodService } from '../../services/foodService';
import { aiService, SustainabilitySummaryResponse } from '../../services/aiService';
import { AdminStats, User, FoodListing } from '../../types';
import {
  FiBarChart2,
  FiCheckCircle,
  FiUsers,
  FiDroplet,
  FiCheckSquare,
  FiLayers,
  FiTrash2,
  FiRefreshCw,
  FiZap,
  FiCheck,
  FiShield,
  FiAlertCircle,
  FiFilter,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
} from 'react-icons/fi';

type AdminView = 'overview' | 'organizations' | 'listings' | 'users';

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Organizations
  const [allOrgs, setAllOrgs] = useState<User[]>([]);
  const [orgFilter, setOrgFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [verifyLoading, setVerifyLoading] = useState<string | null>(null);

  // Global Listings
  const [allListings, setAllListings] = useState<FoodListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  // Users Directory
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [usersLoading, setUsersLoading] = useState(false);

  // AI Sustainability Summary
  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [aiReport, setAiReport] = useState<SustainabilitySummaryResponse | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchAdminData = async () => {
    setStatsLoading(true);
    try {
      const [stats, orgRes, usersRes, listRes] = await Promise.all([
        statsService.getAdminStats(),
        authService.getUsers('organization'),
        authService.getUsers(),
        foodService.getListings({ status: 'all' }),
      ]);
      setAdminStats(stats);
      setAllOrgs(orgRes.users);
      setAllUsers(usersRes.users);
      setAllListings(listRes.listings);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyOrg = async (userId: string) => {
    setVerifyLoading(userId);
    try {
      await authService.verifyOrganization(userId);
      showToast('Organization verified successfully! They can now claim surplus food.');
      setAllOrgs((prev) =>
        prev.map((o) => (o.id === userId ? { ...o, isVerified: true } : o))
      );
      const updatedStats = await statsService.getAdminStats();
      setAdminStats(updatedStats);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to verify organization', 'error');
    } finally {
      setVerifyLoading(null);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Admin Action: Are you sure you want to permanently remove this listing?')) return;
    try {
      await foodService.deleteListing(id);
      showToast('Listing removed from platform');
      setAllListings((prev) => prev.filter((l) => l._id !== id));
      const updatedStats = await statsService.getAdminStats();
      setAdminStats(updatedStats);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to delete listing', 'error');
    }
  };

  const handleGenerateAIReport = async () => {
    setAiReportLoading(true);
    try {
      const res = await aiService.getSustainabilitySummary({
        totalListings: adminStats?.totalListings || allListings.length,
        foodRescued: adminStats?.foodRescued || 0,
        totalWasteReducedKg: adminStats?.totalWasteReducedKg || 0,
        totalCo2SavedKg: adminStats?.totalCo2SavedKg || 0,
        activeOrgs: adminStats?.activeOrgs || 0,
      });
      setAiReport(res);
      showToast('AI Sustainability Executive Report generated!');
    } catch (err: any) {
      showToast(err?.response?.data?.detail || 'Failed to generate AI report', 'error');
    } finally {
      setAiReportLoading(false);
    }
  };

  const totalListings = adminStats?.totalListings ?? allListings.length;
  const foodRescued = adminStats?.foodRescued ?? 0;
  const activeOrgs = adminStats?.activeOrgs ?? allOrgs.filter((o) => o.isVerified).length;
  const pendingOrgsCount = adminStats?.pendingOrgs ?? allOrgs.filter((o) => !o.isVerified).length;
  const totalCo2 = adminStats?.totalCo2SavedKg ?? 0;
  const totalWaste = adminStats?.totalWasteReducedKg ?? 0;

  // Filtered organizations
  const filteredOrgs = useMemo(() => {
    if (orgFilter === 'pending') return allOrgs.filter((o) => !o.isVerified);
    if (orgFilter === 'verified') return allOrgs.filter((o) => o.isVerified);
    return allOrgs;
  }, [allOrgs, orgFilter]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (userRoleFilter === 'all') return allUsers;
    return allUsers.filter((u) => u.role === userRoleFilter);
  }, [allUsers, userRoleFilter]);

  // SDG progress computations
  const sdgGoals = [
    {
      goal: 'SDG 2: Zero Hunger',
      desc: 'Target: 500 meals rescued and redistributed to vulnerable populations',
      progress: Math.min(100, Math.round((foodRescued / 500) * 100) || 12),
      metric: `${foodRescued} / 500 Meals`,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      goal: 'SDG 11: Sustainable Cities',
      desc: 'Target: 20 verified community relief hubs active in urban grid',
      progress: Math.min(100, Math.round((activeOrgs / 20) * 100) || 25),
      metric: `${activeOrgs} / 20 Verified Orgs`,
      color: 'from-amber-500 to-amber-600',
    },
    {
      goal: 'SDG 12: Responsible Consumption',
      desc: 'Target: 1,000 kg solid commercial food waste diverted from incinerators',
      progress: Math.min(100, Math.round((totalWaste / 1000) * 100) || 18),
      metric: `${totalWaste} / 1,000 kg Diverted`,
      color: 'from-teal-500 to-emerald-600',
    },
    {
      goal: 'SDG 13: Climate Action',
      desc: 'Target: 2,500 kg CO₂e greenhouse gas emissions prevented',
      progress: Math.min(100, Math.round((totalCo2 / 2500) * 100) || 20),
      metric: `${totalCo2} / 2,500 kg CO₂e`,
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  return (
    <div className="space-y-8 animate-slide-up pb-12">
      {/* Toast alert */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl border-2 shadow-pop-lg flex items-center gap-2 font-display text-xs font-bold animate-scale-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-950'
              : 'bg-rose-600 text-white border-rose-950'
          }`}
        >
          {toastMessage.type === 'success' ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#f4efe6] via-[#faf8f4] to-[#f4efe6] dark:from-[#0f1a14] dark:via-[#14241a] dark:to-[#0f1a14] border-2 border-emerald-950 dark:border-emerald-800 shadow-pop-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <BoxAvatarOverlay role="admin" size="lg" showBadge badgeText="Municipal Admin" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-black text-2xl sm:text-3xl text-emerald-950 dark:text-white tracking-tight">
                Municipal Food Oversight & Analytics
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-400">
                Citywide Governance
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Welcome, <strong className="text-indigo-900 dark:text-indigo-300">{currentUser?.name || 'Administrator'}</strong>! Monitor platform food rescue operations, verify NGOs, and track SDG sustainability milestones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={fetchAdminData}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-display font-black text-xs border-2 border-emerald-950 shadow-pop-sm flex items-center gap-2"
          >
            <FiRefreshCw className={statsLoading ? 'animate-spin' : ''} size={14} /> Refresh Data
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('overview');
              handleGenerateAIReport();
            }}
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-emerald-950 font-display font-black text-xs border-2 border-emerald-950 shadow-pop-gold flex items-center gap-2 transition-all active:scale-95"
          >
            <FiZap size={16} /> AI ESG Report
          </button>
        </div>
      </div>

      {/* Asymmetric Command Center KPI Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
        {/* Main Hero Municipal Governance Card (Span 7) — Light Touch */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <TiltCard intensity={4} className="h-full">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#fdfcf7] dark:bg-[#0f1a14] text-slate-900 dark:text-white border-2 border-emerald-950 dark:border-emerald-800 shadow-pop-sm flex flex-col justify-between h-full relative group">
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
                  <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-emerald-800 dark:text-emerald-300">
                    Citywide Zero-Waste Directorate
                  </span>
                  <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                    <FiShield size={11} />
                    <span>Municipal ESG Standard</span>
                  </div>
                </div>

                {/* Main Highlight Metric Split */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-1">
                  <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-[#14241a] border border-emerald-200 dark:border-emerald-800/60">
                    <div className="text-[10px] font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1 mb-0.5">
                      <FiCheckCircle className="text-emerald-600 dark:text-emerald-400" size={12} /> Total Food Rescued
                    </div>
                    <div className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
                      {statsLoading ? '...' : String(foodRescued)}
                    </div>
                    <div className="text-[9px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                      Meals diverted across all city providers
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-[#14241a] border border-indigo-200 dark:border-indigo-800/60">
                    <div className="text-[10px] font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1 mb-0.5">
                      <FiDroplet className="text-indigo-600 dark:text-indigo-400" size={12} /> Citywide GHG Mitigated
                    </div>
                    <div className="font-display font-black text-2xl sm:text-3xl text-indigo-800 dark:text-indigo-300 tracking-tight">
                      {statsLoading ? '...' : `${totalCo2} kg`}
                    </div>
                    <div className="text-[9px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                      {totalWaste} kg landfill solid waste avoided
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Municipal Milestone Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap text-[10px]">
                  <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold border border-indigo-300 dark:border-indigo-800">
                    UN SDG 11.6
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                    UN SDG 12.3
                  </span>
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                    Verified Nodes: <strong className="text-emerald-950 dark:text-white">{statsLoading ? '...' : activeOrgs}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveView('overview');
                    handleGenerateAIReport();
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:text-emerald-950 dark:hover:text-white transition-colors group/btn shrink-0"
                >
                  <FiZap size={12} />
                  <span>Generate ESG Report</span>
                  <FiArrowRight size={11} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Operations Center (Span 5: 2 Stacked Cards) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3">
          {/* Card 1: Municipal Food Surplus Flow */}
          <TiltCard intensity={5}>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950 dark:border-emerald-800 shadow-pop-sm flex flex-col justify-between h-full group hover:border-emerald-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-900/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <FiBarChart2 size={16} />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                  City Inventory
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-black text-2xl text-emerald-950 dark:text-white tracking-tight">
                    {statsLoading ? '...' : String(totalListings)}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    total batches logged
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  Municipal Food Flow & Surplus
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
                  <span>Across registered commercial donors</span>
                  <button
                    type="button"
                    onClick={() => setActiveView('listings')}
                    className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-0.5 text-[10px]"
                  >
                    View <FiArrowRight size={10} />
                  </button>
                </div>
              </div>
            </div>
          </TiltCard>

          {/* Card 2: Community Network & Verification Queue */}
          <TiltCard intensity={5}>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950 dark:border-emerald-800 shadow-pop-sm flex flex-col justify-between h-full group hover:border-indigo-600 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <FiUsers size={16} />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                  pendingOrgsCount > 0
                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border border-indigo-500/20'
                }`}>
                  {pendingOrgsCount > 0 ? `${pendingOrgsCount} Pending` : 'All Verified'}
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-black text-2xl text-emerald-950 dark:text-white tracking-tight">
                    {statsLoading ? '...' : String(activeOrgs)}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    charities ({pendingOrgsCount} pending)
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  Community Partner Network
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
                  <span>Municipal compliance & vetting</span>
                  <button
                    type="button"
                    onClick={() => setActiveView('organizations')}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-0.5 text-[10px]"
                  >
                    Queue <FiArrowRight size={10} />
                  </button>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>

      {/* Main View Navigation Tabs — Centered */}
      <div className="flex justify-center w-full my-2 sm:my-3">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#f4efe6] dark:bg-[#14241a] border-2 border-emerald-950/20 w-fit flex-wrap justify-center shadow-soft">
          <button
            type="button"
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2 rounded-xl font-display font-black text-xs transition-all flex items-center gap-2 ${
              activeView === 'overview'
                ? 'bg-emerald-700 text-white border-2 border-emerald-950 shadow-pop-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-emerald-900'
            }`}
          >
            <FiBarChart2 size={14} /> Platform SDGs & AI Summary
          </button>
          <button
            type="button"
            onClick={() => setActiveView('organizations')}
            className={`px-4 py-2 rounded-xl font-display font-black text-xs transition-all flex items-center gap-2 relative ${
              activeView === 'organizations'
                ? 'bg-emerald-700 text-white border-2 border-emerald-950 shadow-pop-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-emerald-900'
            }`}
          >
            <FiCheckSquare size={14} /> Org Verifications ({allOrgs.length})
            {pendingOrgsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black border border-emerald-950 flex items-center justify-center">
                {pendingOrgsCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveView('listings')}
            className={`px-4 py-2 rounded-xl font-display font-black text-xs transition-all flex items-center gap-2 ${
              activeView === 'listings'
                ? 'bg-emerald-700 text-white border-2 border-emerald-950 shadow-pop-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-emerald-900'
            }`}
          >
            <FiLayers size={14} /> Surplus Oversight ({allListings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('users')}
            className={`px-4 py-2 rounded-xl font-display font-black text-xs transition-all flex items-center gap-2 ${
              activeView === 'users'
                ? 'bg-emerald-700 text-white border-2 border-emerald-950 shadow-pop-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-emerald-900'
            }`}
          >
            <FiUsers size={14} /> User Directory ({allUsers.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: Overview & UN SDG Impact + AI ESG Report */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SDG Progress Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950/20 dark:border-emerald-800 shadow-soft space-y-6">
            <div>
              <h3 className="font-display font-black text-xl text-emerald-950 dark:text-white">
                United Nations SDG Progress Index
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Real-time tracking of civic sustainability impact across international SDG targets.
              </p>
            </div>

            <div className="space-y-4">
              {sdgGoals.map((sdg, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#faf8f4] dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-display font-bold text-xs text-slate-900 dark:text-white">
                      {sdg.goal}
                    </span>
                    <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                      {sdg.progress}% Complete
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">{sdg.desc}</p>
                  
                  {/* Progress bar */}
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700">
                    <div
                      className={`h-full bg-gradient-to-r ${sdg.color} transition-all duration-500 rounded-full`}
                      style={{ width: `${sdg.progress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-right font-mono text-slate-400 mt-1">
                    {sdg.metric}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Platform Sustainability Executive Report */}
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950/20 dark:border-emerald-800 shadow-soft flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-emerald-950 border border-emerald-950 flex items-center justify-center font-bold">
                    <FiZap size={16} />
                  </div>
                  <h3 className="font-display font-black text-xl text-emerald-950 dark:text-white">
                    AI Platform Sustainability Summary
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateAIReport}
                  disabled={aiReportLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs border border-emerald-950 shadow-pop-sm flex items-center gap-1.5"
                >
                  <FiRefreshCw className={aiReportLoading ? 'animate-spin' : ''} size={12} />
                  {aiReportLoading ? 'Generating...' : 'Refresh ESG Summary'}
                </button>
              </div>

              {aiReportLoading ? (
                <div className="p-12 text-center text-slate-500 font-medium">
                  <FiRefreshCw className="animate-spin inline-block mr-2 text-emerald-600" />
                  Groq LLM is synthesizing platform-wide ESG metrics, carbon emissions averted, and SDG compliance...
                </div>
              ) : aiReport ? (
                <div className="mt-4 p-5 rounded-2xl bg-[#faf8f4] dark:bg-slate-900 border-2 border-emerald-950/15 dark:border-emerald-800/30 text-xs leading-relaxed text-slate-800 dark:text-slate-200 space-y-3 max-h-96 overflow-y-auto">
                  <div className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 pb-1 border-b border-emerald-900/10 dark:border-emerald-700/20 flex items-center gap-1.5">
                    <FiZap className="text-amber-500" />
                    <span>Executive Briefing & Strategic ESG Synthesis</span>
                  </div>
                  <MarkdownRenderer content={aiReport.summary} />
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 space-y-3">
                  <p className="text-xs">
                    Click &quot;Refresh ESG Summary&quot; to have Groq generate an executive briefing analyzing platform rescue rates, CO2 avoidance, and civic impact.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateAIReport}
                    className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs border border-emerald-950 shadow-pop-sm"
                  >
                    Generate Initial Report
                  </button>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 text-[11px] text-indigo-900 dark:text-indigo-300">
              💡 <strong>Compliance Note:</strong> All ESG metrics conform to ISO 14064 GHG mitigation estimation standards (1 kg food waste ≈ 2.5 kg CO2e).
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Organization Verification Management */}
      {activeView === 'organizations' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950/20 dark:border-emerald-800 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-display font-black text-lg text-emerald-950 dark:text-white">
                Community Organization Verification Registry
              </h2>
              <p className="text-xs text-slate-500">
                Verify non-profits, shelters, and food banks before permitting surplus food claims.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOrgFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  orgFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                All ({allOrgs.length})
              </button>
              <button
                type="button"
                onClick={() => setOrgFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  orgFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Pending ({allOrgs.filter((o) => !o.isVerified).length})
              </button>
              <button
                type="button"
                onClick={() => setOrgFilter('verified')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  orgFilter === 'verified'
                    ? 'bg-emerald-600 text-white font-black'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Verified ({allOrgs.filter((o) => o.isVerified).length})
              </button>
            </div>
          </div>

          {filteredOrgs.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No organizations match the selected filter.</p>
          ) : (
            <div className="space-y-3">
              {filteredOrgs.map((org) => (
                <div
                  key={org.id}
                  className="p-4 rounded-2xl bg-[#faf8f4] dark:bg-slate-900/80 border-2 border-emerald-950/15 dark:border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <BoxAvatarOverlay role="organization" size="sm" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                          {org.organizationName || org.name}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                            org.isVerified
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                              : 'bg-amber-100 text-amber-800 border-amber-400'
                          }`}
                        >
                          {org.isVerified ? 'Verified Org' : 'Pending Review'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Contact: <strong>{org.name}</strong> &bull; <FiMail className="inline text-slate-400 ml-1" /> {org.email}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        {org.phone && (
                          <span className="flex items-center gap-1">
                            <FiPhone size={11} /> {org.phone}
                          </span>
                        )}
                        {org.address && (
                          <span className="flex items-center gap-1 truncate max-w-xs">
                            <FiMapPin size={11} /> {org.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!org.isVerified ? (
                      <button
                        type="button"
                        onClick={() => handleVerifyOrg(org.id!)}
                        disabled={verifyLoading === org.id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs border-2 border-emerald-950 shadow-pop-sm flex items-center gap-1.5"
                      >
                        <FiCheck size={14} /> {verifyLoading === org.id ? 'Verifying...' : 'Verify Organization'}
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-300">
                        <FiCheckCircle /> Verified & Authorized
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Global Surplus Oversight */}
      {activeView === 'listings' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950/20 dark:border-emerald-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-display font-black text-lg text-emerald-950 dark:text-white">
                Platform Food Listings Oversight
              </h2>
              <p className="text-xs text-slate-500">
                Manage and audit all food surplus postings across all food providers.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600">
              Total: {allListings.length} Listings
            </span>
          </div>

          {allListings.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No listings recorded on platform yet.</p>
          ) : (
            <div className="space-y-3">
              {allListings.map((item) => {
                const provider = typeof item.providerId === 'object' ? item.providerId : null;

                return (
                  <div
                    key={item._id}
                    className="p-4 rounded-2xl bg-[#faf8f4] dark:bg-slate-900/80 border-2 border-emerald-950/15 dark:border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                          {item.foodName}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {item.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-300">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Provider: <strong>{provider?.name || 'Kitchen'}</strong> &bull; Quantity: <strong>{item.quantity} {item.unit}</strong> &bull; Location: {item.pickupLocation}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Posted: {new Date(item.createdAt).toLocaleString()} &bull; Expires: {new Date(item.expiryDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDeleteListing(item._id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <FiTrash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: User Directory */}
      {activeView === 'users' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950/20 dark:border-emerald-800 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-display font-black text-lg text-emerald-950 dark:text-white">
                Platform User Directory
              </h2>
              <p className="text-xs text-slate-500">
                View all registered FoodLoop providers, community organizations, and admins.
              </p>
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">All Roles</option>
              <option value="provider">Food Providers</option>
              <option value="organization">Community Orgs</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div className="space-y-2">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="p-3.5 rounded-2xl bg-[#faf8f4] dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <BoxAvatarOverlay
                    role={u.role === 'provider' ? 'donor' : u.role === 'organization' ? 'organization' : 'admin'}
                    size="sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-xs text-slate-900 dark:text-white">
                        {u.name}
                      </span>
                      {u.organizationName && (
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                          ({u.organizationName})
                        </span>
                      )}
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                          u.role === 'admin'
                            ? 'bg-indigo-100 text-indigo-800'
                            : u.role === 'organization'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {u.email} {u.phone ? `• ${u.phone}` : ''} {u.address ? `• ${u.address}` : ''}
                    </p>
                  </div>
                </div>

                <div>
                  {u.role === 'organization' && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${u.isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'}`}>
                      {u.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
