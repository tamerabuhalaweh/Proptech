// ============================================================
// User Types
// ============================================================

import { UserRole } from './enums';

export interface IUser {
  id: string;
  tenantId: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** User with password hash — internal only, never expose */
export interface IUserInternal extends IUser {
  passwordHash: string;
}
