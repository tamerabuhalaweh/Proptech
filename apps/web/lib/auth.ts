// Auth utilities for the frontend
// Using custom JWT auth (not NextAuth) since backend provides JWT tokens

export interface User {
  id: string;
  name: string;
  nameAr?: string;
  email: string;
  role: "admin" | "manager" | "agent" | "viewer";
  avatar?: string;
  tenantId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
}
