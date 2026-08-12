import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { AWSLogo } from '../components/ui/AWSLogo';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

interface ResetPasswordPageProps {
  email: string;
  onNavigateToSignIn: (msg?: string) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ email, onNavigateToSignIn }) => {
  const { confirmForgotPassword, loading, error, clearError } = useAuth();

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!code.trim()) {
      setLocalError('Please enter the reset code sent to your email.');
      return;
    }
    if (newPassword.length < 8) {
      setLocalError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    try {
      await confirmForgotPassword(email, code.trim(), newPassword);
      onNavigateToSignIn('Your password has been reset successfully! Please sign in with your new password.');
    } catch (err: any) {
      // Error in AuthContext
    }
  };

  const activeError = localError || error;

  return (
    <div className="max-w-md mx-auto px-4 py-12 animate-fadeIn">
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <AWSLogo size="md" className="justify-center mb-3" />
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs text-slate-400">
            Check your email <span className="font-mono text-[#ff9900]">{email}</span> for reset instructions code
          </p>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="leading-relaxed">{activeError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Reset Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Reset Code
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Reset code from email"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900] text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900] text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-10 pr-10 py-2.5 focus:outline-none transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900] text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !code || !newPassword || !confirmPassword}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              loading || !code || !newPassword || !confirmPassword
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#ff9900] to-[#ec7211] text-slate-950 shadow-[0_0_25px_rgba(255,153,0,0.35)] hover:brightness-110 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {loading ? 'Confirming Password Reset...' : 'Set New Password'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/80">
          <button
            onClick={() => onNavigateToSignIn()}
            className="text-xs font-semibold text-[#ff9900] hover:underline"
          >
            Back to Sign In
          </button>
        </div>

      </div>
    </div>
  );
};
