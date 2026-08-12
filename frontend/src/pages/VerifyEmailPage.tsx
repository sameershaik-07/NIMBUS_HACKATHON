import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { AWSLogo } from '../components/ui/AWSLogo';
import { cognitoAuthService } from '../services/cognito';
import { KeyRound, Mail, AlertCircle, CheckCircle } from 'lucide-react';

interface VerifyEmailPageProps {
  email: string;
  onNavigateToSignIn: (msg?: string) => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ email, onNavigateToSignIn }) => {
  const { confirmSignUp, loading, error, clearError } = useAuth();
  
  const [code, setCode] = useState('');
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!code.trim()) {
      setLocalError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      await confirmSignUp(email, code.trim());
      onNavigateToSignIn('Your email has been verified! Please sign in with your credentials.');
    } catch (err: any) {
      // Error is set in AuthContext
    }
  };

  const handleResendCode = async () => {
    setResendStatus(null);
    try {
      await cognitoAuthService.resendConfirmationCode(email);
      setResendStatus('A new verification code has been sent to your email.');
    } catch (err: any) {
      setLocalError(err.message || 'Failed to resend verification code.');
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
            Verify Your Email
          </h2>
          <p className="text-xs text-slate-400">
            We sent a verification code to <span className="font-mono text-[#ff9900]">{email}</span>
          </p>
        </div>

        {/* Resend Status Banner */}
        {resendStatus && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{resendStatus}</span>
          </div>
        )}

        {/* Error Alert */}
        {activeError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="leading-relaxed">{activeError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              6-Digit Verification Code
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900] text-slate-100 placeholder-slate-500 text-center font-mono tracking-widest text-lg rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              loading || !code.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#ff9900] to-[#ec7211] text-slate-950 shadow-[0_0_25px_rgba(255,153,0,0.35)] hover:brightness-110 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {loading ? 'Verifying with Cognito...' : 'Confirm Verification'}
          </button>
        </form>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={handleResendCode}
            className="text-slate-400 hover:text-white underline"
          >
            Resend Code
          </button>
          <button
            onClick={() => onNavigateToSignIn()}
            className="text-[#ff9900] font-semibold hover:underline"
          >
            Back to Sign In
          </button>
        </div>

      </div>
    </div>
  );
};
