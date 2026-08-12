import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, UserProfile, AuthTokens } from '../types/auth';
import { cognitoAuthService } from '../services/cognito';

interface AuthContextType extends AuthState {
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<{ userConfirmed: boolean }>;
  confirmSignUp: (email: string, code: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  confirmForgotPassword: (email: string, code: string, newPass: string) => Promise<boolean>;
  signOut: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    idToken: null,
    accessToken: null,
    refreshToken: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Restore session on app startup
    const stored = cognitoAuthService.getStoredSession();
    if (stored) {
      setAuthState({
        isAuthenticated: true,
        user: stored.user,
        idToken: stored.tokens.idToken,
        accessToken: stored.tokens.accessToken,
        refreshToken: stored.tokens.refreshToken || null,
        loading: false,
        error: null,
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const signIn = async (email: string, pass: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { user, tokens } = await cognitoAuthService.signIn(email, pass);
      setAuthState({
        isAuthenticated: true,
        user,
        idToken: tokens.idToken,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || null,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to sign in',
      }));
      throw err;
    }
  };

  const signUp = async (email: string, pass: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await cognitoAuthService.signUp(email, pass);
      setAuthState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (err: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to create account',
      }));
      throw err;
    }
  };

  const confirmSignUp = async (email: string, code: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await cognitoAuthService.confirmSignUp(email, code);
      setAuthState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (err: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Invalid verification code',
      }));
      throw err;
    }
  };

  const forgotPassword = async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await cognitoAuthService.forgotPassword(email);
      setAuthState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (err: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to send password reset code',
      }));
      throw err;
    }
  };

  const confirmForgotPassword = async (email: string, code: string, newPass: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await cognitoAuthService.confirmForgotPassword(email, code, newPass);
      setAuthState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (err: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to reset password',
      }));
      throw err;
    }
  };

  const signOut = () => {
    cognitoAuthService.signOut();
    setAuthState({
      isAuthenticated: false,
      user: null,
      idToken: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      error: null,
    });
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn,
        signUp,
        confirmSignUp,
        forgotPassword,
        confirmForgotPassword,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
