import apiClient from './api';
import { User } from '../types';

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

interface ProfileResponse {
  user: User;
}

export const authService = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    organizationName?: string;
    address: string;
    phone: string;
  }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  login: async (email: string, password: string, role?: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password, role });
    return res.data;
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const res = await apiClient.get<ProfileResponse>('/auth/profile');
    return res.data;
  },

  updateProfile: async (data: Partial<Pick<User, 'name' | 'address' | 'phone' | 'organizationName'>>): Promise<ProfileResponse & { message: string }> => {
    const res = await apiClient.put<ProfileResponse & { message: string }>('/auth/profile', data);
    return res.data;
  },

  // Admin endpoints
  getUsers: async (role?: string): Promise<{ count: number; users: User[] }> => {
    const res = await apiClient.get('/admin/users', { params: role ? { role } : {} });
    return res.data;
  },

  verifyOrganization: async (userId: string): Promise<{ message: string; user: User }> => {
    const res = await apiClient.put(`/admin/verify/${userId}`);
    return res.data;
  },
};
