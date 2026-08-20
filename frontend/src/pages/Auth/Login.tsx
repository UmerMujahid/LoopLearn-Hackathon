import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { BoxAvatarOverlay } from '../../components/common/BoxAvatarOverlay';

const Login: React.FC = () => {
  const { role: urlRole } = useParams<{ role?: string }>();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate login - in production, call auth API
    setTimeout(() => {
      setIsLoading(false);
      const role = urlRole || 'provider';
      localStorage.setItem('foodloop_token', 'demo_token');
      localStorage.setItem('foodloop_user', JSON.stringify({
        name: 'Ahmed Khan',
        email,
        role,
        avatar: role === 'provider' ? '🥗' : role === 'organization' ? '🍲' : '🛡️',
      }));
      navigate(`/${role}`);
    }, 800);
  };

  return (
    <div className="w-full max-w-md mx-auto animate-scale-in">
      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-900/20 dark:border-emerald-700/30 rounded-3xl p-8 shadow-soft">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BoxAvatarOverlay role="donor" size="lg" />
          </div>
          <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Sign in to your FoodLoop account
          </p>
        </div>

        {/* Role indicator */}
        {urlRole && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Signing in as: <span className="capitalize">{urlRole}</span>
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-emerald-900/15 dark:border-emerald-700/30 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-emerald-900/15 dark:border-emerald-700/30 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
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
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-display font-bold text-sm rounded-xl border-2 border-emerald-900 shadow-pop-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <span>Sign In</span>
                <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          <span className="text-[10px] font-bold text-slate-400 uppercase">or</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Switch to Register */}
        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link
              to={urlRole ? `/register/${urlRole}` : '/register'}
              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>

        {/* Quick Role Login */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Demo Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { role: 'provider', label: 'Donor', avatar: 'donor' as const, path: '/provider' },
              { role: 'organization', label: 'Org', avatar: 'organization' as const, path: '/organization' },
              { role: 'admin', label: 'Admin', avatar: 'admin' as const, path: '/admin' },
            ].map((item) => (
              <button
                key={item.role}
                type="button"
                onClick={() => {
                  localStorage.setItem('foodloop_token', 'demo_token');
                  localStorage.setItem('foodloop_user', JSON.stringify({
                    name: `Demo ${item.label}`,
                    email: `demo@${item.role}.foodloop.pk`,
                    role: item.role,
                    avatar: item.role === 'provider' ? '🥗' : item.role === 'organization' ? '🍲' : '🛡️',
                  }));
                  navigate(item.path);
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all text-xs"
              >
                <BoxAvatarOverlay role={item.avatar} size="sm" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
