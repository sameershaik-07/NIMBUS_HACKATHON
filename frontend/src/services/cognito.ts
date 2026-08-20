import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession
} from 'amazon-cognito-identity-js';
import { ENV } from '../config/env';
import { AuthTokens, UserProfile } from '../types/auth';

const poolData = {
  UserPoolId: ENV.COGNITO_USER_POOL_ID,
  ClientId: ENV.COGNITO_CLIENT_ID
};

export const userPool = new CognitoUserPool(poolData);

const STORAGE_KEY = 'nimbus_club_auth_tokens';
const USER_KEY = 'nimbus_club_auth_user';

export const cognitoAuthService = {
  /**
   * Register a new member in Cognito
   */
  signUp(email: string, password: string): Promise<{ userConfirmed: boolean; userSub?: string }> {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({ Name: 'email', Value: email.trim().toLowerCase() })
      ];

      userPool.signUp(email.trim().toLowerCase(), password, attributeList, [], (err, result) => {
        if (err) {
          return reject(formatCognitoError(err));
        }
        if (!result) {
          return reject(new Error('Sign up failed with empty response from Cognito.'));
        }
        resolve({
          userConfirmed: result.userConfirmed,
          userSub: result.userSub
        });
      });
    });
  },

  /**
   * Confirm email verification code
   */
  confirmSignUp(email: string, code: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email.trim().toLowerCase(),
        Pool: userPool
      });

      cognitoUser.confirmRegistration(code.trim(), true, (err, result) => {
        if (err) {
          return reject(formatCognitoError(err));
        }
        resolve(result === 'SUCCESS');
      });
    });
  },

  /**
   * Resend signup verification code
   */
  resendConfirmationCode(email: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email.trim().toLowerCase(),
        Pool: userPool
      });

      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          return reject(formatCognitoError(err));
        }
        resolve(true);
      });
    });
  },

  /**
   * Authenticate email/password directly within app via Cognito SRP
   */
  signIn(email: string, password: string): Promise<{ user: UserProfile; tokens: AuthTokens }> {
    return new Promise((resolve, reject) => {
      const formattedEmail = email.trim().toLowerCase();
      const authenticationData = {
        Username: formattedEmail,
        Password: password
      };

      const authenticationDetails = new AuthenticationDetails(authenticationData);
      const cognitoUser = new CognitoUser({
        Username: formattedEmail,
        Pool: userPool
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session: CognitoUserSession) => {
          const idToken = session.getIdToken().getJwtToken();
          const accessToken = session.getAccessToken().getJwtToken();
          const refreshToken = session.getRefreshToken().getToken();
          const expiresAt = session.getIdToken().getExpiration() * 1000;

          const user: UserProfile = {
            email: formattedEmail,
            sub: session.getIdToken().payload.sub || '',
            emailVerified: session.getIdToken().payload.email_verified || true
          };

          const tokens: AuthTokens = {
            idToken,
            accessToken,
            refreshToken,
            expiresAt
          };

          // Store session locally
          saveLocalSession(user, tokens);
          resolve({ user, tokens });
        },
        onFailure: (err) => {
          reject(formatCognitoError(err));
        },
        newPasswordRequired: () => {
          reject(new Error('Password change required by Cognito administrator.'));
        }
      });
    });
  },

  /**
   * Request password reset code
   */
  forgotPassword(email: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email.trim().toLowerCase(),
        Pool: userPool
      });

      cognitoUser.forgotPassword({
        onSuccess: () => {
          resolve(true);
        },
        onFailure: (err) => {
          reject(formatCognitoError(err));
        },
        inputVerificationCode: () => {
          resolve(true);
        }
      });
    });
  },

  /**
   * Confirm password reset with 6-digit code and new password
   */
  confirmForgotPassword(email: string, code: string, newPassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email.trim().toLowerCase(),
        Pool: userPool
      });

      cognitoUser.confirmPassword(code.trim(), newPassword, {
        onSuccess: () => {
          resolve(true);
        },
        onFailure: (err) => {
          reject(formatCognitoError(err));
        }
      });
    });
  },

  /**
   * Sign out current user
   */
  signOut(): void {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
    }
    clearLocalSession();
  },

  /**
   * Restore stored session on refresh
   */
  getStoredSession(): { user: UserProfile; tokens: AuthTokens } | null {
    try {
      const tokensRaw = localStorage.getItem(STORAGE_KEY);
      const userRaw = localStorage.getItem(USER_KEY);

      if (!tokensRaw || !userRaw) return null;

      const tokens: AuthTokens = JSON.parse(tokensRaw);
      const user: UserProfile = JSON.parse(userRaw);

      // Check token expiration with 60 second buffer
      if (Date.now() >= tokens.expiresAt - 60000) {
        clearLocalSession();
        return null;
      }

      return { user, tokens };
    } catch {
      clearLocalSession();
      return null;
    }
  },

  /**
   * Decode the stored ID token payload to read Cognito group
   * membership (e.g. "ADMIN"). Used to gate admin UI controls and
   * routing in the frontend (the backend enforces this too).
   */
  getUserGroups(): string[] {
    try {
      const tokensRaw = localStorage.getItem(STORAGE_KEY);
      if (!tokensRaw) return [];

      const tokens: AuthTokens = JSON.parse(tokensRaw);
      const idToken = tokens.idToken;
      if (!idToken) return [];

      const payloadPart = idToken.split('.')[1];
      if (!payloadPart) return [];

      // JWT payloads are base64url-encoded.
      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = decodeURIComponent(
        Array.prototype.map
          .call(atob(normalized), (c: string) =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          )
          .join('')
      );

      const payload = JSON.parse(decoded);
      const groups = payload['cognito:groups'];

      if (Array.isArray(groups)) {
        return groups.map((g) => String(g));
      }
      if (typeof groups === 'string') {
        return [groups];
      }
      return [];
    } catch {
      return [];
    }
  }
};

function saveLocalSession(user: UserProfile, tokens: AuthTokens) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch (err) {
    console.error('Failed to save session locally:', err);
  }
}

function clearLocalSession() {
  try {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear session:', err);
  }
}

function formatCognitoError(err: any): Error {
  if (!err) return new Error('An unexpected authentication error occurred.');

  const code = err.code || err.name;
  let message = err.message || 'Authentication error.';

  switch (code) {
    case 'UserNotFoundException':
      message = 'No account found with this email address. Please check or create an account.';
      break;
    case 'NotAuthorizedException':
      message = 'Incorrect email or password. Please try again.';
      break;
    case 'UserNotConfirmedException':
      message = 'Your email is not verified yet. Please enter the verification code sent to your inbox.';
      break;
    case 'UsernameExistsException':
      message = 'An account with this email already exists. Please sign in or reset your password.';
      break;
    case 'InvalidPasswordException':
      message = 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.';
      break;
    case 'CodeMismatchException':
      message = 'Invalid verification code. Please check your email and try again.';
      break;
    case 'ExpiredCodeException':
      message = 'The verification code has expired. Please request a new code.';
      break;
    case 'LimitExceededException':
      message = 'Attempt limit exceeded. Please wait a few minutes before trying again.';
      break;
    case 'TooManyRequestsException':
      message = 'Too many requests. Please wait a moment and try again.';
      break;
    default:
      if (message.includes('USER_PASSWORD_AUTH')) {
        message = 'Invalid authentication setup. System will use secure SRP authentication.';
      }
      break;
  }

  const error = new Error(message);
  (error as any).code = code;
  return error;
}
