import React, { useState } from 'react';
import { AWSLogo } from '../ui/AWSLogo';
import { useAuth } from '../../auth/AuthContext';
import { LogOut, Bot, LayoutDashboard, Menu, X, User, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'landing' | 'signin' | 'signup' | 'verify' | 'forgot' | 'reset' | 'dashboard' | 'chat';
  onNavigate: (tab: 'landing' | 'signin' | 'signup' | 'verify' | 'forgot' | 'reset' | 'dashboard' | 'chat') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavigate }) => {
  const { isAuthenticated, user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    onNavigate('landing');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0b0f19]/80 border-b border-slate-800/80 shadow-lg shadow-black/20 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Lockup */}
        <button
          onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
          className="flex items-center gap-4 text-left focus:outline-none group"
        >
          <AWSLogo size="md" />
          <div className="hidden sm:flex flex-col border-l border-slate-800 pl-4 py-0.5">
            <span className="text-lg font-bold text-white tracking-tight group-hover:text-[#ff9900] transition-colors">
              Club Member Portal
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Member Login + Club Chatbot
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'dashboard'
                    ? 'bg-[#ff9900]/15 text-[#ff9900] border border-[#ff9900]/40 shadow-[0_0_15px_rgba(255,153,0,0.15)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>

              <button
                onClick={() => onNavigate('chat')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'chat'
                    ? 'bg-[#ff9900] text-slate-950 font-semibold shadow-[0_0_20px_rgba(255,153,0,0.4)] hover:bg-[#ec7211]'
                    : 'text-[#ff9900] bg-[#ff9900]/10 hover:bg-[#ff9900]/20 border border-[#ff9900]/30'
                }`}
              >
                <Bot className="w-4 h-4" />
                Club Assistant
              </button>

              {/* User Email Pill */}
              <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#ff9900]" />
                  <span className="max-w-[160px] truncate">{user?.email}</span>
                </div>

                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('signin')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  activeTab === 'signin'
                    ? 'text-white bg-slate-800 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Sign In
              </button>

              <button
                onClick={() => onNavigate('signup')}
                className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm text-slate-950 bg-gradient-to-r from-[#ff9900] to-[#ec7211] hover:brightness-110 shadow-[0_0_20px_rgba(255,153,0,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <User className="w-4 h-4" />
                Create Account
              </button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0b0f19]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 mb-2">
                <ShieldCheck className="w-4 h-4 text-[#ff9900]" />
                <span className="truncate">{user?.email}</span>
              </div>
              <button
                onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-200 hover:bg-slate-800 text-left"
              >
                <LayoutDashboard className="w-5 h-5 text-[#ff9900]" />
                Dashboard
              </button>
              <button
                onClick={() => { onNavigate('chat'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-slate-950 bg-[#ff9900] hover:bg-[#ec7211] text-left"
              >
                <Bot className="w-5 h-5" />
                Club Assistant
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-400 hover:bg-red-500/10 text-left"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { onNavigate('signin'); setMobileMenuOpen(false); }}
                className="w-full py-3 rounded-xl font-medium text-slate-200 hover:bg-slate-800 text-center"
              >
                Sign In
              </button>
              <button
                onClick={() => { onNavigate('signup'); setMobileMenuOpen(false); }}
                className="w-full py-3 rounded-xl font-semibold text-slate-950 bg-[#ff9900] hover:bg-[#ec7211] text-center"
              >
                Create Account
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
