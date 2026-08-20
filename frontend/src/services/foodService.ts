import apiClient from './api';
import { FoodListing } from '../types';

interface ListingCreateData {
  foodName: string;
  category: string;
  quantity: number;
  unit: string;
  pickupLocation: string;
  pickupLat?: number;
  pickupLng?: number;
  availableFrom: string;
  availableUntil: string;
  expiryDate: string;
  description?: string;
}

export const foodService = {
  getListings: async (filters?: {
    category?: string;
    status?: string;
    location?: string;
    providerId?: string;
  }): Promise<{ count: number; listings: FoodListing[] }> => {
    const res = await apiClient.get('/food', { params: filters });
    return res.data;
  },

  getListingById: async (id: string): Promise<{ listing: FoodListing }> => {
    const res = await apiClient.get(`/food/${id}`);
    return res.data;
  },

  createListing: async (data: ListingCreateData): Promise<{ message: string; listing: FoodListing }> => {
    const res = await apiClient.post('/food', data);
    return res.data;
  },

  updateListing: async (id: string, data: Partial<ListingCreateData>): Promise<{ message: string; listing: FoodListing }> => {
    const res = await apiClient.put(`/food/${id}`, data);
    return res.data;
  },

  deleteListing: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/food/${id}`);
    return res.data;
  },

  updateListingStatus: async (id: string, status: string): Promise<{ message: string; listing: FoodListing }> => {
    const res = await apiClient.put(`/food/${id}/status`, { status });
    return res.data;
  },
};
