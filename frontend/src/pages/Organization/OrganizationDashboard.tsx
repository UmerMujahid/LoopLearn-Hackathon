import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFood } from '../../context/FoodContext';
import { BoxAvatarOverlay } from '../../components/common/BoxAvatarOverlay';
import { requestService } from '../../services/requestService';
import { FiSearch, FiPackage, FiCheckCircle, FiDroplet, FiCoffee, FiBox, FiDroplet as FiLeaf, FiShoppingBag } from 'react-icons/fi';

const OrganizationDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { organizationStats, statsLoading, fetchStats, listings, fetchListings, fetchRequests } = useFood();
  const [claimLoading, setClaimLoading] = useState<string | null>(null);
  const [claimError, setClaimError] = useState('');

  useEffect(() => {
    fetchStats();
    fetchListings({ status: 'available' });
  }, [fetchStats, fetchListings]);

  const handleClaim = async (listingId: string, quantity: number) => {
    setClaimLoading(listingId);
    setClaimError('');
    try {
      await requestService.createRequest({ foodListingId: listingId, requestedQuantity: quantity });
      fetchListings({ status: 'available' });
      fetchRequests();
      fetchStats();
    } catch (err: any) {
      setClaimError(err?.response?.data?.message || 'Failed to claim listing');
    } finally {
      setClaimLoading(null);
    }
  };

  const totalRequests = organizationStats?.totalRequests ?? 0;
  const pendingRequests = organizationStats?.pendingRequests ?? 0;
  const collectedFood = organizationStats?.collectedFood ?? 0;
  const co2Saved = organizationStats?.co2SavedKg ?? 0;

  // Show only available listings
  const availableListings = listings.filter(l => l.status === 'available');

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex items-center gap-4">
        <BoxAvatarOverlay role="organization" size="lg" showBadge badgeText="Org" />
        <div>
          <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white">
            Community Hub Overview
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Welcome, {currentUser?.name || 'Organization'}! Browse available food surplus.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: <FiSearch className="text-amber-600 dark:text-amber-400" size={24} />, label: 'Available Listings', value: statsLoading ? '...' : String(availableListings.length), color: 'amber' },
          { icon: <FiPackage className="text-emerald-600 dark:text-emerald-400" size={24} />, label: 'My Claims', value: statsLoading ? '...' : String(totalRequests), color: 'emerald' },
          { icon: <FiCheckCircle className="text-amber-600 dark:text-amber-400" size={24} />, label: 'Meals Collected', value: statsLoading ? '...' : String(collectedFood), color: 'amber' },
          { icon: <FiDroplet className="text-emerald-600 dark:text-emerald-400" size={24} />, label: 'CO\u2082 Diverted', value: statsLoading ? '...' : `${co2Saved} kg`, color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border-2 border-emerald-900/15 dark:border-emerald-700/20 rounded-2xl p-5 shadow-soft">
            <div className="mb-2">{stat.icon}</div>
            <div className="font-display font-black text-2xl text-slate-900 dark:text-white">{stat.value}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Error message */}
      {claimError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400">
          {claimError}
        </div>
      )}

      {/* Available Food Listings */}
      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-900/15 dark:border-emerald-700/20 rounded-2xl p-6 shadow-soft">
        <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Available Food Surplus</h2>
        {availableListings.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No available food listings at the moment.</p>
        ) : (
          <div className="space-y-3">
            {availableListings.map((listing) => {
              const provider = typeof listing.providerId === 'object' ? listing.providerId : null;
              return (
                <div key={listing._id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {listing.category === 'meals' ? <FiCoffee className="text-emerald-600 dark:text-emerald-400" size={20} /> : listing.category === 'bakery' ? <FiBox className="text-amber-600 dark:text-amber-400" size={20} /> : listing.category === 'produce' ? <FiLeaf className="text-green-600 dark:text-green-400" size={20} /> : listing.category === 'dairy' ? <FiDroplet className="text-blue-500 dark:text-blue-400" size={20} /> : <FiShoppingBag className="text-slate-600 dark:text-slate-400" size={20} />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{listing.foodName}</p>
                      <p className="text-[10px] text-slate-400">
                        {provider?.name || 'Provider'} &bull; {listing.pickupLocation}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {listing.quantity} {listing.unit}
                    </p>
                    <button
                      onClick={() => handleClaim(listing._id, listing.quantity)}
                      disabled={claimLoading === listing._id}
                      className="text-[10px] text-amber-700 dark:text-amber-400 font-bold hover:underline mt-0.5 disabled:opacity-50"
                    >
                      {claimLoading === listing._id ? 'Claiming...' : 'Claim'}
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

export default OrganizationDashboard;
