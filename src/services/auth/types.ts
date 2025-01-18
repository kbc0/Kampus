export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export enum AuthErrorCode {
  USER_EXISTS = 'USER_EXISTS',
  PROFILE_CREATE_FAILED = 'PROFILE_CREATE_FAILED',
  NO_USER_DATA = 'NO_USER_DATA',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  CONNECTION_ERROR = 'CONNECTION_ERROR'
}