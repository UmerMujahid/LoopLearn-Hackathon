import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FiBell,
  FiX,
  FiMenu,
  FiGrid,
  FiPlusSquare,
  FiShoppingBag,
  FiBarChart2,
  FiCpu,
  FiSearch,
  FiCheckSquare,
  FiUsers,
  FiLayers,
  FiLogOut,
  FiChevronDown,
} from 'react-icons/fi';
import { BoxAvatarOverlay } from '../common/BoxAvatarOverlay';
import { FoodLoopLogo } from '../common/FoodLoopLogo';
import { useAuth } from '../../context/AuthContext';

type UserRole = 'provider' | 'organization' | 'admin';

export const Navbar: React.FC = () => {
  const { currentUser: authUser, role: authRole, isAuthenticated, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const role = (authRole || 'provider') as UserRole;

  const isLandingPage = location.pathname === '/';
  const isAuthRoute =
    location.pathname.startsWith('/login') || location.pathname.startsWith('/register');

  // Notifications placeholder (future API integration)
  const mockNotifications = [
    { id: 'notif-1', title: 'Barakah Meal Claim Request', desc: 'Hope Haven requested 35 items of fresh sourdough & produce.', time: '10m ago', color: '#34d399' },
    { id: 'notif-2', title: 'AI Match Found', desc: '2 nearby community kitchens match your cafeteria surplus.', time: '45m ago', color: '#60a5fa' },
    { id: 'notif-3', title: 'Impact Milestone', desc: '2,125 kg CO₂ offset & 1,420 meals distributed!', time: '3h ago', color: '#fbbf24' },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
        setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node))
        setShowUserDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dashboard subpage navigation links per role
  const getDashboardLinks = () => {
    if (role === 'admin') {
      return [
        { path: '/admin', label: 'Platform Overview', icon: <FiGrid /> },
        { path: '/admin/listings', label: 'Surplus Oversight', icon: <FiLayers /> },
        { path: '/admin/organizations', label: 'Org Verification', icon: <FiCheckSquare /> },
        { path: '/admin/users', label: 'User Directory', icon: <FiUsers /> },
        { path: '/admin/stats', label: 'Municipal Analytics', icon: <FiBarChart2 /> },
        { path: '/admin/ai-hub', label: 'AI Governance', icon: <FiCpu /> },
      ];
    }
    if (role === 'organization') {
      return [
        { path: '/organization', label: 'Community Hub', icon: <FiGrid /> },
        { path: '/organization/browse', label: 'Browse Food Surplus', icon: <FiSearch /> },
        { path: '/organization/claims', label: 'My Claim Orders', icon: <FiShoppingBag /> },
        { path: '/organization/stats', label: 'Meal Analytics', icon: <FiBarChart2 /> },
        { path: '/organization/ai-hub', label: 'AI Safety & Assist', icon: <FiCpu /> },
      ];
    }
    // provider
    return [
      { path: '/provider', label: 'Donors Dashboard', icon: <FiGrid /> },
      { path: '/provider/listings', label: 'Surplus Inventory', icon: <FiPlusSquare /> },
      { path: '/provider/claims', label: 'Incoming Claims', icon: <FiShoppingBag />, badge: '1' },
      { path: '/provider/stats', label: 'Rescue Impact', icon: <FiBarChart2 /> },
      { path: '/provider/ai-hub', label: 'AI Redistribution', icon: <FiCpu /> },
    ];
  };

  const dashboardLinks = getDashboardLinks();

  const getRoleBadgeStyle = (r: string) => {
    if (r === 'provider') return 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-400';
    if (r === 'organization') return 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-400';
    if (r === 'admin') return 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border-indigo-400';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300';
  };

  const getRoleLabel = (r: string) => {
    if (r === 'provider') return 'Food Donor';
    if (r === 'organization') return 'Community Org';
    if (r === 'admin') return 'Municipal Admin';
    return 'Guest';
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    navigate('/');
  };

  return (
    <header
      className="sticky top-0 z-30 transition-colors"
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(6,61,39,0.10)',
      }}
      data-testid="foodloop-navbar"
    >
      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 opacity-70" />

      {/* Main header bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-7xl mx-auto w-full">

        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          aria-label="FoodLoop Home"
        >
          <FoodLoopLogo size={38} className="group-hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-lg tracking-tight text-emerald-950 dark:text-emerald-100 leading-none">
              FoodLoop
            </span>
            <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 hidden sm:block leading-tight tracking-widest uppercase opacity-70">
              Smart Food Rescue
            </span>
          </div>
        </Link>

        {/* Center: Dashboard Subpage Links (only on dashboard routes) */}
        {!isLandingPage && !isAuthRoute && (
          <nav
            className="hidden lg:flex items-center gap-0.5 p-1 rounded-full"
            style={{
              background: 'rgba(6,61,39,0.05)',
              border: '1px solid rgba(6,61,39,0.10)',
            }}
            aria-label="Dashboard Sub Navigation"
          >
            {dashboardLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/provider' || link.path === '/organization' || link.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-display font-semibold text-xs whitespace-nowrap transition-all ${
                    isActive
                      ? 'text-emerald-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 2px 8px rgba(6,61,39,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
                        border: '1px solid rgba(6,61,39,0.14)',
                      }
                    : {}
                }
              >
                <span className="text-sm">{link.icon}</span>
                <span>{link.label}</span>
                {link.badge && (
                  <span className="ml-0.5 bg-amber-500 text-slate-950 text-[9px] font-extrabold px-1.5 rounded-full border border-amber-700">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Center: Landing Page Nav */}
        {isLandingPage && (
          <nav
            className="hidden lg:flex items-center gap-0.5 p-1 rounded-full"
            style={{
              background: 'rgba(6,61,39,0.04)',
              border: '1px solid rgba(6,61,39,0.08)',
            }}
          >
            {[
              { href: '#problem', label: 'The Problem' },
              { href: '#solution', label: 'How It Works' },
              { href: '#dashboards', label: 'Dashboards' },
              { href: '#impact', label: 'Impact' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-1.5 text-sm font-display font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 rounded-full transition-all hover:bg-white/70"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications (only when authenticated) */}
          {isAuthenticated && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowNotifications((prev) => !prev)}
                className="p-2 rounded-full transition-all active:scale-95 relative"
                style={{
                  background: 'rgba(6,61,39,0.06)',
                  border: '1px solid rgba(6,61,39,0.12)',
                }}
                aria-label="View Notifications"
                data-testid="notifications-btn"
              >
                <FiBell className="text-slate-700 dark:text-emerald-200 text-base" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center border border-white">
                  3
                </span>
              </button>

              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl z-50 p-4"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(6,61,39,0.12)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                  }}
                  data-testid="notifications-dropdown"
                >
                  <div className="flex justify-between items-center pb-2 mb-3 border-b border-slate-100">
                    <div className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <FiBell className="text-amber-500" /> Rescue Alerts
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600"
                      aria-label="Close notifications"
                    >
                      <FiX />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                    {mockNotifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-slate-900 flex items-center gap-2">
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                background: n.color,
                                display: 'inline-block',
                                flexShrink: 0,
                              }}
                            />
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-slate-500 text-[11px]">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth buttons */}
          {isAuthenticated && authUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserDropdown((prev) => !prev)}
                className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 text-left"
                data-testid="user-profile-chip"
              >
                <BoxAvatarOverlay
                  role={role === 'provider' ? 'donor' : role === 'organization' ? 'organization' : 'admin'}
                  size="sm"
                />
                <div className="hidden sm:flex flex-col">
                  <span className="font-display font-semibold text-xs text-slate-900 dark:text-slate-100 leading-tight">
                    {authUser.name}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 rounded border w-fit ${getRoleBadgeStyle(authUser.role)}`}
                    data-testid="user-role-badge"
                  >
                    {getRoleLabel(authUser.role)}
                  </span>
                </div>
                <FiChevronDown className="text-slate-400 text-xs hidden sm:block" />
              </button>

              {showUserDropdown && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl z-50 p-2 text-xs"
                  style={{
                    background: 'rgba(255,255,255,0.96)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(6,61,39,0.12)',
                    boxShadow: '0 16px 32px rgba(0,0,0,0.10)',
                  }}
                >
                  <div className="p-2.5 border-b border-slate-100">
                    <div className="font-display font-bold text-sm text-slate-900 truncate">
                      {authUser.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{authUser.email}</div>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { setShowUserDropdown(false); navigate('/login'); }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-50 font-medium text-slate-700 flex items-center gap-2"
                    >
                      Switch Account
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-semibold border-t border-slate-100"
                  >
                    <FiLogOut /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 font-display font-bold text-sm rounded-full transition-all active:scale-95"
                style={{
                  background: 'rgba(6,61,39,0.07)',
                  border: '1px solid rgba(6,61,39,0.14)',
                  color: '#064e3b',
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="hidden sm:flex px-4 py-2 text-slate-950 font-display font-bold text-sm rounded-full transition-all active:scale-95 items-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: '1.5px solid #92400e',
                  boxShadow: '0 2px 8px rgba(217,119,6,0.25)',
                }}
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setShowMobileMenu((prev) => !prev)}
            className="p-2 rounded-full lg:hidden transition-all"
            style={{
              background: 'rgba(6,61,39,0.06)',
              border: '1px solid rgba(6,61,39,0.12)',
            }}
            aria-label="Toggle Mobile Navigation"
          >
            {showMobileMenu ? (
              <FiX className="text-slate-700" />
            ) : (
              <FiMenu className="text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {showMobileMenu && (
        <div
          className="lg:hidden border-t p-4 flex flex-col gap-3"
          style={{
            background: 'rgba(255,255,255,0.97)',
            borderColor: 'rgba(6,61,39,0.10)',
          }}
        >
          {!isLandingPage && !isAuthRoute ? (
            <>
              <div className="font-mono font-bold text-[10px] uppercase text-emerald-700 tracking-widest opacity-70">
                Dashboard Pages
              </div>
              <nav className="flex flex-col gap-1">
                {dashboardLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.path === '/provider' || link.path === '/organization' || link.path === '/admin'}
                    onClick={() => setShowMobileMenu(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2.5 rounded-xl font-display font-semibold text-sm transition-all ${
                        isActive
                          ? 'bg-emerald-700 text-amber-100'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </nav>
            </>
          ) : (
            <>
              <a href="#problem" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl">The Problem</a>
              <a href="#solution" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl">How It Works</a>
              <a href="#dashboards" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl">Dashboards</a>
              <a href="#impact" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl">Impact</a>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
