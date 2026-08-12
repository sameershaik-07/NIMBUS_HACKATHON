import React from 'react';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onRedirectToSignIn: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, onRedirectToSignIn }) => {
  const { isAuthenticated, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      onRedirectToSignIn();
    }
  }, [isAuthenticated, loading, onRedirectToSignIn]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-[#ff9900]/20 animate-ping" />
          <div className="w-12 h-12 rounded-full border-4 border-t-[#ff9900] border-r-[#ff9900]/40 border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-slate-400 text-sm font-medium animate-pulse">
          Verifying Member Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
