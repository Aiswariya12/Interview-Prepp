import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import {
  KeyRound,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowRight
} from 'lucide-react';

const ChangePasswordModal = ({ isOpen, onClose, defaultEmail = '' }) => {
  const { user, isAuthenticated, changePassword, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmail(user?.email || defaultEmail || '');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
    }
  }, [isOpen, user, defaultEmail]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const targetEmail = isAuthenticated ? user?.email : email.trim();

    if (!targetEmail) {
      setError('Please provide your registered email address.');
      return;
    }

    if (!oldPassword) {
      setError('Please enter your current old password.');
      return;
    }

    if (!newPassword) {
      setError('Please enter your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (oldPassword === newPassword) {
      setError('New password cannot be the same as your old password.');
      return;
    }

    const res = await changePassword({
      email: targetEmail,
      oldPassword,
      newPassword,
    });

    if (res.success) {
      setSuccess('Password updated successfully! You can now log in with your new password.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
      }, 2200);
    } else {
      setError(res.error || 'Incorrect old password. Please enter correct old password.');
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 md:p-6 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex flex-col justify-center items-center">
        <div
          className="relative w-full max-w-md m-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-indigo-950/30 border border-slate-200/90 overflow-hidden animate-scale-in flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)]"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                Change Password
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                Verify your old password to set a new one
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3.5 sm:space-y-4 flex-1">
          {error && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-scale-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 font-medium text-xs leading-relaxed break-words">{error}</div>
            </div>
          )}

          {success && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-scale-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="flex-1 font-medium text-xs leading-relaxed break-words">{success}</div>
            </div>
          )}

          {/* Email field (read-only if logged in, editable if from login page) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 sm:mb-1.5">
              Registered Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                readOnly={isAuthenticated}
                value={isAuthenticated ? user?.email : email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm transition-all ${
                  isAuthenticated
                    ? 'bg-slate-100/80 border-slate-200 text-slate-600 cursor-not-allowed'
                    : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
            </div>
          </div>

          {/* Current / Old Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 sm:mb-1.5">
              Current Old Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showOldPassword ? 'text' : 'password'}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-9 sm:pl-10 pr-10 py-2 sm:py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs sm:text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute inset-y-0 right-0 pr-3 sm:pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showOldPassword ? "Hide password" : "Show password"}
              >
                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 sm:mb-1.5">
              New Password <span className="text-[10px] text-slate-400 font-normal">(min. 6 characters)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create new password"
                className="w-full pl-9 sm:pl-10 pr-10 py-2 sm:py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs sm:text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 sm:pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 sm:mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full pl-9 sm:pl-10 pr-10 py-2 sm:py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs sm:text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 sm:pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 sm:pt-3 flex flex-col-reverse sm:flex-row items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>,
  document.body
);
};

export default ChangePasswordModal;
