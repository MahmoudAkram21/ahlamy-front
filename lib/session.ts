/**
 * Session Management
 * 
 * This module provides session management utilities for handling user
 * authentication sessions using cookies and JWT tokens.
 * 
 * Usage:
 *   import { getSession, setSession, clearSession } from '@/lib/session'
 */

import { cookies } from 'next/headers'
import { verifyToken, type JWTPayload } from './auth'

// Session cookie configuration
const SESSION_COOKIE_NAME = 'auth_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

/**
 * Get the current user session from cookies
 * 
 * @returns Promise<JWTPayload | null> - User session if authenticated, null otherwise
 * 
 * @example
 * const session = await getSession()
 * if (session) {
 *   console.log('User ID:', session.userId)
 * } else {
 *   console.log('Not authenticated')
 * }
 */
export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  return verifyToken(token)
}

/**
 * Set a user session by storing the JWT token in a cookie
 * 
 * @param token - JWT token to store
 * @returns Promise<void>
 * 
 * @example
 * await setSession(jwtToken)
 */
export async function setSession(token: string): Promise<void> {
  const cookieStore = await cookies()
  
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

/**
 * Clear the current user session by removing the auth cookie
 * 
 * @returns Promise<void>
 * 
 * @example
 * await clearSession()
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Get session from request cookies (for middleware and API routes)
 * 
 * @param cookieValue - Cookie value from request
 * @returns JWTPayload | null - User session if valid, null otherwise
 */
export function getSessionFromCookie(cookieValue: string | undefined): JWTPayload | null {
  if (!cookieValue) {
    return null
  }

  return verifyToken(cookieValue)
}

