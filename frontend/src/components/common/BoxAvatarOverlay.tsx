import React from 'react';
import { FiShoppingBag, FiUsers, FiShield, FiHeart, FiHome, FiCoffee } from 'react-icons/fi';

type AvatarRole = 'donor' | 'organization' | 'admin' | 'volunteer' | 'family' | 'chef';

interface BoxAvatarOverlayProps {
  role: AvatarRole;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
}

const iconSize: Record<string, number> = { sm: 18, md: 26, lg: 36 };

const avatarConfig: Record<AvatarRole, {
  icon: (size: number) => React.ReactNode;
  bgGradient: string;
  borderColor: string;
  badgeBg: string;
  label: string;
}> = {
  donor: {
    icon: (s) => <FiCoffee size={s} className="text-white drop-shadow" />,
    bgGradient: 'from-emerald-500 to-emerald-700',
    borderColor: 'border-emerald-900',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-400',
    label: 'Food Donor',
  },
  organization: {
    icon: (s) => <FiUsers size={s} className="text-white drop-shadow" />,
    bgGradient: 'from-amber-400 to-amber-600',
    borderColor: 'border-amber-900',
    badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-400',
    label: 'Community Org',
  },
  admin: {
    icon: (s) => <FiShield size={s} className="text-white drop-shadow" />,
    bgGradient: 'from-indigo-500 to-indigo-700',
    borderColor: 'border-indigo-900',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-400',
    label: 'Admin',
  },
  volunteer: {
    icon: (s) => <FiHeart size={s} className="text-white drop-shadow" />,
    bgGradient: 'from-teal-400 to-emerald-600',
    borderColor: 'border-teal-900',
    badgeBg: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border-teal-400',
    label: 'Volunteer',
  },
  family: {
    icon: (s) => <FiHome size={s} className="text-white drop-shadow" />,
    bgGradient: 'from-rose-400 to-rose-600',
    borderColor: 'border-rose-900',
    badgeBg: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-400',
    label: 'Family',
  },
  chef: {
    icon: (s) => <FiCoffee size={s} className="text-white drop-shadow" />,
    bgGradient: 'from-orange-400 to-amber-600',
    borderColor: 'border-orange-900',
    badgeBg: 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border-orange-400',
    label: 'Chef',
  },
};

const sizeClasses: Record<string, string> = {
  sm: 'w-10 h-10 rounded-xl',
  md: 'w-14 h-14 rounded-2xl',
  lg: 'w-20 h-20 rounded-2xl',
};

/**
 * BoxAvatarOverlay — CSS-rendered box avatar with gradient background, real SVG icon,
 * and optional badge.
 */
export const BoxAvatarOverlay: React.FC<BoxAvatarOverlayProps> = ({
  role,
  size = 'md',
  showBadge = false,
  badgeText,
  className = '',
}) => {
  const config = avatarConfig[role] || avatarConfig.donor;
  const s = iconSize[size] || iconSize.md;

  return (
    <div className={`relative inline-flex flex-col items-center gap-1 ${className}`}>
      {/* Box Avatar */}
      <div
        className={`
          ${sizeClasses[size]}
          bg-gradient-to-br ${config.bgGradient}
          border-2 ${config.borderColor}
          flex items-center justify-center
          shadow-pop-sm
          relative overflow-hidden
          transition-transform duration-200
          hover:scale-105 hover:shadow-pop-gold
        `}
      >
        {/* Shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent pointer-events-none" />
        <span className="relative z-10">{config.icon(s)}</span>
      </div>

      {/* Optional Badge */}
      {showBadge && (
        <span
          className={`
            text-[9px] font-extrabold uppercase tracking-wide
            px-2 py-0.5 rounded-full border
            ${config.badgeBg}
          `}
        >
          {badgeText || config.label}
        </span>
      )}
    </div>
  );
};

export default BoxAvatarOverlay;
