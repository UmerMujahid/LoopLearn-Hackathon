import apiClient from './api';
import { ClaimRequest } from '../types';

export const requestService = {
  getRequests: async (status?: string): Promise<{ count: number; requests: ClaimRequest[] }> => {
    const res = await apiClient.get('/requests', { params: status ? { status } : {} });
    return res.data;
  },

  createRequest: async (data: {
    foodListingId: string;
    requestedQuantity?: number;
    message?: string;
  }): Promise<{ message: string; request: ClaimRequest }> => {
    const res = await apiClient.post('/requests', data);
    return res.data;
  },

  approveRequest: async (id: string): Promise<{ message: string; request: ClaimRequest }> => {
    const res = await apiClient.put(`/requests/${id}/approve`);
    return res.data;
  },

  rejectRequest: async (id: string): Promise<{ message: string; request: ClaimRequest }> => {
    const res = await apiClient.put(`/requests/${id}/reject`);
    return res.data;
  },

  markCollected: async (id: string): Promise<{ message: string; request: ClaimRequest }> => {
    const res = await apiClient.put(`/requests/${id}/collect`);
    return res.data;
  },
};
