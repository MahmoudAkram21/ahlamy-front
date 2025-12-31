/**
 * Authentication Utilities
 * 
 * This module provides authentication helpers including:
 * - Password hashing and verification using bcrypt
 * - JWT token generation and verification
 * - User session management
 * 
 * Usage:
 *   import { hashPassword, verifyPassword, generateToken, verifyToken } from '@/lib/auth'
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-change-this'
const JWT_EXPIRES_IN = '7d' // Token expires in 7 days

/**
 * Interface for JWT payload
 */
export interface JWTPayload {
  userId: string
  email: string
  role: string
}

/**
 * Hash a password using bcrypt
 * 
 * @param password - Plain text password to hash
 * @returns Promise<string> - Hashed password
 * 
 * @example
 * const hashed = await hashPassword('myPassword123')
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against its hash
 * 
 * @param password - Plain text password
 * @param hash - Hashed password to compare against
 * @returns Promise<boolean> - True if password matches hash
 * 
 * @example
 * const isValid = await verifyPassword('myPassword123', hashedPassword)
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate a JWT token for a user
 * 
 * @param payload - User information to encode in the token
 * @returns string - Signed JWT token
 * 
 * @example
 * const token = generateToken({ userId: '123', email: 'user@example.com', role: 'dreamer' })
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

/**
 * Verify and decode a JWT token
 * 
 * @param token - JWT token to verify
 * @returns JWTPayload | null - Decoded payload if valid, null if invalid
 * 
 * @example
 * const payload = verifyToken(token)
 * if (payload) {
 *   console.log('User ID:', payload.userId)
 * }
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('[Auth] Token verification failed:', error)
    return null
  }
}

/**
 * Generate a secure random token for password reset, email verification, etc.
 * 
 * @param length - Length of the token (default: 32)
 * @returns string - Random token
 */
export function generateSecureToken(length: number = 32): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < length; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return token
}

