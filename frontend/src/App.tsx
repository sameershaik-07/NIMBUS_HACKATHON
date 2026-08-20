import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppBackground } from './components/layout/AppBackground';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PWAInstallPrompt } from './components/pwa/PWAInstallPrompt';

import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { AdminPage } from './pages/AdminPage';

type TabType =
  | 'landing'
  | 'signin'
  | 'signup'
  | 'verify'
  | 'forgot'
  | 'reset'
  | 'dashboard'
  | 'chat'
  | 'admin';

/** Admin is intentionally URL-only — no navbar link. */
const ADMIN_PATH = '/admin';

const MEMBER_TABS: TabType[] = ['dashboard', 'chat'];
const PUBLIC_TABS: TabType[] = ['landing', 'signin', 'signup', 'verify', 'forgot', 'reset'];

function isAdminPath(pathname: string = window.location.pathname): boolean {
  const normalised = pathname.replace(/\/+$/, '') || '/';
  return normalised === ADMIN_PATH || normalised.endsWith(ADMIN_PATH);
}

const MainApp: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Member tabs restore from localStorage.
  // Admin is NEVER restored from storage — only from the /admin URL.
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (isAdminPath()) return 'admin';
    const saved = localStorage.getItem('nimbus_active_tab') as TabType;
    if (saved && MEMBER_TABS.includes(saved)) return saved;
    if (saved && PUBLIC_TABS.includes(saved)) return saved;
    return 'landing';
  });

  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [resetEmail, setResetEmail] = useState<string>('');
  const [signInMessage, setSignInMessage] = useState<string | null>(null);
  const [chatQuery, setChatQuery] = useState<string | undefined>(undefined);

  /**
   * Keep the browser URL in sync with the active tab.
   * - Admin tab  →  /admin
   * - Any other  →  /  (clears the admin path so it cannot linger)
   */
  const syncUrl = useCallback((tab: TabType) => {
    const target = tab === 'admin' ? ADMIN_PATH : '/';
    const current = window.location.pathname.replace(/\/+$/, '') || '/';
    if (current !== target) {
      window.history.pushState({ tab }, '', target);
    }
  }, []);

  const handleNavigate = useCallback((tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'admin') {
      // Admin must only be reached via the /admin URL.
      // Do not persist admin in localStorage (no silent reopen on refresh).
      localStorage.removeItem('nimbus_active_tab');
      if (!isAdminPath()) {
        window.history.pushState({ tab: 'admin' }, '', ADMIN_PATH);
      }
    } else {
      localStorage.setItem('nimbus_active_tab', tab);
      // Leaving admin clears the path so refresh won't reopen admin.
      if (isAdminPath()) {
        window.history.pushState({ tab }, '', '/');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Browser back/forward + direct URL entry (user types /admin).
  useEffect(() => {
    const onPopState = () => {
      if (isAdminPath()) {
        setActiveTab('admin');
        localStorage.removeItem('nimbus_active_tab');
      } else {
        const saved = localStorage.getItem('nimbus_active_tab') as TabType;
        if (saved && MEMBER_TABS.includes(saved) && isAuthenticated) {
          setActiveTab(saved);
        } else if (!isAuthenticated) {
          setActiveTab('landing');
        } else {
          setActiveTab('dashboard');
        }
      }
    };

    if (isAdminPath()) {
      setActiveTab('admin');
      localStorage.removeItem('nimbus_active_tab');
    }

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isAuthenticated]);

  // Auth-driven redirects (same behaviour as before, plus admin path rules).
  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      if (isAdminPath()) {
        setActiveTab('admin');
        return;
      }
      const saved = localStorage.getItem('nimbus_active_tab') as TabType;
      if (saved === 'chat' || saved === 'dashboard') {
        setActiveTab(saved);
      } else if (
        activeTab === 'landing' ||
        activeTab === 'signin' ||
        activeTab === 'signup' ||
        activeTab === 'admin'
      ) {
        // If they were on admin but URL is no longer /admin, go home.
        setActiveTab('dashboard');
        localStorage.setItem('nimbus_active_tab', 'dashboard');
        syncUrl('dashboard');
      }
    } else {
      // Unauthenticated users cannot stay on protected member pages.
      if (activeTab === 'dashboard' || activeTab === 'chat') {
        setActiveTab('landing');
        localStorage.removeItem('nimbus_active_tab');
        syncUrl('landing');
      }
      // /admin while logged out: keep tab=admin so ProtectedRoute can
      // bounce them to sign-in; after login the URL still says /admin.
    }
  }, [isAuthenticated, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenChatWithQuery = (query: string) => {
    setChatQuery(query);
    handleNavigate('chat');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#ff9900]/30 selection:text-[#ff9900]">
      <AppBackground />

      <Navbar activeTab={activeTab} onNavigate={handleNavigate} />

      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage onNavigate={(target) => handleNavigate(target)} />
        )}

        {activeTab === 'signin' && (
          <SignInPage
            initialMessage={signInMessage}
            onNavigate={(target) => {
              if (target === 'verify') {
                handleNavigate('verify');
              } else {
                handleNavigate(target);
              }
            }}
          />
        )}

        {activeTab === 'signup' && (
          <SignUpPage
            onNavigate={(target) => handleNavigate(target)}
            onRegisteredEmail={(email) => setRegisteredEmail(email)}
          />
        )}

        {activeTab === 'verify' && (
          <VerifyEmailPage
            email={registeredEmail || 'member@university.edu'}
            onNavigateToSignIn={(msg) => {
              if (msg) setSignInMessage(msg);
              handleNavigate('signin');
            }}
          />
        )}

        {activeTab === 'forgot' && (
          <ForgotPasswordPage
            onNavigateToReset={(email) => {
              setResetEmail(email);
              handleNavigate('reset');
            }}
            onNavigateToSignIn={() => handleNavigate('signin')}
          />
        )}

        {activeTab === 'reset' && (
          <ResetPasswordPage
            email={resetEmail || 'member@university.edu'}
            onNavigateToSignIn={(msg) => {
              if (msg) setSignInMessage(msg);
              handleNavigate('signin');
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <ProtectedRoute onRedirectToSignIn={() => handleNavigate('signin')}>
            <DashboardPage
              onNavigateToChat={() => handleNavigate('chat')}
              onOpenChatWithQuery={handleOpenChatWithQuery}
            />
          </ProtectedRoute>
        )}

        {activeTab === 'chat' && (
          <ProtectedRoute onRedirectToSignIn={() => handleNavigate('signin')}>
            <ChatPage
              initialQuery={chatQuery}
              onClearInitialQuery={() => setChatQuery(undefined)}
              onSessionExpired={() => {
                setSignInMessage('Your member session expired. Please sign in again.');
                handleNavigate('signin');
              }}
            />
          </ProtectedRoute>
        )}

        {activeTab === 'admin' && (
          <ProtectedRoute onRedirectToSignIn={() => handleNavigate('signin')}>
            <AdminPage
              onNavigateToChat={() => handleNavigate('chat')}
              onNavigateToDashboard={() => handleNavigate('dashboard')}
            />
          </ProtectedRoute>
        )}
      </main>

      <PWAInstallPrompt />

      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
