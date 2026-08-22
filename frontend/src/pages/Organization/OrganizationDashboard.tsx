import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFood } from '../../context/FoodContext';
import { BoxAvatarOverlay } from '../../components/common/BoxAvatarOverlay';
import { TiltCard } from '../../components/common/TiltCard';
import { MarkdownRenderer } from '../../components/common/MarkdownRenderer';
import { foodService } from '../../services/foodService';
import { requestService } from '../../services/requestService';
import { aiService } from '../../services/aiService';
import { FoodListing, ClaimRequest } from '../../types';
import {
  FiSearch,
  FiPackage,
  FiCheckCircle,
  FiDroplet,
  FiCoffee,
  FiBox,
  FiShoppingBag,
  FiMapPin,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiFilter,
  FiCpu,
  FiCheck,
  FiShield,
  FiX,
  FiSend,
  FiArrowRight,
  FiUser,
} from 'react-icons/fi';

type OrgView = 'browse' | 'claims' | 'ai-match';

const OrganizationDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { organizationStats, statsLoading, fetchStats } = useFood();

  const [activeView, setActiveView] = useState<OrgView>('browse');
  const [availableListings, setAvailableListings] = useState<FoodListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [myClaims, setMyClaims] = useState<ClaimRequest[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Claim Modal State
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [claimQuantity, setClaimQuantity] = useState(1);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // AI Matching state
  const [aiMatchQuery, setAiMatchQuery] = useState('Find available meals or bakery items for immediate pickup.');
  const [aiMatchLoading, setAiMatchLoading] = useState(false);
  const [aiMatchResponse, setAiMatchResponse] = useState<string | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const loadOrgData = async () => {
    setListingsLoading(true);
    setClaimsLoading(true);
    try {
      const { listings } = await foodService.getListings({ status: 'available' });
      setAvailableListings(listings);
      const { requests } = await requestService.getRequests();
      setMyClaims(requests);
      await fetchStats();
    } catch (err: any) {
      console.error('Failed to load organization data:', err);
    } finally {
      setListingsLoading(false);
      setClaimsLoading(false);
    }
  };

  useEffect(() => {
    loadOrgData();
  }, [currentUser]);

  const openClaimModal = (listing: FoodListing) => {
    setSelectedListing(listing);
    setClaimQuantity(listing.quantity);
    setClaimMessage(`Hi, our shelter would love to collect this ${listing.foodName}. We have transport ready.`);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;

    if (!currentUser?.isVerified) {
      showToast('Account pending verification by admin before you can claim surplus food.', 'error');
      return;
    }

    setClaimSubmitting(true);
    try {
      await requestService.createRequest({
        foodListingId: selectedListing._id,
        requestedQuantity: Number(claimQuantity),
        message: claimMessage,
      });
      showToast('Claim request sent to food provider successfully!');
      setSelectedListing(null);
      await loadOrgData();
      setActiveView('claims');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to submit claim request', 'error');
    } finally {
      setClaimSubmitting(false);
    }
  };

  const handleMarkCollected = async (requestId: string) => {
    setActionLoading(`col-${requestId}`);
    try {
      await requestService.markCollected(requestId);
      showToast('Surplus marked as collected! CO2 & meal counters updated.');
      await loadOrgData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to mark as collected', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRunAiMatch = async () => {
    if (!aiMatchQuery.trim()) return;
    setAiMatchLoading(true);
    try {
      const res = await aiService.runAgent(aiMatchQuery);
      setAiMatchResponse(res.response);
      showToast('Agentic food matching completed!');
    } catch (err: any) {
      showToast(err?.response?.data?.detail || 'AI Matching failed. Check Groq API configuration.', 'error');
    } finally {
      setAiMatchLoading(false);
    }
  };

  // Filtered available food
  const filteredListings = useMemo(() => {
    return availableListings.filter((item) => {
      const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesSearch =
        !searchQuery ||
        item.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof item.providerId === 'object' && item.providerId?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [availableListings, categoryFilter, searchQuery]);

  const totalRequests = organizationStats?.totalRequests ?? myClaims.length;
  const pendingRequests = organizationStats?.pendingRequests ?? myClaims.filter((r) => r.status === 'pending').length;
  const collectedFood = organizationStats?.collectedFood ?? myClaims.filter((r) => r.status === 'collected').length;
  const co2Saved = organizationStats?.co2SavedKg ?? 0;

  const navigateToView = (view: 'browse' | 'claims' | 'ai-match') => {
    setActiveView(view);
    setTimeout(() => {
      document.getElementById('dashboard-views-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

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

      {/* Verification Notice Banner if not verified */}
      {currentUser && !currentUser.isVerified && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500/50 shadow-soft flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="text-amber-600 dark:text-amber-400 shrink-0" size={20} />
            <div>
              <h4 className="font-display font-bold text-xs text-amber-950 dark:text-amber-200">
                Organization Verification Pending
              </h4>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                Your organization profile is awaiting municipal verification by the admin. You can browse surplus in read-only mode.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase">
            Pending
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#f4efe6] via-[#faf8f4] to-[#f4efe6] dark:from-[#0f1a14] dark:via-[#14241a] dark:to-[#0f1a14] border-2 border-emerald-950 dark:border-emerald-800 shadow-pop-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <BoxAvatarOverlay role="organization" size="lg" showBadge badgeText="Community Org" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-black text-2xl sm:text-3xl text-emerald-950 dark:text-white tracking-tight">
                Community Distribution Hub
              </h1>
              {currentUser?.isVerified ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-400 flex items-center gap-1">
                  <FiCheckCircle size={10} /> Verified Partner
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-400">
                  Verification Pending
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Welcome, <strong className="text-amber-800 dark:text-amber-300">{currentUser?.organizationName || currentUser?.name || 'Community Leader'}</strong>! Connect with local donors, claim surplus meals, and nourish families.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link
            to="/organization/profile"
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-800 dark:text-slate-200 font-display font-black text-xs border-2 border-emerald-950 shadow-pop-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <FiUser size={15} className="text-amber-600" /> Manage Profile
          </Link>
          <button
            type="button"
            onClick={() => navigateToView('browse')}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs border-2 border-emerald-950 shadow-pop-emerald flex items-center gap-2 transition-all active:scale-95"
          >
            <FiSearch size={16} /> Browse Surplus
          </button>
          <button
            type="button"
            onClick={() => navigateToView('ai-match')}
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-emerald-950 font-display font-black text-xs border-2 border-emerald-950 shadow-pop-gold flex items-center gap-2 transition-all active:scale-95"
          >
            <FiCpu size={16} /> AI Food Matcher
          </button>
        </div>
      </div>

      {/* Asymmetric Command Center KPI Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
        {/* Main Hero Community Impact Card (Span 7) — Light Touch */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <TiltCard intensity={4} className="h-full">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#fdfcf7] dark:bg-[#0f1a14] text-slate-900 dark:text-white border-2 border-emerald-950 dark:border-emerald-800 shadow-pop-sm flex flex-col justify-between h-full relative group">
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
                  <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-800 dark:text-amber-300">
                    Community Hunger Relief Operations
                  </span>
                  <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <FiShield size={11} />
                    <span>Verified Charity Hub</span>
                  </div>
                </div>

                {/* Main Highlight Metric Split */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-1">
                  <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-[#14241a] border border-amber-200 dark:border-emerald-800/60">
                    <div className="text-[10px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1 mb-0.5">
                      <FiCheckCircle className="text-amber-600 dark:text-amber-400" size={12} /> Rescued Meals Distributed
                    </div>
                    <div className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
                      {statsLoading ? '...' : String(collectedFood)}
                    </div>
                    <div className="text-[9px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                      Nutritious meals provided to individuals in need
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-[#14241a] border border-emerald-200 dark:border-emerald-800/60">
                    <div className="text-[10px] font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1 mb-0.5">
                      <FiDroplet className="text-emerald-600 dark:text-emerald-400" size={12} /> CO₂ Footprint Avoided
                    </div>
                    <div className="font-display font-black text-2xl sm:text-3xl text-emerald-700 dark:text-emerald-300 tracking-tight">
                      {statsLoading ? '...' : `${co2Saved} kg`}
                    </div>
                    <div className="text-[9px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                      GHG emissions prevented via food rescue
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Relief Milestone Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap text-[10px]">
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800">
                    SDG 2: Zero Hunger
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                    SDG 11.6: Sustainable Cities
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigateToView('ai-match')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white transition-colors group/btn shrink-0"
                >
                  <FiCpu size={12} />
                  <span>AI Smart Matcher</span>
                  <FiArrowRight size={11} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Operations Center (Span 5: 2 Stacked Cards) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3">
          {/* Card 1: Available Surplus Batches */}
          <TiltCard intensity={5}>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950 dark:border-emerald-800 shadow-pop-sm flex flex-col justify-between h-full group hover:border-amber-600 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <FiSearch size={16} />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                  Available Now
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-black text-2xl text-emerald-950 dark:text-white tracking-tight">
                    {statsLoading ? '...' : String(availableListings.length)}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    batches ready for pickup
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  Surplus Food Listings
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
                  <span>Filtered by fresh safety window</span>
                  <button
                    type="button"
                    onClick={() => navigateToView('browse')}
                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline inline-flex items-center gap-0.5 text-[10px]"
                  >
                    Browse <FiArrowRight size={10} />
                  </button>
                </div>
              </div>
            </div>
          </TiltCard>

          {/* Card 2: Active Claims & Tracking */}
          <TiltCard intensity={5}>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950 dark:border-emerald-800 shadow-pop-sm flex flex-col justify-between h-full group hover:border-emerald-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-900/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <FiPackage size={16} />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                  {pendingRequests > 0 ? `${pendingRequests} Pending` : 'All Confirmed'}
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-black text-2xl text-emerald-950 dark:text-white tracking-tight">
                    {statsLoading ? '...' : String(totalRequests)}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    total claims logged
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  My Shelter Claim Requests
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
                  <span>{pendingRequests} awaiting donor dispatch</span>
                  <button
                    type="button"
                    onClick={() => navigateToView('claims')}
                    className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-0.5 text-[10px]"
                  >
                    Track Claims <FiArrowRight size={10} />
                  </button>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>

      {/* Main View Navigation Tabs — Centered */}
      <div id="dashboard-views-section" className="flex justify-center w-full my-2 sm:my-3 scroll-mt-24">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#f4efe6] dark:bg-[#14241a] border-2 border-emerald-950/20 w-fit flex-wrap justify-center shadow-soft">
          <button
            type="button"
            onClick={() => navigateToView('browse')}
            className={`px-4 py-2 rounded-xl font-display font-black text-xs transition-all flex items-center gap-2 ${
              activeView === 'browse'
                ? 'bg-emerald-700 text-white border-2 border-emerald-950 shadow-pop-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-emerald-900'
            }`}
          >
            <FiSearch size={14} /> Available Surplus Feed ({availableListings.length})
          </button>
          <button
            type="button"
            onClick={() => navigateToView('claims')}
            className={`px-4 py-2 rounded-xl font-display font-black text-xs transition-all flex items-center gap-2 relative ${
              activeView === 'claims'
                ? 'bg-emerald-700 text-white border-2 border-emerald-950 shadow-pop-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-emerald-900'
            }`}
          >
            <FiShoppingBag size={14} /> My Claim Orders ({myClaims.length})
            {pendingRequests > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black border border-emerald-950 flex items-center justify-center">
                {pendingRequests}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigateToView('ai-match')}
            className={`px-4 py-2 rounded-xl font-display font-black text-xs transition-all flex items-center gap-2 ${
              activeView === 'ai-match'
                ? 'bg-amber-500 text-slate-950 border-2 border-emerald-950 shadow-pop-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-amber-800'
            }`}
          >
            <FiCpu size={14} /> AI Food Matcher
          </button>
        </div>
      </div>

      {/* VIEW 1: Browse Available Surplus Feed */}
      {activeView === 'browse' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950/20 dark:border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-soft">
            <div className="flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Search food by dish name, donor kitchen, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-[#faf8f4] dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-emerald-600"
              />
              <FiSearch className="absolute left-3 top-2.5 text-slate-400 text-xs" />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="all">All Categories</option>
                <option value="meals">Cooked Meals</option>
                <option value="bakery">Bakery & Bread</option>
                <option value="produce">Fresh Produce</option>
                <option value="dairy">Dairy Products</option>
                <option value="beverages">Beverages</option>
                <option value="other">Other Grocery</option>
              </select>

              <button
                type="button"
                onClick={loadOrgData}
                className="p-2 rounded-xl border border-emerald-900/20 hover:bg-emerald-50 text-emerald-800 transition-colors"
                title="Refresh surplus listings"
              >
                <FiRefreshCw size={14} className={listingsLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Available Food Cards Grid */}
          {listingsLoading ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              <FiRefreshCw className="animate-spin inline-block mr-2" /> Scanning surplus network...
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0f1a14] border-2 border-dashed border-emerald-950/20 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center mx-auto text-xl">
                <FiBox />
              </div>
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">No available surplus at this moment</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All food listings in this category have been claimed or expired. Check back shortly as donors post throughout the day.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((listing) => {
                const provider = typeof listing.providerId === 'object' ? listing.providerId : null;

                return (
                  <div
                    key={listing._id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950/20 dark:border-emerald-800 shadow-soft flex flex-col justify-between hover:shadow-pop-sm transition-all"
                  >
                    <div>
                      {/* Category & Freshness Tag */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-400">
                          {listing.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-400">
                          Available
                        </span>
                      </div>

                      <h3 className="font-display font-black text-base text-emerald-950 dark:text-white leading-snug">
                        {listing.foodName}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {listing.description || 'Fresh food surplus packed and ready for immediate charity pickup.'}
                      </p>

                      {/* Donor & Logistics info */}
                      <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                        <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                          <span>Available Quantity:</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-black">
                            {listing.quantity} {listing.unit}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <FiCoffee className="text-emerald-600 shrink-0" />
                          <span className="truncate">Donor: <strong>{provider?.name || 'Local Kitchen'}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <FiMapPin className="text-amber-600 shrink-0" />
                          <span className="truncate">{listing.pickupLocation}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <FiClock className="text-emerald-600 shrink-0" />
                          <span>Pickup Window: {new Date(listing.availableUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(listing.availableUntil).toLocaleDateString()})</span>
                        </div>
                      </div>
                    </div>

                    {/* Claim Button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => openClaimModal(listing)}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs border-2 border-emerald-950 shadow-pop-emerald flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <FiShoppingBag size={14} /> Request / Claim Food
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: My Claims & Food Orders */}
      {activeView === 'claims' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950/20 dark:border-emerald-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-display font-black text-lg text-emerald-950 dark:text-white">
                My Food Claim Orders & Rescue History
              </h2>
              <p className="text-xs text-slate-500">
                Track approval status from donors and mark items as collected upon receipt.
              </p>
            </div>
            <button
              onClick={loadOrgData}
              className="px-3 py-1.5 rounded-xl border border-emerald-900/20 text-xs font-bold text-emerald-800 hover:bg-emerald-50 flex items-center gap-1.5"
            >
              <FiRefreshCw size={12} className={claimsLoading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {myClaims.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">You have not submitted any food claims yet.</p>
          ) : (
            <div className="space-y-3">
              {myClaims.map((claim) => {
                const listing = typeof claim.foodListingId === 'object' ? claim.foodListingId : null;
                const provider = listing && typeof listing.providerId === 'object' ? listing.providerId : null;

                return (
                  <div
                    key={claim._id}
                    className="p-4 rounded-2xl bg-[#faf8f4] dark:bg-slate-900/80 border-2 border-emerald-950/15 dark:border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center shrink-0">
                        <FiShoppingBag size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                            {listing?.foodName || 'Food Surplus Claim'}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                              claim.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                                : claim.status === 'collected'
                                ? 'bg-blue-100 text-blue-800 border-blue-400'
                                : claim.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800 border-rose-400'
                                : 'bg-amber-100 text-amber-800 border-amber-400'
                            }`}
                          >
                            {claim.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          Donor: <strong className="text-slate-900 dark:text-white">{provider?.name || 'Donor Kitchen'}</strong> &bull; Quantity: <strong className="text-emerald-800 dark:text-emerald-400">{claim.requestedQuantity} {listing?.unit || 'items'}</strong>
                        </p>
                        {listing?.pickupLocation && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <FiMapPin className="text-amber-600" /> {listing.pickupLocation}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">
                          Submitted on {new Date(claim.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {claim.status === 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleMarkCollected(claim._id)}
                          disabled={actionLoading === `col-${claim._id}`}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-xs border-2 border-blue-950 shadow-pop-sm flex items-center gap-1.5"
                        >
                          <FiCheckCircle size={14} /> Mark Received & Collected
                        </button>
                      )}
                      {claim.status === 'pending' && (
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 bg-amber-100 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-300">
                          <FiClock /> Awaiting Donor Approval
                        </span>
                      )}
                      {claim.status === 'collected' && (
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-300">
                          <FiCheckCircle /> Collected & Distributed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: AI Food Matcher & Smart Redistribution */}
      {activeView === 'ai-match' && (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950/20 dark:border-emerald-800 shadow-soft space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 border border-emerald-950 flex items-center justify-center font-bold text-lg shadow-pop-sm">
              <FiCpu />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-emerald-950 dark:text-white">
                Agentic Surplus Matcher & Food Safety
              </h2>
              <p className="text-xs text-slate-500">
                Let Groq AI execute multi-step database queries to match food needs with nearby donors.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Agent Matching Query
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiMatchQuery}
                onChange={(e) => setAiMatchQuery(e.target.value)}
                placeholder="e.g. Find 40 vegetarian meals or bakery items for tonight"
                className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-[#faf8f4] dark:bg-slate-950 text-xs font-medium outline-none focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={handleRunAiMatch}
                disabled={aiMatchLoading}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-black text-xs border-2 border-emerald-950 shadow-pop-gold flex items-center gap-1.5 disabled:opacity-50"
              >
                {aiMatchLoading ? <FiRefreshCw className="animate-spin" /> : <FiSend />}
                Run Matcher
              </button>
            </div>
          </div>

          {aiMatchResponse && (
            <div className="p-6 rounded-2xl bg-[#faf8f4] dark:bg-slate-900 border-2 border-emerald-950/15 dark:border-emerald-800/30 text-xs leading-relaxed text-slate-800 dark:text-slate-200 space-y-3">
              <h4 className="font-display font-black text-sm text-emerald-900 dark:text-emerald-300 pb-2 border-b border-emerald-900/10 dark:border-emerald-700/20 flex items-center gap-2">
                <FiCpu className="text-amber-500" />
                Agent Matching Findings & Next Steps
              </h4>
              <MarkdownRenderer content={aiMatchResponse} />
            </div>
          )}
        </div>
      )}

      {/* CLAIM FOOD MODAL */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-scale-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0f1a14] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-bold">
                  <FiShoppingBag size={16} />
                </div>
                <h3 className="font-display font-black text-lg text-emerald-950 dark:text-white">
                  Request Food Surplus
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedListing(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {selectedListing.foodName}
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Max available: <strong>{selectedListing.quantity} {selectedListing.unit}</strong>
              </div>
              <div className="text-slate-500 text-[11px]">
                Pickup at: {selectedListing.pickupLocation}
              </div>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Requested Quantity ({selectedListing.unit}) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedListing.quantity}
                  value={claimQuantity}
                  onChange={(e) => setClaimQuantity(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-[#faf8f4] dark:bg-slate-950 text-xs font-bold outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Pickup Coordination Message & ETA *
                </label>
                <textarea
                  rows={3}
                  required
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-[#faf8f4] dark:bg-slate-950 text-xs font-medium outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedListing(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claimSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs border-2 border-emerald-950 shadow-pop-emerald flex items-center gap-1.5"
                >
                  {claimSubmitting ? <FiRefreshCw className="animate-spin" /> : <FiCheck />}
                  Confirm Claim Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationDashboard;
