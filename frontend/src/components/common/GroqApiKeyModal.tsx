import React, { useState, useEffect } from 'react';
import { FiKey, FiEye, FiEyeOff, FiCheck, FiX, FiExternalLink, FiShield, FiZap, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

interface GroqApiKeyModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const GroqApiKeyModal: React.FC<GroqApiKeyModalProps> = ({ forceOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Initialize key from localStorage
  useEffect(() => {
    const existingKey = localStorage.getItem('foodloop_groq_api_key') || '';
    setApiKey(existingKey);
  }, []);

  // Listen for custom open events from other components (like AIAssistant)
  useEffect(() => {
    const handleOpenEvent = () => {
      const existingKey = localStorage.getItem('foodloop_groq_api_key') || '';
      setApiKey(existingKey);
      setIsOpen(true);
    };

    window.addEventListener('open-groq-modal', handleOpenEvent);
    return () => window.removeEventListener('open-groq-modal', handleOpenEvent);
  }, []);

  // Handle forceOpen prop changes
  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);

  // Check once after login: if logged in and never prompted, show popup
  useEffect(() => {
    if (isAuthenticated) {
      const prompted = localStorage.getItem('foodloop_groq_prompted');
      const key = localStorage.getItem('foodloop_groq_api_key');
      if (!prompted && !key) {
        // Small delay for smooth UI entrance after login redirect
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanKey = apiKey.trim();
    if (cleanKey) {
      localStorage.setItem('foodloop_groq_api_key', cleanKey);
      localStorage.setItem('foodloop_groq_prompted', 'true');
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        handleClose();
      }, 700);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('foodloop_groq_prompted', 'true');
    handleClose();
  };

  const handleClearKey = () => {
    localStorage.removeItem('foodloop_groq_api_key');
    setApiKey('');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      handleClose();
    }, 500);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      data-testid="groq-api-key-modal"
    >
      <div
        className="relative w-full max-w-md bg-[#faf8f4] dark:bg-[#0f1a14] border-2 border-emerald-950 dark:border-emerald-800 rounded-3xl shadow-pop-lg overflow-hidden flex flex-col animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="groq-modal-title"
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-950 text-white border-b-2 border-emerald-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 border border-emerald-950 flex items-center justify-center font-bold text-lg shadow-pop-sm">
              <FiZap />
            </div>
            <div>
              <h3 id="groq-modal-title" className="font-display font-extrabold text-base tracking-tight flex items-center gap-2">
                Groq AI API Key
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                  LLaMA-3
                </span>
              </h3>
              <p className="text-[11px] text-emerald-200/80">Configure AI Features for FoodLoop</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 space-y-1.5 leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
              <FiShield className="shrink-0" /> Free & Private AI Inference
            </div>
            <p className="text-[11px]">
              FoodLoop uses Groq's high-speed LLaMA-3 models for instant Food Safety RAG, Waste Reduction Strategies, and Agentic Matchmaking.
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              🔒 Your key is stored securely in your browser's localStorage and is never stored on backend servers.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-display font-bold text-slate-800 dark:text-slate-200">
              Enter Your Groq API Key:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FiKey size={15} />
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-emerald-600 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Get a free API key at console.groq.com</span>
              <FiExternalLink size={11} />
            </a>
            {localStorage.getItem('foodloop_groq_api_key') && (
              <button
                type="button"
                onClick={handleClearKey}
                className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
              >
                <FiTrash2 size={11} />
                <span>Clear Key</span>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 py-2.5 px-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-display font-bold text-xs transition-all active:scale-95"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={!apiKey.trim()}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-display font-bold text-xs rounded-xl border-2 border-emerald-950 shadow-pop-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {savedSuccess ? (
                <>
                  <FiCheck className="text-amber-300" size={15} />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <FiZap className="text-amber-300" size={14} />
                  <span>Save & Enable AI</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const triggerGroqApiKeyModal = () => {
  window.dispatchEvent(new CustomEvent('open-groq-modal'));
};

export default GroqApiKeyModal;
