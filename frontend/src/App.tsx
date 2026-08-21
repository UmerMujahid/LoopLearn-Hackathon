import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AIAssistant from './components/ai/AIAssistant';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './pages/Landing/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProviderDashboard from './pages/Provider/ProviderDashboard';
import OrganizationDashboard from './pages/Organization/OrganizationDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';

import GroqApiKeyModal from './components/common/GroqApiKeyModal';

/** Resets scroll position to the top on every route change. */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const AppContent: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const location = useLocation();

  const isAuthRoute = location.pathname.startsWith('/login') || location.pathname.startsWith('/register');

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f4] dark:bg-[#080e0a] text-slate-900 dark:text-slate-100 relative transition-colors duration-200">
      <ScrollToTop />
      <Navbar />

      <div className="flex-1 w-full flex flex-col">
        <main className={`flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all duration-200 ${isAuthRoute ? 'flex items-center justify-center max-w-3xl py-8' : ''}`}>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/login/:role" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/:role" element={<Register />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/provider/*"
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/organization/*"
              element={
                <ProtectedRoute allowedRoles={['organization']}>
                  <OrganizationDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Wildcard redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <Footer />

      {/* Global AI Assistant Drawer */}
      <AIAssistant />

      {/* Groq API Key Setup Modal (prompts once after login or upon click) */}
      <GroqApiKeyModal />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
