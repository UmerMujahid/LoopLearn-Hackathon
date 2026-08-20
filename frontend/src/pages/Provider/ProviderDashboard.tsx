import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFood } from '../../context/FoodContext';
import { BoxAvatarOverlay } from '../../components/common/BoxAvatarOverlay';
import { requestService } from '../../services/requestService';
import { useState } from 'react';
import { FiCoffee, FiCheckCircle, FiDroplet, FiRefreshCw } from 'react-icons/fi';

const ProviderDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { providerStats, statsLoading, fetchStats, requests, fetchRequests } = useFood();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Refresh data on mount
  useEffect(() => {
    fetchStats();
    fetchRequests();
  }, [fetchStats, fetchRequests]);

  const handleApprove = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      await requestService.approveRequest(requestId);
      fetchRequests();
      fetchStats();
    } catch (err: any) {
      console.error('Failed to approve:', err?.response?.data?.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      await requestService.rejectRequest(requestId);
      fetchRequests();
    } catch (err: any) {
      console.error('Failed to reject:', err?.response?.data?.message);
    } finally {
      setActionLoading(null);
    }
  };

  const activeListings = providerStats?.activeListings ?? 0;
  const collectedListings = providerStats?.collectedListings ?? 0;
  const co2Saved = providerStats?.co2SavedKg ?? 0;
  const wasteReduced = providerStats?.wasteReducedKg ?? 0;

  const pendingRequests = requests.filter(r => r.status === 'pending');

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
          { icon: <FiCoffee className="text-emerald-600 dark:text-emerald-400" size={24} />, label: 'Active Listings', value: statsLoading ? '...' : String(activeListings), color: 'emerald' },
          { icon: <FiCheckCircle className="text-amber-600 dark:text-amber-400" size={24} />, label: 'Meals Collected', value: statsLoading ? '...' : String(collectedListings), color: 'amber' },
          { icon: <FiDroplet className="text-emerald-600 dark:text-emerald-400" size={24} />, label: 'CO\u2082 Diverted', value: statsLoading ? '...' : `${co2Saved} kg`, color: 'emerald' },
          { icon: <FiRefreshCw className="text-amber-600 dark:text-amber-400" size={24} />, label: 'Waste Reduced', value: statsLoading ? '...' : `${wasteReduced} kg`, color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border-2 border-emerald-900/15 dark:border-emerald-700/20 rounded-2xl p-5 shadow-soft">
            <div className="mb-2">{stat.icon}</div>
            <div className="font-display font-black text-2xl text-slate-900 dark:text-white">{stat.value}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Incoming Claims */}
      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-900/15 dark:border-emerald-700/20 rounded-2xl p-6 shadow-soft">
        <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">
          Incoming Claims ({pendingRequests.length})
        </h2>
        {pendingRequests.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No pending claim requests.</p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => {
              const listing = typeof req.foodListingId === 'object' ? req.foodListingId : null;
              const org = typeof req.organizationId === 'object' ? req.organizationId : null;

              return (
                <div key={req._id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
                  <div className="flex items-center gap-3">
                    <FiCoffee className="text-emerald-600 dark:text-emerald-400" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {listing?.foodName || 'Food Listing'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {org?.organizationName || org?.name || 'Organization'} &bull; {req.requestedQuantity} items &bull; {req.message || 'No message'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(req._id)}
                      disabled={actionLoading === req._id}
                      className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg border border-emerald-800 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === req._id ? '...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(req._id)}
                      disabled={actionLoading === req._id}
                      className="px-3 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-lg border border-rose-700 hover:bg-rose-600 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === req._id ? '...' : 'Reject'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
