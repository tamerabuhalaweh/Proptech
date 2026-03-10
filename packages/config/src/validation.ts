// ============================================================
// Validation helpers
// ============================================================

import { SLUG_MIN_LENGTH, SLUG_MAX_LENGTH, PASSWORD_MIN_LENGTH } from './constants';

/** Validates a slug format: lowercase alphanumeric + hyphens */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return (
    slug.length >= SLUG_MIN_LENGTH &&
    slug.length <= SLUG_MAX_LENGTH &&
    slugRegex.test(slug)
  );
}

/** Generates a slug from a string */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, SLUG_MAX_LENGTH);
}

/** Basic password strength check */
export function isStrongPassword(password: string): boolean {
  if (password.length < PASSWORD_MIN_LENGTH) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  return hasUpperCase && hasLowerCase && hasDigit;
}
