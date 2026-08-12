import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { AWSLogo } from '../components/ui/AWSLogo';
import { Mail, Key, AlertCircle, ArrowLeft } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigateToReset: (email: string) => void;
  onNavigateToSignIn: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateToReset,
  onNavigateToSignIn,
}) => {
  const { forgotPassword, loading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }

    try {
      const formatted = email.trim();
      await forgotPassword(formatted);
      onNavigateToReset(formatted);
    } catch (err: any) {
      // Error handles by AuthContext
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
            Forgot Password
          </h2>
          <p className="text-xs text-slate-400">
            Enter your registered email address to receive password reset instructions
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
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900] text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              loading || !email.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#ff9900] to-[#ec7211] text-slate-950 shadow-[0_0_25px_rgba(255,153,0,0.35)] hover:brightness-110 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <span>Sending Reset Request to Cognito...</span>
            ) : (
              <>
                <Key className="w-4 h-4" />
                <span>Send Password Reset Code</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/80">
          <button
            onClick={onNavigateToSignIn}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </button>
        </div>

      </div>
    </div>
  );
};
