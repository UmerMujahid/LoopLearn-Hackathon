import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { FoodListing, ClaimRequest, ProviderStats, OrganizationStats } from '../types';
import { foodService } from '../services/foodService';
import { requestService } from '../services/requestService';
import { statsService } from '../services/statsService';
import { useAuth } from './AuthContext';

interface FoodContextType {
  // Listings
  listings: FoodListing[];
  listingsLoading: boolean;
  fetchListings: (filters?: { category?: string; status?: string; location?: string; providerId?: string }) => Promise<void>;

  // Requests / Claims
  requests: ClaimRequest[];
  requestsLoading: boolean;
  fetchRequests: (status?: string) => Promise<void>;

  // Stats
  providerStats: ProviderStats | null;
  organizationStats: OrganizationStats | null;
  statsLoading: boolean;
  fetchStats: () => Promise<void>;

  // Aggregated quick numbers (used by context consumers like old FoodContext)
  listingsCount: number;
  requestsCount: number;
  mealsRescued: number;
  co2Diverted: number;
}

const FoodContext = createContext<FoodContextType>({
  listings: [],
  listingsLoading: false,
  fetchListings: async () => {},
  requests: [],
  requestsLoading: false,
  fetchRequests: async () => {},
  providerStats: null,
  organizationStats: null,
  statsLoading: false,
  fetchStats: async () => {},
  listingsCount: 0,
  requestsCount: 0,
  mealsRescued: 0,
  co2Diverted: 0,
});

export const useFood = () => useContext(FoodContext);

export const FoodProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, role } = useAuth();

  const [listings, setListings] = useState<FoodListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  const [requests, setRequests] = useState<ClaimRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const [providerStats, setProviderStats] = useState<ProviderStats | null>(null);
  const [organizationStats, setOrganizationStats] = useState<OrganizationStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchListings = useCallback(async (filters?: { category?: string; status?: string; location?: string; providerId?: string }) => {
    setListingsLoading(true);
    try {
      const { listings: data } = await foodService.getListings(filters);
      setListings(data);
    } catch {
      // Silently handled; consumers can check listings length
    } finally {
      setListingsLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async (status?: string) => {
    setRequestsLoading(true);
    try {
      const { requests: data } = await requestService.getRequests(status);
      setRequests(data);
    } catch {
      // Silently handled
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      if (role === 'provider') {
        const stats = await statsService.getProviderStats();
        setProviderStats(stats);
      }
      if (role === 'organization') {
        const stats = await statsService.getOrganizationStats();
        setOrganizationStats(stats);
      }
      // Admin uses its own getAdminStats() call directly in AdminDashboard
    } catch {
      // Silently handled
    } finally {
      setStatsLoading(false);
    }
  }, [role]);

  // Auto-fetch when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchListings();
      fetchRequests();
      fetchStats();
    } else {
      setListings([]);
      setRequests([]);
      setProviderStats(null);
      setOrganizationStats(null);
    }
  }, [isAuthenticated, role, fetchListings, fetchRequests, fetchStats]);

  // Derived quick stats
  const listingsCount = listings.length;
  const requestsCount = requests.filter(r => r.status === 'pending').length;

  const mealsRescued = providerStats
    ? providerStats.collectedListings
    : organizationStats
      ? organizationStats.collectedFood
      : 0;

  const co2Diverted = providerStats
    ? providerStats.co2SavedKg
    : organizationStats
      ? organizationStats.co2SavedKg
      : 0;

  return (
    <FoodContext.Provider
      value={{
        listings,
        listingsLoading,
        fetchListings,
        requests,
        requestsLoading,
        fetchRequests,
        providerStats,
        organizationStats,
        statsLoading,
        fetchStats,
        listingsCount,
        requestsCount,
        mealsRescued,
        co2Diverted,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
};

export default FoodContext;
