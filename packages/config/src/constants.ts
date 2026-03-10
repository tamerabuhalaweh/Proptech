// ============================================================
// Platform Constants
// ============================================================

export const APP_NAME = 'Proptech';
export const API_PREFIX = 'api';
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const JWT_ACCESS_EXPIRY = '15m';
export const JWT_REFRESH_EXPIRY = '7d';

export const BCRYPT_ROUNDS = 12;

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 50;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const DEFAULT_COUNTRY = 'SA';

export const SUPPORTED_COUNTRIES = ['SA', 'AE', 'BH', 'KW', 'OM', 'QA', 'EG', 'JO'] as const;
export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];
