/**
 * Client-Side Authentication Utilities
 *
 * This module provides client-side authentication helpers for
 * making authenticated API requests and managing user sessions.
 *
 * Usage:
 *   import { login, logout, register, getCurrentUser } from '@/lib/auth-client'
 */

const API_BASE_URL = `${
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://b-ahlamy.developteam.site/api"
}`;

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

/**
 * User interface representing the current authenticated user
 */
export interface User {
  id: string;
  email: string;
  role: string;
}

/**
 * Profile interface with additional user information
 */
export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  avatarUrl: string | null;
  bio: string | null;
  isAvailable: boolean;
  totalInterpretations: number;
  rating: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  currentPlan?: {
    id: string;
    name: string;
    price: string;
    durationDays: number;
    currency: string;
    letterQuota: number | null;
    audioMinutesQuota: number | null;
    scope: string;
  } | null;
  subscription?: {
    id: string;
    planId: string;
    startedAt: string;
    expiresAt: string | null;
    lettersUsed: number;
    audioMinutesUsed: number;
    plan: {
      id: string;
      name: string;
      price: string;
      currency: string;
      letterQuota: number | null;
      audioMinutesQuota: number | null;
      durationDays: number;
      scope: string;
    } | null;
  } | null;
}

/**
 * Login a user with email and password
 */
export async function login(
  email: string,
  password: string
): Promise<{ user: User; profile: Profile } | null> {
  try {
    // Use Next.js API route instead of direct backend call to handle cookies properly
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Auth] Login failed:", error);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return null;
  }
}

/**
 * Register a new user
 */
export async function register(
  email: string,
  password: string,
  fullName: string,
  role: "dreamer" | "interpreter" = "dreamer"
): Promise<{ user: User; profile: Profile } | null> {
  try {
    // Use Next.js API route instead of direct backend call to handle cookies properly
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password, fullName, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Auth] Registration failed:", error);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Auth] Registration error:", error);
    return null;
  }
}

/**
 * Logout the current user
 */
export async function logout(): Promise<boolean> {
  try {
    const response = await fetch(buildUrl("/auth/logout"), {
      method: "POST",
      credentials: "include",
    });

    return response.ok;
  } catch (error) {
    console.error("[Auth] Logout error:", error);
    return false;
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<{
  user: User;
  profile: Profile;
} | null> {
  try {
    const response = await fetch(buildUrl("/auth/me"), {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Auth] Get current user error:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}
