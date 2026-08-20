export interface UserProfile {
  email: string;
  sub?: string;
  emailVerified?: boolean;
  groups?: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  idToken: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}
