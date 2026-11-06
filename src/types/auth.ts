export type Role = 'admin' | 'user';
export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  role: Role;
  createdAt: Date | null;
  lastLoginAt: Date | null;
  isTest?: boolean;
}

export type AuthErrorCode = 'unauthorized-domain' | 'unverified-email' | 'cancelled' | 'network' | 'generic';

export class AuthFlowError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
