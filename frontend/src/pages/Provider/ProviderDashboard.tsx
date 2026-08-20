import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFood } from '../../context/FoodContext';
import { BoxAvatarOverlay } from '../../components/common/BoxAvatarOverlay';
import { TiltCard } from '../../components/common/TiltCard';
import { foodService } from '../../services/foodService';
import { requestService } from '../../services/requestService';
import { aiService, RecommendationResponse } from '../../services/aiService';
import { FoodListing, ClaimRequest } from '../../types';
import {
  FiPlus,
  FiCoffee,
  FiCheckCircle,
  FiDroplet,
  FiRefreshCw,
  FiTrash2,
  FiEdit3,
  FiClock,
  FiMapPin,
  FiAlertCircle,
  FiBox,
  FiShoppingBag,
  FiZap,
  FiCheck,
  FiX,
  FiFilter,
  FiLayers,
  FiCalendar,
} from 'react-icons/fi';

type ActiveView = 'listings' | 'claims' | 'create' | 'ai-insights';

const ProviderDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { providerStats, statsLoading, fetchStats } = useFood();

  const [activeView, setActiveView] = useState<ActiveView>('listings');
  const [myListings, setMyListings] = useState<FoodListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [requests, setRequests] = useState<ClaimRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create listing form state
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    foodName: '',
    category: 'meals',
    quantity: 10,
    unit: 'portions',
    pickupLocation: currentUser?.address || '123 Downtown Market St',
    pickupLat: 37.7749,
    pickupLng: -122.4194,
    availableFrom: new Date().toISOString().slice(0, 16),
    availableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    expiryDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 16),
    description: '',
  });

  // AI recommendations state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<RecommendationResponse | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const loadProviderData = async () => {
    setListingsLoading(true);
    setRequestsLoading(true);
    try {
      if (currentUser?.id) {
        const { listings } = await foodService.getListings({ providerId: currentUser.id });
        setMyListings(listings);
      }
      const { requests: reqData } = await requestService.getRequests();
      setRequests(reqData);
      await fetchStats();
    } catch (err: any) {
      console.error('Error loading provider data:', err);
    } finally {
      setListingsLoading(false);
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    loadProviderData();
  }, [currentUser]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.foodName.trim()) {
      showToast('Please enter a food title', 'error');
      return;
    }
    setFormSubmitting(true);
    try {
      await foodService.createListing({
        ...formData,
        quantity: Number(formData.quantity),
      });
      showToast('Food surplus listing published successfully!');
      setFormData({
        foodName: '',
        category: 'meals',
        quantity: 10,
        unit: 'portions',
        pickupLocation: currentUser?.address || '123 Downtown Market St',
        pickupLat: 37.7749,
        pickupLng: -122.4194,
        availableFrom: new Date().toISOString().slice(0, 16),
        availableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        expiryDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 16),
        description: '',
      });
      setActiveView('listings');
      await loadProviderData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to create listing', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;
    setActionLoading(`del-${id}`);
    try {
      await foodService.deleteListing(id);
      showToast('Listing removed successfully');
      setMyListings((prev) => prev.filter((l) => l._id !== id));
      await fetchStats();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to delete listing', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setActionLoading(`stat-${id}`);
    try {
      await foodService.updateListingStatus(id, status);
      showToast(`Status updated to "${status}"`);
      await loadProviderData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    setActionLoading(`app-${requestId}`);
    try {
      await requestService.approveRequest(requestId);
      showToast('Claim request approved! Food is reserved.');
      await loadProviderData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to approve claim', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setActionLoading(`rej-${requestId}`);
    try {
      await requestService.rejectRequest(requestId);
      showToast('Claim request rejected.');
      await loadProviderData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to reject claim', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkCollected = async (requestId: string) => {
    setActionLoading(`col-${requestId}`);
    try {
      await requestService.markCollected(requestId);
      showToast('Marked as collected! Impact metrics updated.');
      await loadProviderData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to mark as collected', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateAIRecommendations = async () => {
    setAiLoading(true);
    try {
      const res = await aiService.getRecommendations({
        providerId: currentUser?.id,
        stats: providerStats || undefined,
      });
      setAiResult(res);
      showToast('AI Waste Strategy generated successfully!');
    } catch (err: any) {
      showToast(err?.response?.data?.detail || 'Failed to generate AI insights', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // Filtered listings
  const filteredListings = useMemo(() => {
    return myListings.filter((item) => {
      const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesSearch =
        !searchQuery ||
        item.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesStatus && matchesSearch;
    });
  }, [myListings, categoryFilter, statusFilter, searchQuery]);

  const activeListings = providerStats?.activeListings ?? myListings.filter((l) => l.status === 'available').length;
  const collectedListings = providerStats?.collectedListings ?? myListings.filter((l) => l.status === 'collected').length;
  const co2Saved = providerStats?.co2SavedKg ?? 0;
  const wasteReduced = providerStats?.wasteReducedKg ?? 0;

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-400';
      case 'reserved':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-400';
      case 'collected':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-400';
      case 'expired':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-400';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
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

      {/* Header Banner with double-box styling */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#f4efe6] via-[#faf8f4] to-[#f4efe6] dark:from-[#0f1a14] dark:via-[#14241a] dark:to-[#0f1a14] border-2 border-emerald-950 dark:border-emerald-800 shadow-pop-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <BoxAvatarOverlay role="donor" size="lg" showBadge badgeText="Food Provider" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-black text-2xl sm:text-3xl text-emerald-950 dark:text-white tracking-tight">
                Food Donors Hub
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-400">
                Active Kitchen
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Welcome back, <strong className="text-emerald-900 dark:text-emerald-300">{currentUser?.name || 'Chef'}</strong>! Manage surplus inventory, review charity claims, and reduce food waste.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveView(activeView === 'create' ? 'listings' : 'create')}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs border-2 border-emerald-950 shadow-pop-emerald flex items-center gap-2 transition-all active:scale-95"
          >
            <FiPlus size={16} />
            {activeView === 'create' ? 'View Inventory' : 'Post Food Surplus'}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('ai-insights');
              if (!aiResult) handleGenerateAIRecommendations();
            }}
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-emerald-950 font-display font-black text-xs border-2 border-emerald-950 shadow-pop-gold flex items-center gap-2 transition-all active:scale-95"
          >
            <FiZap size={16} />
            AI Waste Strategy
          </button>
        </div>
      </div>

      {/* 4 Interactive KPI Metric Cards with TiltCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: <FiCoffee className="text-emerald-700 dark:text-emerald-400" size={24} />,
            label: 'Active Surplus Listings',
            value: statsLoading ? '...' : String(activeListings),
            sub: 'Available for community claims',
            badgeBg: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
            borderColor: 'border-emerald-950 dark:border-emerald-800',
          },
          {
            icon: <FiCheckCircle className="text-amber-600 dark:text-amber-400" size={24} />,
            label: 'Surplus Meals Collected',
            value: statsLoading ? '...' : String(collectedListings),
            sub: 'Successfully diverted to charities',
            badgeBg: 'bg-amber-500/10 text-amber-800 dark:text-amber-300',
            borderColor: 'border-emerald-950 dark:border-emerald-800',
          },
          {
            icon: <FiDroplet className="text-emerald-700 dark:text-emerald-400" size={24} />,
            label: 'CO\u2082 Emissions Saved',
            value: statsLoading ? '...' : `${co2Saved} kg`,
            sub: 'GHG avoided from landfill',
            badgeBg: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
            borderColor: 'border-emerald-950 dark:border-emerald-800',
          },
          {
            icon: <FiRefreshCw className="text-amber-600 dark:text-amber-400" size={24} />,
            label: 'Total Waste Reduced',
            value: statsLoading ? '...' : `${wasteReduced} kg`,
            sub: 'Solid food waste diverted',
            badgeBg: 'bg-amber-500/10 text-amber-800 dark:text-amber-300',
            borderColor: 'border-emerald-950 dark:border-emerald-800',
          },
        ].map((kpi, idx) => (
          <TiltCard key={idx} intensity={8}>
            <div className={`p-5 rounded-3xl bg-white dark:bg-[#0f1a14] border-2 ${kpi.borderColor} shadow-pop-sm flex flex-col justify-between h-full`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-900/20 flex items-center justify-center">
                  {kpi.icon}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${kpi.badgeBg}`}>
                  Live
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
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#f4efe6] dark:bg-[#14241a] border-2 border-emerald-950/20 w-fit">
        <button
          type="button"
          onClick={() => setActiveView('listings')}
          className={`px-4 py-2 rounded-xl font-display font-black text-xs transition-all flex items-center gap-2 ${
            activeView === 'listings'
              ? 'bg-emerald-700 text-white border-2 border-emerald-950 shadow-pop-sm'
              : 'text-slate-700 dark:text-slate-300 hover:text-emerald-900'
          }`}
        >
          <FiLayers size={14} /> My Food Inventory ({myListings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveView('claims')}
          className={`px-4 py-2 rounded-xl font-display font-black text-xs transition-all flex items-center gap-2 relative ${
            activeView === 'claims'
              ? 'bg-emerald-700 text-white border-2 border-emerald-950 shadow-pop-sm'
              : 'text-slate-700 dark:text-slate-300 hover:text-emerald-900'
          }`}
        >
          <FiShoppingBag size={14} /> Incoming Claims
          {pendingRequests.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black border border-emerald-950 flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveView('create')}
          className={`px-4 py-2 rounded-xl font-display font-black text-xs transition-all flex items-center gap-2 ${
            activeView === 'create'
              ? 'bg-emerald-700 text-white border-2 border-emerald-950 shadow-pop-sm'
              : 'text-slate-700 dark:text-slate-300 hover:text-emerald-900'
          }`}
        >
          <FiPlus size={14} /> New Surplus Listing
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveView('ai-insights');
            if (!aiResult) handleGenerateAIRecommendations();
          }}
          className={`px-4 py-2 rounded-xl font-display font-black text-xs transition-all flex items-center gap-2 ${
            activeView === 'ai-insights'
              ? 'bg-amber-500 text-slate-950 border-2 border-emerald-950 shadow-pop-sm'
              : 'text-slate-700 dark:text-slate-300 hover:text-amber-800'
          }`}
        >
          <FiZap size={14} /> AI Waste Strategy
        </button>
      </div>

      {/* VIEW 1: My Food Inventory */}
      {activeView === 'listings' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950/20 dark:border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-soft">
            <div className="flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Search food by title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-[#faf8f4] dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-emerald-600"
              />
              <FiFilter className="absolute left-3 top-2.5 text-slate-400 text-xs" />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="all">All Categories</option>
                <option value="meals">Cooked Meals</option>
                <option value="bakery">Bakery & Pastries</option>
                <option value="produce">Fresh Produce</option>
                <option value="dairy">Dairy Products</option>
                <option value="beverages">Beverages</option>
                <option value="other">Other Grocery</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="collected">Collected</option>
                <option value="expired">Expired</option>
              </select>

              <button
                type="button"
                onClick={loadProviderData}
                className="p-2 rounded-xl border border-emerald-900/20 hover:bg-emerald-50 text-emerald-800 transition-colors"
                title="Refresh listings"
              >
                <FiRefreshCw size={14} className={listingsLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Listings Cards Grid */}
          {listingsLoading ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              <FiRefreshCw className="animate-spin inline-block mr-2" /> Loading your surplus listings...
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0f1a14] border-2 border-dashed border-emerald-900/20 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center mx-auto text-xl">
                <FiBox />
              </div>
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">No food listings found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven&apos;t posted any food surplus matching this filter yet. Create your first listing to start redirecting food to communities.
              </p>
              <button
                type="button"
                onClick={() => setActiveView('create')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs border border-emerald-800 shadow-pop-sm hover:bg-emerald-700"
              >
                + Post Food Surplus Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((listing) => (
                <div
                  key={listing._id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950/20 dark:border-emerald-800 shadow-soft flex flex-col justify-between hover:shadow-pop-sm transition-all"
                >
                  <div>
                    {/* Header: Category & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                        {listing.category}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(listing.status)}`}>
                        {listing.status}
                      </span>
                    </div>

                    <h3 className="font-display font-black text-base text-emerald-950 dark:text-white leading-snug">
                      {listing.foodName}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {listing.description || 'Nutritious surplus ready for community pickup and safe consumption.'}
                    </p>

                    {/* Metadata items */}
                    <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>Quantity:</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-black">
                          {listing.quantity} {listing.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <FiMapPin className="text-amber-600 shrink-0" />
                        <span className="truncate">{listing.pickupLocation}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <FiClock className="text-emerald-600 shrink-0" />
                        <span>Pickup Until: {new Date(listing.availableUntil).toLocaleDateString()}</span>
                      </div>
                      {listing.expiryDate && (
                        <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400">
                          <FiAlertCircle className="shrink-0" />
                          <span>Expires: {new Date(listing.expiryDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {/* Status Changer Menu */}
                    <select
                      value={listing.status}
                      onChange={(e) => handleStatusChange(listing._id, e.target.value)}
                      disabled={actionLoading === `stat-${listing._id}`}
                      className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none"
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="collected">Collected</option>
                      <option value="expired">Expired</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteListing(listing._id)}
                      disabled={actionLoading === `del-${listing._id}`}
                      className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 transition-colors"
                      title="Delete listing"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Incoming Claims & Requests */}
      {activeView === 'claims' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950/20 dark:border-emerald-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-display font-black text-lg text-emerald-950 dark:text-white">
                Incoming Charity Claim Requests
              </h2>
              <p className="text-xs text-slate-500">
                Review and approve pickup requests from verified community organizations.
              </p>
            </div>
            <button
              onClick={loadProviderData}
              className="px-3 py-1.5 rounded-xl border border-emerald-900/20 text-xs font-bold text-emerald-800 hover:bg-emerald-50 flex items-center gap-1.5"
            >
              <FiRefreshCw size={12} className={requestsLoading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {requests.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No incoming requests on your food listings yet.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const listing = typeof req.foodListingId === 'object' ? req.foodListingId : null;
                const org = typeof req.organizationId === 'object' ? req.organizationId : null;

                return (
                  <div
                    key={req._id}
                    className="p-4 rounded-2xl bg-[#faf8f4] dark:bg-slate-900/80 border-2 border-emerald-950/15 dark:border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center shrink-0">
                        <FiShoppingBag size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                            {listing?.foodName || 'Food Surplus Listing'}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                              req.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                                : req.status === 'collected'
                                ? 'bg-blue-100 text-blue-800 border-blue-400'
                                : req.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800 border-rose-400'
                                : 'bg-amber-100 text-amber-800 border-amber-400'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          Claimed by: <strong className="text-emerald-800 dark:text-emerald-400">{org?.organizationName || org?.name || 'Verified Org'}</strong> &bull; Requested: <strong className="text-slate-900 dark:text-white">{req.requestedQuantity} items</strong>
                        </p>
                        {req.message && (
                          <p className="text-[11px] italic text-slate-500 dark:text-slate-400 mt-1 bg-white/60 dark:bg-slate-950/40 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                            &ldquo;{req.message}&rdquo;
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">
                          Requested at: {new Date(req.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApproveRequest(req._id)}
                            disabled={actionLoading === `app-${req._id}`}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs border border-emerald-950 shadow-pop-sm flex items-center gap-1"
                          >
                            <FiCheck size={12} /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectRequest(req._id)}
                            disabled={actionLoading === `rej-${req._id}`}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-display font-black text-xs border border-rose-950 shadow-pop-sm flex items-center gap-1"
                          >
                            <FiX size={12} /> Reject
                          </button>
                        </>
                      )}
                      {req.status === 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleMarkCollected(req._id)}
                          disabled={actionLoading === `col-${req._id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-xs border border-blue-950 shadow-pop-sm flex items-center gap-1"
                        >
                          <FiCheckCircle size={12} /> Mark Collected
                        </button>
                      )}
                      {req.status === 'collected' && (
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <FiCheckCircle /> Completed
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

      {/* VIEW 3: Create Food Listing Form */}
      {activeView === 'create' && (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950/20 dark:border-emerald-800 shadow-pop-sm max-w-3xl mx-auto space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-display font-black text-xl text-emerald-950 dark:text-white">
              Publish Surplus Food Listing
            </h2>
            <p className="text-xs text-slate-500">
              Provide accurate food details and pickup windows to facilitate quick rescue by community shelters.
            </p>
          </div>

          <form onSubmit={handleCreateListing} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Food Item Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50 Vegetarian Rice Bowls"
                  value={formData.foodName}
                  onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-[#faf8f4] dark:bg-slate-950 text-xs font-medium outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-[#faf8f4] dark:bg-slate-950 text-xs font-bold outline-none focus:border-emerald-600"
                >
                  <option value="meals">Cooked Meals / Catering</option>
                  <option value="bakery">Bakery & Bread</option>
                  <option value="produce">Fresh Produce / Vegetables</option>
                  <option value="dairy">Dairy & Milk Products</option>
                  <option value="beverages">Beverages / Juices</option>
                  <option value="other">Other Packaged Groceries</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-[#faf8f4] dark:bg-slate-950 text-xs font-medium outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Unit *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-[#faf8f4] dark:bg-slate-950 text-xs font-bold outline-none focus:border-emerald-600"
                >
                  <option value="portions">Portions / Meals</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="items">Items / Packages</option>
                  <option value="liters">Liters (L)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Pickup Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Back Kitchen Door, 4th Ave"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-[#faf8f4] dark:bg-slate-950 text-xs font-medium outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Available From *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.availableFrom}
                  onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-[#faf8f4] dark:bg-slate-950 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Available Until *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.availableUntil}
                  onChange={(e) => setFormData({ ...formData, availableUntil: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-[#faf8f4] dark:bg-slate-950 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-[#faf8f4] dark:bg-slate-950 text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Description & Allergen Notes
              </label>
              <textarea
                rows={3}
                placeholder="Details on food packaging, ingredients, temperature, dietary notes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-[#faf8f4] dark:bg-slate-950 text-xs font-medium outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveView('listings')}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs border-2 border-emerald-950 shadow-pop-emerald flex items-center gap-2"
              >
                {formSubmitting ? <FiRefreshCw className="animate-spin" /> : <FiPlus />}
                Publish Listing
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 4: AI Waste Reduction Hub */}
      {activeView === 'ai-insights' && (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0f1a14] border-2 border-emerald-950/20 dark:border-emerald-800 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 border border-emerald-950 flex items-center justify-center font-bold text-lg shadow-pop-sm">
                <FiZap />
              </div>
              <div>
                <h2 className="font-display font-black text-xl text-emerald-950 dark:text-white">
                  AI Kitchen Waste Strategy Advisor
                </h2>
                <p className="text-xs text-slate-500">
                  Powered by Groq LLM & FoodLoop Historical Waste Analyzers
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateAIRecommendations}
              disabled={aiLoading}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs border-2 border-emerald-950 shadow-pop-emerald flex items-center gap-2"
            >
              <FiRefreshCw className={aiLoading ? 'animate-spin' : ''} />
              {aiLoading ? 'Analyzing metrics...' : 'Re-Run AI Analysis'}
            </button>
          </div>

          {aiLoading ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              <FiRefreshCw className="animate-spin inline-block mr-2 text-emerald-600" />
              Groq LLM is evaluating your donation trends, expiration rates, and generating operational optimizations...
            </div>
          ) : aiResult ? (
            <div className="space-y-6">
              {/* Patterns & Stats Overview */}
              {aiResult.patterns && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
                    <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                      Top Surplus Category
                    </div>
                    <div className="font-display font-black text-base text-emerald-950 dark:text-white mt-0.5">
                      {aiResult.patterns.top_surplus_category || 'Meals'}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40">
                    <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
                      Collection Efficiency
                    </div>
                    <div className="font-display font-black text-base text-amber-950 dark:text-white mt-0.5">
                      {aiResult.providerStats?.collection_rate_pct ?? 90}%
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40">
                    <div className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400">
                      Expiration Rate
                    </div>
                    <div className="font-display font-black text-base text-indigo-950 dark:text-white mt-0.5">
                      {aiResult.providerStats?.waste_rate_pct ?? 10}%
                    </div>
                  </div>
                </div>
              )}

              {/* AI Markdown Advice */}
              <div className="p-6 rounded-2xl bg-[#faf8f4] dark:bg-slate-900 border-2 border-emerald-950/15 dark:border-emerald-800/30 text-xs leading-relaxed text-slate-800 dark:text-slate-200 space-y-2">
                <h4 className="font-display font-black text-sm text-emerald-900 dark:text-emerald-300 mb-2">
                  Actionable Kitchen Optimization Plan
                </h4>
                <div className="whitespace-pre-line">
                  {aiResult.recommendations}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              Click &quot;Re-Run AI Analysis&quot; above to generate personalized recommendations.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
