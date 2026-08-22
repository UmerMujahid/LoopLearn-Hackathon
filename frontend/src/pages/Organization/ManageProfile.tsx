import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { BoxAvatarOverlay } from '../../components/common/BoxAvatarOverlay';
import { TiltCard } from '../../components/common/TiltCard';
import {
  FiUser,
  FiHome,
  FiPhone,
  FiMail,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiSave,
  FiArrowLeft,
  FiLock,
  FiMapPin,
  FiInfo,
  FiGrid
} from 'react-icons/fi';

export const ManageProfile: React.FC = () => {
  const { currentUser, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(currentUser?.name || '');
  const [organizationName, setOrganizationName] = useState(currentUser?.organizationName || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setOrganizationName(currentUser.organizationName || '');
      setAddress(currentUser.address || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Pakistani phone number format validation
  const isPakistaniPhone = (val: string) => {
    const cleaned = val.replace(/[\s\-\(\)\.]/g, '');
    return /^(?:(?:\+92|0092|92)?3[0-9]{9}|03[0-9]{9})$/.test(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Representative contact name is required.', 'error');
      return;
    }
    if (!organizationName.trim()) {
      showToast('Community organization name is required.', 'error');
      return;
    }
    if (!address.trim()) {
      showToast('Physical distribution address is required.', 'error');
      return;
    }
    if (!isPakistaniPhone(phone)) {
      showToast('Please enter a valid Pakistani mobile number (e.g. 03001234567 or +923001234567).', 'error');
      return;
    }

    setLoading(true);
    try {
      await authService.updateProfile({
        name: name.trim(),
        organizationName: organizationName.trim(),
        address: address.trim(),
        phone: phone.trim()
      });
      await refreshProfile();
      showToast('Community organization profile updated successfully!');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to update organization profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl border-2 shadow-pop-lg flex items-center gap-2 font-display text-xs font-bold animate-scale-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-950'
              : 'bg-rose-600 text-white border-rose-950'
          }`}
        >
          {toastMessage.type === 'success' ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          to="/organization"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-2 border-emerald-950/20 dark:border-emerald-800 text-xs font-extrabold hover:border-emerald-950 transition-all shadow-soft active:scale-95"
        >
          <FiArrowLeft size={14} />
          <span>Back to Organization Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-400 font-mono text-[11px] font-black uppercase">
            Community Org Portal
          </span>
          {currentUser?.isVerified ? (
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border border-emerald-400 text-[11px] font-black flex items-center gap-1">
              <FiCheckCircle size={12} /> Verified Relief Hub
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-300 text-[11px] font-bold flex items-center gap-1">
              <FiShield size={12} /> Pending Verification
            </span>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#faf6ee] via-[#faf8f4] to-[#f4efe6] dark:from-[#0f1a14] dark:via-[#14241a] dark:to-[#0f1a14] border-2 border-emerald-950 dark:border-emerald-800 shadow-pop-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <BoxAvatarOverlay role="organization" size="lg" showBadge badgeText="Community Org" />
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-emerald-950 dark:text-white tracking-tight">
              Manage Organization Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium max-w-xl">
              Keep your relief shelter details, verified contact credentials, and intake address accurate to ensure smooth surplus food donor dispatch.
            </p>
          </div>
        </div>

        <Link
          to="/organization"
          className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-display font-black text-xs border-2 border-emerald-950 shadow-pop-sm flex items-center gap-2 shrink-0 self-start md:self-auto"
        >
          <FiGrid size={14} /> View Dashboard
        </Link>
      </div>

      {/* Main Grid: Form + Live Preview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Profile Edit Form (Span 7) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0f1a14] rounded-3xl border-2 border-emerald-950/20 dark:border-emerald-800 p-6 md:p-8 shadow-soft">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <h2 className="font-display font-black text-lg text-emerald-950 dark:text-white flex items-center gap-2">
              <FiUser className="text-amber-500" />
              <span>Organization Details</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Editable parameters for your community intake and relief dispatch hub.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Organization / Shelter Name */}
            <div>
              <label className="block font-display font-bold text-xs text-slate-800 dark:text-slate-200 mb-1.5">
                Official Organization / Shelter Name *
              </label>
              <div className="relative">
                <FiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Hope Haven Relief Kitchen"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium text-xs focus:border-emerald-600 dark:focus:border-emerald-500 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Field 2: Representative Contact Name */}
            <div>
              <label className="block font-display font-bold text-xs text-slate-800 dark:text-slate-200 mb-1.5">
                Authorized Representative / Contact Person *
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium text-xs focus:border-emerald-600 dark:focus:border-emerald-500 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Field 3: Pakistani Mobile Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-display font-bold text-xs text-slate-800 dark:text-slate-200">
                  Primary Mobile / Dispatch Phone *
                </label>
                {phone ? (
                  isPakistaniPhone(phone) ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <FiCheckCircle size={11} /> Valid PK Mobile
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <FiAlertCircle size={11} /> 03XX-XXXXXXX or +92 3XX...
                    </span>
                  )
                ) : null}
              </div>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 03001234567 or +92 300 1234567"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 text-slate-900 dark:text-white font-medium text-xs outline-none transition-colors ${
                    phone
                      ? isPakistaniPhone(phone)
                        ? 'border-emerald-500/80 focus:border-emerald-600'
                        : 'border-rose-400 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-emerald-600'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Field 4: Physical Intake Address */}
            <div>
              <label className="block font-display font-bold text-xs text-slate-800 dark:text-slate-200 mb-1.5">
                Physical Distribution & Intake Address *
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3.5 top-3 text-slate-400 text-sm" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Sector G-8/4 Community Relief Hall, Islamabad"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium text-xs focus:border-emerald-600 dark:focus:border-emerald-500 outline-none transition-colors resize-none"
                  required
                />
              </div>
            </div>

            {/* Read-Only System Credentials */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <FiMail size={13} className="text-slate-400" />
                  <span>Login Email ID:</span>
                  <strong className="text-slate-900 dark:text-white">{currentUser?.email}</strong>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  <FiLock size={10} /> Locked
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <FiShield size={13} className="text-amber-500" />
                  <span>Role & Governance:</span>
                  <strong className="text-slate-900 dark:text-white">Community Organization</strong>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  <FiLock size={10} /> Read-Only
                </span>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-sm border-2 border-emerald-950 shadow-pop-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <FiSave size={16} />
                <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Public Dispatch Preview (Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          <TiltCard intensity={4}>
            <div className="p-6 rounded-3xl bg-[#fdfcf7] dark:bg-[#0f1a14] border-2 border-emerald-950 dark:border-emerald-800 shadow-pop-md">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-mono font-extrabold uppercase text-amber-800 dark:text-amber-300">
                  Donor Dispatch View
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                  <FiInfo size={11} /> Live Preview
                </span>
              </div>

              <div className="flex items-start gap-3.5 mb-4">
                <BoxAvatarOverlay role="organization" size="md" />
                <div className="min-w-0">
                  <h3 className="font-display font-black text-base text-slate-900 dark:text-white truncate">
                    {organizationName || 'Your Organization Name'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Contact: <strong className="text-emerald-800 dark:text-emerald-400">{name || 'Contact Person'}</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FiPhone className="text-emerald-600 shrink-0" size={13} />
                  <span className="font-medium truncate">{phone || 'Phone number not set'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <FiMapPin className="text-amber-600 shrink-0 mt-0.5" size={13} />
                  <span className="font-medium leading-tight">{address || 'Physical address not set'}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-900 text-[11px]">
                  <FiMail className="text-slate-400 shrink-0" size={12} />
                  <span className="truncate">{currentUser?.email}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Municipal Status:</span>
                {currentUser?.isVerified ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <FiCheckCircle size={12} /> Verified Partner
                  </span>
                ) : (
                  <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                    <FiShield size={12} /> Under Review
                  </span>
                )}
              </div>
            </div>
          </TiltCard>

          {/* Quick Guidance Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-[#14241a] border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-950 dark:text-indigo-200 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-indigo-900 dark:text-indigo-300">
              <FiShield size={14} /> Verification & Trust Notice
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Whenever you update your physical intake address or representative details, donor claim manifests will instantly route to your updated location.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProfile;
