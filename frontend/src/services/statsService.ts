import apiClient from './api';
import { ProviderStats, OrganizationStats, AdminStats } from '../types';

export const statsService = {
  getProviderStats: async (): Promise<ProviderStats> => {
    const res = await apiClient.get<ProviderStats>('/stats/provider');
    return res.data;
  },

  getOrganizationStats: async (): Promise<OrganizationStats> => {
    const res = await apiClient.get<OrganizationStats>('/stats/organization');
    return res.data;
  },

  getAdminStats: async (): Promise<AdminStats> => {
    const res = await apiClient.get<AdminStats>('/stats/admin');
    return res.data;
  },
};
