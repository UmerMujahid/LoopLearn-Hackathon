import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FiSun,
  FiMoon,
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
  FiHome
} from 'react-icons/fi';
import { BoxAvatarOverlay } from '../common/BoxAvatarOverlay';

type UserRole = 'provider' | 'organization' | 'admin';

export const Navbar: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [role, setRole] = useState<UserRole>('provider');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isLandingPage = location.pathname === '/';
  const isAuthRoute = location.pathname.startsWith('/login') || location.pathname.startsWith('/register');

  // Detect current dashboard role from URL
  useEffect(() => {
    if (location.pathname.startsWith('/provider')) setRole('provider');
    else if (location.pathname.startsWith('/organization')) setRole('organization');
    else if (location.pathname.startsWith('/admin')) setRole('admin');
  }, [location.pathname]);

  const currentUser = isAuthenticated ? {
    name: 'Ahmed Khan',
    email: 'ahmed@foodloop.pk',
    role: role,
    avatar: role === 'provider' ? '🥗' : role === 'organization' ? '🍲' : '🛡️',
  } : null;

  const mockNotifications = [
    { id: 'notif-1', icon: '🍲', title: 'Barakah Meal Claim Request', desc: 'Hope Haven requested 35 items of fresh sourdough & produce.', time: '10m ago' },
    { id: 'notif-2', icon: '⚡', title: 'AI Match Found', desc: '2 nearby community kitchens match your cafeteria surplus.', time: '45m ago' },
    { id: 'notif-3', icon: '🌱', title: 'Impact Milestone', desc: '2,125 kg CO₂ offset & 1,420 meals distributed this month!', time: '3h ago' },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setShowUserDropdown(false);
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
    setIsAuthenticated(false);
    setShowUserDropdown(false);
    navigate('/');
  };

  return (
    <header
      className="sticky top-0 z-30 bg-white/95 dark:bg-[#0d1712]/95 backdrop-blur-md border-b-2 border-emerald-900/20 dark:border-emerald-700/30 transition-colors"
      data-testid="foodloop-navbar"
    >
      {/* Top Accent Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-600" />

      {/* Main Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-7xl mx-auto w-full">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group text-decoration-none"
          aria-label="FoodLoop Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-amber-300 border-2 border-emerald-950 flex items-center justify-center text-xl shadow-pop-gold group-hover:scale-105 transition-transform">
            <span>🍽️</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl tracking-tight text-emerald-950 dark:text-emerald-100 leading-none">
              FoodLoop
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hidden sm:block leading-tight">
              Smart Food Rescue Platform
            </span>
          </div>
        </Link>

        {/* Center: Dashboard Subpage Links (only on dashboard routes) */}
        {!isLandingPage && !isAuthRoute && (
          <nav
            className="hidden lg:flex items-center gap-0.5 bg-emerald-50/60 dark:bg-emerald-950/40 p-1 rounded-2xl border border-emerald-900/20 dark:border-emerald-700/30"
            aria-label="Dashboard Sub Navigation"
          >
            {dashboardLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/provider' || link.path === '/organization' || link.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-semibold text-xs whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-emerald-700 text-amber-100 border-emerald-900 shadow-pop-sm'
                      : 'border-transparent text-slate-600 dark:text-emerald-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-emerald-900/50'
                  }`
                }
              >
                <span className="text-sm">{link.icon}</span>
                <span>{link.label}</span>
                {link.badge && (
                  <span className="ml-0.5 bg-amber-500 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-slate-900">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Landing Page Center Nav */}
        {isLandingPage && (
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { href: '#problem', label: 'The Problem' },
              { href: '#solution', label: 'How It Works' },
              { href: '#dashboards', label: 'Dashboards' },
              { href: '#impact', label: 'Impact' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3.5 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-xl hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 transition-all"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications (only when authenticated) */}
          {isAuthenticated && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(prev => !prev)}
                className="p-2 rounded-xl border border-emerald-900/20 dark:border-emerald-700/30 bg-white dark:bg-emerald-950 text-slate-700 dark:text-emerald-200 hover:bg-slate-50 dark:hover:bg-emerald-900/60 transition-all active:scale-95 relative"
                aria-label="View Notifications"
                data-testid="notifications-btn"
              >
                <FiBell className="text-base" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center border border-white dark:border-slate-900">
                  3
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border-2 border-emerald-900/20 dark:border-emerald-700/30 rounded-2xl shadow-lg z-50 p-4" data-testid="notifications-dropdown">
                  <div className="flex justify-between items-center pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FiBell className="text-amber-500" /> Rescue Alerts
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label="Close notifications"
                    >
                      <FiX />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                    {mockNotifications.map(n => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-emerald-50/40 dark:bg-slate-800/60 border border-emerald-100 dark:border-emerald-900/40 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span>{n.icon}</span> {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth */}
          {isAuthenticated && currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserDropdown(prev => !prev)}
                className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 text-left"
                data-testid="user-profile-chip"
              >
                <BoxAvatarOverlay
                  role={role === 'provider' ? 'donor' : role === 'organization' ? 'organization' : 'admin'}
                  size="sm"
                />
                <div className="hidden sm:flex flex-col">
                  <span className="font-display font-semibold text-xs text-slate-900 dark:text-slate-100 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border w-fit ${getRoleBadgeStyle(currentUser.role)}`} data-testid="user-role-badge">
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
                <FiChevronDown className="text-slate-400 text-xs hidden sm:block" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border-2 border-emerald-900/20 dark:border-emerald-700/30 rounded-xl shadow-lg z-50 p-2 text-xs">
                  <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{currentUser.email}</div>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { setShowUserDropdown(false); navigate('/login'); }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    >
                      <span>🔄</span> Switch Account
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 font-semibold border-t border-slate-100 dark:border-slate-800"
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
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-display font-bold text-sm rounded-xl border-2 border-emerald-900 shadow-pop-sm transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="hidden sm:flex px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-bold text-sm rounded-xl border-2 border-amber-700 shadow-pop-gold transition-all items-center gap-1.5 active:scale-95"
              >
                <span>Get Started</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setShowMobileMenu(prev => !prev)}
            className="p-2 rounded-xl border border-emerald-900/20 dark:border-emerald-700/30 bg-white dark:bg-emerald-950 text-slate-700 dark:text-slate-200 lg:hidden"
            aria-label="Toggle Mobile Navigation"
          >
            {showMobileMenu ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {showMobileMenu && (
        <div className="lg:hidden border-t-2 border-emerald-900/20 dark:border-emerald-700/30 bg-white dark:bg-slate-900 p-4 flex flex-col gap-3">
          {/* Dashboard links on mobile */}
          {!isLandingPage && !isAuthRoute ? (
            <>
              <div className="font-display font-bold text-xs uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
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
                      `flex items-center gap-2 px-3 py-2.5 rounded-xl font-display font-semibold text-sm transition-all border ${
                        isActive
                          ? 'bg-emerald-700 text-amber-100 border-emerald-900'
                          : 'border-transparent text-slate-600 dark:text-emerald-300 hover:bg-slate-50 dark:hover:bg-emerald-950/50'
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
              <a href="#problem" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-emerald-950/40 rounded-xl">The Problem</a>
              <a href="#solution" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-emerald-950/40 rounded-xl">How It Works</a>
              <a href="#dashboards" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-emerald-950/40 rounded-xl">Dashboards</a>
              <a href="#impact" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-emerald-950/40 rounded-xl">Impact</a>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
