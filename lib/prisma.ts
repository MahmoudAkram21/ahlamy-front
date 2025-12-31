/**
 * Prisma Client Singleton
 * 
 * This module provides a singleton instance of PrismaClient to prevent
 * multiple instances in development (hot reload) and ensure optimal
 * connection pooling in production.
 * 
 * Usage:
 *   import { prisma } from '@/lib/prisma'
 *   const users = await prisma.user.findMany()
 */

import { PrismaClient } from '@prisma/client'

// Extend the global namespace to include prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Create a new PrismaClient instance with logging configuration
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
})

// In development, save the prisma instance to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Gracefully disconnect Prisma Client on application shutdown
 */
export async function disconnectPrisma() {
  await prisma.$disconnect()
}

// Handle cleanup on process termination
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await disconnectPrisma()
  })
}

