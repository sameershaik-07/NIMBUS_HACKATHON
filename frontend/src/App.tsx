import React, { useState, useEffect } from 'react';
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

type TabType = 'landing' | 'signin' | 'signup' | 'verify' | 'forgot' | 'reset' | 'dashboard' | 'chat';

const MainApp: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('landing');
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [resetEmail, setResetEmail] = useState<string>('');
  const [signInMessage, setSignInMessage] = useState<string | null>(null);
  const [chatQuery, setChatQuery] = useState<string | undefined>(undefined);

  // Sync default tab when auth changes
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && (activeTab === 'landing' || activeTab === 'signin' || activeTab === 'signup')) {
        setActiveTab('dashboard');
      } else if (!isAuthenticated && (activeTab === 'dashboard' || activeTab === 'chat')) {
        setActiveTab('landing');
      }
    }
  }, [isAuthenticated, loading]);

  const handleNavigate = (tab: TabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenChatWithQuery = (query: string) => {
    setChatQuery(query);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#ff9900]/30 selection:text-[#ff9900]">
      <AppBackground />

      <Navbar activeTab={activeTab} onNavigate={handleNavigate} />

      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onNavigate={(target) => handleNavigate(target)}
          />
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
