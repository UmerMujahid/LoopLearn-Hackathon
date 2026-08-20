export type UserRole = 'provider' | 'organization' | 'admin';

export interface User {
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  organizationName?: string;
  phone?: string;
  address?: string;
  isVerified?: boolean;
}
