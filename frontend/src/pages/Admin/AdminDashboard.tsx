import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BoxAvatarOverlay } from '../../components/common/BoxAvatarOverlay';
import { TiltCard } from '../../components/common/TiltCard';
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

      {/* 4 Interactive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: <FiBarChart2 className="text-emerald-700 dark:text-emerald-400" size={24} />,
            label: 'Total Surplus Listings',
            value: statsLoading ? '...' : String(totalListings),
            sub: 'Cumulative food batches created',
            badgeBg: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
            borderColor: 'border-emerald-950 dark:border-emerald-800',
          },
          {
            icon: <FiCheckCircle className="text-amber-600 dark:text-amber-400" size={24} />,
            label: 'Meals Diverted & Rescued',
            value: statsLoading ? '...' : String(foodRescued),
            sub: 'Meals served to hungry citizens',
            badgeBg: 'bg-amber-500/10 text-amber-800 dark:text-amber-300',
            borderColor: 'border-emerald-950 dark:border-emerald-800',
          },
          {
            icon: <FiUsers className="text-indigo-600 dark:text-indigo-400" size={24} />,
            label: 'Verified Community Orgs',
            value: statsLoading ? '...' : String(activeOrgs),
            sub: `${pendingOrgsCount} pending verification`,
            badgeBg: 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300',
            borderColor: 'border-emerald-950 dark:border-emerald-800',
          },
          {
            icon: <FiDroplet className="text-emerald-700 dark:text-emerald-400" size={24} />,
            label: 'Citywide CO\u2082 Saved',
            value: statsLoading ? '...' : `${totalCo2} kg`,
            sub: `${totalWaste} kg waste diverted`,
            badgeBg: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
            borderColor: 'border-emerald-950 dark:border-emerald-800',
          },
        ].map((kpi, idx) => (
          <TiltCard key={idx} intensity={8}>
            <div className={`p-5 rounded-3xl bg-white dark:bg-[#0f1a14] border-2 ${kpi.borderColor} shadow-pop-sm flex flex-col justify-between h-full`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-900/20 flex items-center justify-center">
                  {kpi.icon}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${kpi.badgeBg}`}>
                  Municipal KPI
                </span>
              </div>
              <div>
                <div className="font-display font-black text-3xl text-emerald-950 dark:text-white tracking-tight">
                  {kpi.value}
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{kpi.label}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{kpi.sub}</div>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>

      {/* Main View Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#f4efe6] dark:bg-[#14241a] border-2 border-emerald-950/20 w-fit flex-wrap">
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
                <div className="mt-4 p-5 rounded-2xl bg-[#faf8f4] dark:bg-slate-900 border-2 border-emerald-950/15 dark:border-emerald-800/30 text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line space-y-2 max-h-96 overflow-y-auto">
                  <div className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 mb-1">
                    Executive Briefing
                  </div>
                  {aiReport.summary}
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
