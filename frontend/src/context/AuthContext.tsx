import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, portalRole?: UserRole) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    organizationName?: string;
    address: string;
    phone: string;
  }) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  role: 'provider',
  isAuthenticated: false,
  isLoading: false,
  login: async () => { throw new Error('AuthContext not initialized'); },
  register: async () => {},
  refreshProfile: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('provider');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper: derive the avatar role identifier for BoxAvatarOverlay
  const avatarForRole = (r: UserRole): string =>
    r === 'provider' ? 'donor' : r === 'organization' ? 'organization' : 'admin';

  // Restore session on mount from localStorage token
  useEffect(() => {
    const token = localStorage.getItem('foodloop_token');
    const userStr = localStorage.getItem('foodloop_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        setCurrentUser(user);
        setRole(user.role);
        setIsAuthenticated(true);

        // Silently refresh profile from server to keep data fresh
        authService.getProfile().then(({ user: freshUser }) => {
          const enriched = { ...freshUser, avatar: avatarForRole(freshUser.role) };
          setCurrentUser(enriched);
          setRole(enriched.role);
          localStorage.setItem('foodloop_user', JSON.stringify(enriched));
        }).catch(() => {
          // Token may be expired; the interceptor handles redirect
        });
      } catch {
        localStorage.removeItem('foodloop_token');
        localStorage.removeItem('foodloop_user');
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string, portalRole?: UserRole): Promise<User> => {
    setIsLoading(true);
    try {
      const { token, user: rawUser } = await authService.login(email, password, portalRole);
      
      // Strict role verification check on the client as well
      if (portalRole && rawUser.role !== portalRole) {
        const roleDisplayNames: Record<string, string> = {
          provider: 'Food Donor',
          organization: 'Community Organization',
          admin: 'Administrator',
        };
        const actualLabel = roleDisplayNames[rawUser.role] || rawUser.role;
        const requestedLabel = roleDisplayNames[portalRole] || portalRole;
        throw new Error(`Access Denied: This account is registered as a ${actualLabel}. Please log in through the ${actualLabel} portal.`);
      }

      const user: User = { ...rawUser, avatar: avatarForRole(rawUser.role) };

      localStorage.setItem('foodloop_token', token);
      localStorage.setItem('foodloop_user', JSON.stringify(user));

      setCurrentUser(user);
      setRole(user.role);
      setIsAuthenticated(true);
      return user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    organizationName?: string;
    address: string;
    phone: string;
  }) => {
    setIsLoading(true);
    try {
      const { token, user: rawUser } = await authService.register(data);
      const user: User = { ...rawUser, avatar: avatarForRole(rawUser.role as UserRole) };

      localStorage.setItem('foodloop_token', token);
      localStorage.setItem('foodloop_user', JSON.stringify(user));

      setCurrentUser(user);
      setRole(user.role);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { user: freshUser } = await authService.getProfile();
      const enriched = { ...freshUser, avatar: avatarForRole(freshUser.role) };
      setCurrentUser(enriched);
      setRole(enriched.role);
      localStorage.setItem('foodloop_user', JSON.stringify(enriched));
    } catch {
      // handled by interceptor
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setRole('provider');
    localStorage.removeItem('foodloop_token');
    localStorage.removeItem('foodloop_user');
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, role, isAuthenticated, isLoading, login, register, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
