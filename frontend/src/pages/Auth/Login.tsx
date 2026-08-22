import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FiMail,
  FiLock,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiPackage,
  FiUsers,
  FiShield,
  FiAlertCircle,
  FiCornerDownRight,
} from 'react-icons/fi';
import { BoxAvatarOverlay } from '../../components/common/BoxAvatarOverlay';
import { FoodLoopLogo } from '../../components/common/FoodLoopLogo';
import { useAuth } from '../../context/AuthContext';

type PortalRole = 'provider' | 'organization' | 'admin';

interface Portal {
  role: PortalRole;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  avatar: 'donor' | 'organization' | 'admin';
  path: string;
  accentColor: string;
  activeBg: string;
  activeBorder: string;
}

const portals: Portal[] = [
  {
    role: 'provider',
    label: 'Food Donor',
    sublabel: 'Restaurant / Bakery / Market',
    icon: <FiPackage className="text-base" />,
    avatar: 'donor',
    path: '/provider',
    accentColor: '#059669',
    activeBg: 'rgba(5,150,105,0.08)',
    activeBorder: 'rgba(5,150,105,0.35)',
  },
  {
    role: 'organization',
    label: 'Community Org',
    sublabel: 'Shelter / Food Bank / NGO',
    icon: <FiUsers className="text-base" />,
    avatar: 'organization',
    path: '/organization',
    accentColor: '#d97706',
    activeBg: 'rgba(217,119,6,0.08)',
    activeBorder: 'rgba(217,119,6,0.35)',
  },
  {
    role: 'admin',
    label: 'Admin Portal',
    sublabel: 'Municipal / Platform Admin',
    icon: <FiShield className="text-base" />,
    avatar: 'admin',
    path: '/admin',
    accentColor: '#4f46e5',
    activeBg: 'rgba(79,70,229,0.08)',
    activeBorder: 'rgba(79,70,229,0.35)',
  },
];

const Login: React.FC = () => {
  const { role: urlRole } = useParams<{ role?: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();

  const initialRole: PortalRole =
    (urlRole as PortalRole | undefined) &&
    ['provider', 'organization', 'admin'].includes(urlRole!)
      ? (urlRole as PortalRole)
      : 'provider';

  const [selectedPortal, setSelectedPortal] = useState<PortalRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestedRole, setSuggestedRole] = useState<PortalRole | null>(null);

  // Sync selected portal if urlRole parameter changes
  useEffect(() => {
    if (urlRole && ['provider', 'organization', 'admin'].includes(urlRole)) {
      setSelectedPortal(urlRole as PortalRole);
      setError('');
      setSuggestedRole(null);
    }
  }, [urlRole]);

  const portal = portals.find((p) => p.role === selectedPortal)!;

  const handlePortalSwitch = (newRole: PortalRole) => {
    setSelectedPortal(newRole);
    setError('');
    setSuggestedRole(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuggestedRole(null);
    setIsLoading(true);
    try {
      // Pass selectedPortal to enforce that only this role can authenticate through this portal
      const user = await login(email, password, selectedPortal);
      navigate(`/${user.role}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid email or password. Please try again.';
      const actual = err?.response?.data?.actualRole;
      if (actual && ['provider', 'organization', 'admin'].includes(actual)) {
        setSuggestedRole(actual as PortalRole);
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-scale-in">
      <div
        className="rounded-3xl p-8"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6,61,39,0.12)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.08)',
        }}
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 mb-7">
          <FoodLoopLogo size={44} />
          <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-500 font-mono tracking-wide uppercase">
            Select your portal to continue
          </p>
        </div>

        {/* Portal Tabs */}
        <div
          className="grid grid-cols-3 gap-2 mb-6 p-1 rounded-2xl"
          style={{ background: 'rgba(6,61,39,0.04)', border: '1px solid rgba(6,61,39,0.08)' }}
        >
          {portals.map((p) => (
            <button
              key={p.role}
              type="button"
              onClick={() => handlePortalSwitch(p.role)}
              className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl transition-all"
              style={
                selectedPortal === p.role
                  ? {
                      background: p.activeBg,
                      border: `1px solid ${p.activeBorder}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }
                  : { border: '1px solid transparent' }
              }
            >
              <BoxAvatarOverlay role={p.avatar} size="sm" />
              <span
                className="font-display font-bold text-[10px] text-center leading-tight"
                style={{ color: selectedPortal === p.role ? p.accentColor : '#64748b' }}
              >
                {p.label}
              </span>
            </button>
          ))}
        </div>

        {/* Selected portal label */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-5"
          style={{ background: portal.activeBg, border: `1px solid ${portal.activeBorder}` }}
        >
          <span style={{ color: portal.accentColor }}>{portal.icon}</span>
          <div>
            <p className="font-display font-bold text-xs" style={{ color: portal.accentColor }}>
              {portal.label}
            </p>
            <p className="text-[10px] text-slate-500">{portal.sublabel}</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-xs text-rose-800 space-y-2">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="text-rose-600 shrink-0 mt-0.5" size={15} />
              <div className="font-medium leading-relaxed">{error}</div>
            </div>

            {/* Smart Portal Switcher Button if account belongs to a different portal */}
            {suggestedRole && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handlePortalSwitch(suggestedRole)}
                  className="w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-display font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <FiCornerDownRight size={13} />
                  <span>Switch to {portals.find(p => p.role === suggestedRole)?.label} Portal</span>
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                style={{
                  background: 'rgba(6,61,39,0.04)',
                  border: '1.5px solid rgba(6,61,39,0.14)',
                }}
                onFocus={(e) => { e.target.style.borderColor = portal.accentColor; e.target.style.boxShadow = `0 0 0 3px ${portal.activeBg}`; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(6,61,39,0.14)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                style={{
                  background: 'rgba(6,61,39,0.04)',
                  border: '1.5px solid rgba(6,61,39,0.14)',
                }}
                onFocus={(e) => { e.target.style.borderColor = portal.accentColor; e.target.style.boxShadow = `0 0 0 3px ${portal.activeBg}`; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(6,61,39,0.14)'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-white font-display font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${portal.accentColor}, ${portal.accentColor}dd)`,
              boxShadow: `0 4px 12px ${portal.activeBg}`,
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to {portal.label}</span>
                <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-sm text-slate-500 mt-5">
          Don&apos;t have an account?{' '}
          <Link
            to={selectedPortal === 'admin' ? '/register/provider' : `/register/${selectedPortal}`}
            className="font-bold hover:underline"
            style={{ color: portal.accentColor }}
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
