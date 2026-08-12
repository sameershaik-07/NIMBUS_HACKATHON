import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { AWSLogo } from '../components/ui/AWSLogo';
import { Lock, Mail, Eye, EyeOff, LogIn, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SignInPageProps {
  onNavigate: (tab: 'signup' | 'forgot' | 'dashboard' | 'verify') => void;
  initialMessage?: string | null;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onNavigate, initialMessage }) => {
  const { signIn, loading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    try {
      await signIn(email.trim(), password);
      onNavigate('dashboard');
    } catch (err: any) {
      if (err.code === 'UserNotConfirmedException' || err.message?.includes('verified')) {
        onNavigate('verify');
      }
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
            Member Sign In
          </h2>
          <p className="text-xs text-slate-400">
            Enter your credentials to access the Club Member Portal
          </p>
        </div>

        {/* Initial Success Notification */}
        {initialMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{initialMessage}</span>
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
          
          {/* Email Field */}
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

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot')}
                className="text-xs font-medium text-[#ff9900] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              loading || !email || !password
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#ff9900] to-[#ec7211] text-slate-950 shadow-[0_0_25px_rgba(255,153,0,0.35)] hover:brightness-110 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Authenticating with Cognito...</span>
              </div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Switch to SignUp */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Don't have a member account yet?{' '}
            <button
              onClick={() => onNavigate('signup')}
              className="font-bold text-[#ff9900] hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
