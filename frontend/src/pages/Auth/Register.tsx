import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiPhone, FiMapPin, FiBriefcase, FiCoffee, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

type Role = 'provider' | 'organization' | 'admin';

const Register: React.FC = () => {
  const { role: urlRole } = useParams<{ role?: string }>();
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [role, setRole] = useState<Role>((urlRole as Role) || 'provider');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await registerUser({
        name,
        email,
        password,
        role,
        organizationName: role === 'organization' ? organizationName : undefined,
        address,
        phone,
      });
      navigate(`/${role}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions: { value: Role; label: string; desc: string; icon: React.ReactNode; activeBorder: string; activeBg: string }[] = [
    {
      value: 'provider',
      label: 'Food Donor',
      desc: 'Restaurant, bakery, grocery store',
      icon: <FiCoffee size={20} className="text-emerald-600 dark:text-emerald-400" />,
      activeBorder: 'border-emerald-500',
      activeBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      value: 'organization',
      label: 'Community Organization',
      desc: 'Food bank, shelter, soup kitchen',
      icon: <FiUsers size={20} className="text-amber-600 dark:text-amber-400" />,
      activeBorder: 'border-amber-500',
      activeBg: 'bg-amber-50 dark:bg-amber-950/50',
    },
  ];

  return (
    <div className="w-full max-w-lg mx-auto animate-scale-in">
      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-900/20 dark:border-emerald-700/30 rounded-3xl p-8 shadow-soft">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white">
            Create Your Account
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Join the zero food waste movement
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-3">
              {roleOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                    role === opt.value
                      ? `${opt.activeBorder} ${opt.activeBg} shadow-pop-sm`
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <div className="mt-0.5">{opt.icon}</div>
                  <div>
                    <div className="font-display font-bold text-xs text-slate-900 dark:text-white">{opt.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ahmed Khan" required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-emerald-900/15 dark:border-emerald-700/30 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Organization Name (conditional) */}
          {role === 'organization' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Organization Name</label>
              <div className="relative">
                <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Edhi Foundation"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-emerald-900/15 dark:border-emerald-700/30 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-emerald-900/15 dark:border-emerald-700/30 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-emerald-900/15 dark:border-emerald-700/30 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Address</label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-slate-400" />
              <textarea
                value={address} onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, City"
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-emerald-900/15 dark:border-emerald-700/30 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm resize-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters" required minLength={8}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-emerald-900/15 dark:border-emerald-700/30 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
              />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-emerald-400 disabled:to-emerald-400 text-white font-display font-bold text-sm rounded-xl border-2 border-emerald-900 shadow-pop-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <span>Create Account</span>
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

        {/* Switch to Login */}
        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to={urlRole ? `/login/${urlRole}` : '/login'}
              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
            >
              Sign In Instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
