import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  role: 'provider',
  isAuthenticated: false,
  switchRole: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('provider');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('foodloop_token');
    const userStr = localStorage.getItem('foodloop_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        setCurrentUser(user);
        setRole(user.role);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('foodloop_token');
        localStorage.removeItem('foodloop_user');
      }
    }
  }, []);

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('foodloop_token');
    localStorage.removeItem('foodloop_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, role, isAuthenticated, switchRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
