export type UserRole = 'provider' | 'organization' | 'admin';

export interface User {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  organizationName?: string;
  phone?: string;
  address?: string;
  isVerified?: boolean;
}

export interface FoodListing {
  _id: string;
  providerId: User | string;
  foodName: string;
  category: 'meals' | 'bakery' | 'produce' | 'dairy' | 'beverages' | 'other';
  quantity: number;
  unit: 'portions' | 'kg' | 'liters' | 'items';
  pickupLocation: string;
  pickupLat?: number;
  pickupLng?: number;
  availableFrom: string;
  availableUntil: string;
  expiryDate: string;
  description?: string;
  status: 'available' | 'reserved' | 'collected' | 'expired';
  claimedBy?: User | string | null;
  claimedAt?: string | null;
  collectedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimRequest {
  _id: string;
  organizationId: User | string;
  foodListingId: FoodListing | string;
  status: 'pending' | 'approved' | 'rejected' | 'collected';
  requestedQuantity: number;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderStats {
  totalListings: number;
  activeListings: number;
  collectedListings: number;
  expiredListings: number;
  wasteReducedKg: number;
  co2SavedKg: number;
  monthlyBreakdown: any[];
}

export interface OrganizationStats {
  totalRequests: number;
  pendingRequests: number;
  collectedFood: number;
  wasteRescuedKg: number;
  co2SavedKg: number;
  monthlyBreakdown: any[];
}

export interface AdminStats {
  totalListings: number;
  foodRescued: number;
  activeListings: number;
  expiredListings: number;
  activeOrgs: number;
  pendingOrgs: number;
  totalProviders: number;
  totalWasteReducedKg: number;
  totalCo2SavedKg: number;
}
