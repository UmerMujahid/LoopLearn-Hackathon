import apiClient from './api';
import { User } from '../types';

export const organizationService = {
  getOrganizations: async (): Promise<{ count: number; organizations: User[] }> => {
    const res = await apiClient.get('/organizations');
    return res.data;
  },

  getOrganizationById: async (id: string): Promise<{
    organization: User;
    stats: any[];
    history: any[];
  }> => {
    const res = await apiClient.get(`/organizations/${id}`);
    return res.data;
  },
};
