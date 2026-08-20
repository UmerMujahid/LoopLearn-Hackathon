import React, { useState } from 'react';
import { FiMail, FiLock, FiX, FiArrowRight } from 'react-icons/fi';
import { BoxAvatarOverlay } from '../common/BoxAvatarOverlay';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string, role: 'provider' | 'organization' | 'admin') => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'provider' | 'organization' | 'admin'>('provider');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, role);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-scale-in">
      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-900/20 dark:border-emerald-700/30 rounded-3xl p-8 shadow-lg w-full max-w-md relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <FiX size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center gap-2 mb-3">
            <BoxAvatarOverlay role="donor" size="sm" />
            <BoxAvatarOverlay role="organization" size="sm" />
            <BoxAvatarOverlay role="admin" size="sm" />
          </div>
          <h2 className="font-display font-black text-xl text-slate-900 dark:text-white">
            Sign In to FoodLoop
          </h2>
        </div>

        {/* Role tabs */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { value: 'provider' as const, label: 'Donor', avatar: 'donor' as const },
            { value: 'organization' as const, label: 'Org', avatar: 'organization' as const },
            { value: 'admin' as const, label: 'Admin', avatar: 'admin' as const },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value)}
              className={`p-2 rounded-xl border text-center transition-all text-xs font-bold ${
                role === opt.value
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address" required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-emerald-900/15 dark:border-emerald-700/30 bg-white dark:bg-slate-950 text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-emerald-900/15 dark:border-emerald-700/30 bg-white dark:bg-slate-950 text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-display font-bold text-sm rounded-xl border-2 border-emerald-900 shadow-pop-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Sign In</span>
            <FiArrowRight />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInModal;
