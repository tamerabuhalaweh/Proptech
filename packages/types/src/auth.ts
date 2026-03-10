// ============================================================
// Auth Types
// ============================================================

import { UserRole } from './enums';

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
  displayName: string;
  tenantId: string;
  role?: UserRole;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: UserRole;
    tenantId: string;
  };
  tokens: IAuthTokens;
}

export interface IJwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  tenantId: string;
  iat?: number;
  exp?: number;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}
