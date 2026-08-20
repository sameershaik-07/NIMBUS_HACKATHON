import { cognitoAuthService } from '../services/cognito';

export const ADMIN_GROUP = 'ADMIN';

/**
 * Returns true when the current authenticated member belongs to the
 * ADMIN Cognito group. The backend enforces this authorisation too;
 * this only gates which UI is shown.
 */
export function isCurrentUserAdmin(): boolean {
  try {
    const groups = cognitoAuthService.getUserGroups();
    return groups.includes(ADMIN_GROUP);
  } catch {
    return false;
  }
}
