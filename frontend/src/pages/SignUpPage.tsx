import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { AWSLogo } from '../components/ui/AWSLogo';
import { Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';

interface SignUpPageProps {
  onNavigate: (tab: 'signin' | 'verify') => void;
  onRegisteredEmail: (email: string) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate, onRegisteredEmail }) => {
  const { signUp, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    try {
      const formattedEmail = email.trim();
      const res = await signUp(formattedEmail, password);
      onRegisteredEmail(formattedEmail);
      
      if (!res.userConfirmed) {
        onNavigate('verify');
      } else {
        onNavigate('signin');
      }
    } catch (err: any) {
      // Error handled by AuthContext and shown via activeError
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
            Create Member Account
          </h2>
          <p className="text-xs text-slate-400">
            Register for campus AWS Student Builder Group portal access
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
            <label className="text-xs font-semibold text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900] text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !email || !password || !confirmPassword}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              loading || !email || !password || !confirmPassword
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#ff9900] to-[#ec7211] text-slate-950 shadow-[0_0_25px_rgba(255,153,0,0.35)] hover:brightness-110 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Creating Account in Cognito...</span>
              </div>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Switch to SignIn */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Already a registered member?{' '}
            <button
              onClick={() => onNavigate('signin')}
              className="font-bold text-[#ff9900] hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
