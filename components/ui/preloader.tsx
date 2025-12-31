/**
 * Modern Preloader Component
 * 
 * A beautiful, animated loading component with multiple variants
 * 
 * Usage:
 * <Preloader variant="spinner" size="md" message="جاري التحميل..." />
 */

"use client"

import { Moon, Star, Sparkles } from "lucide-react"

interface PreloaderProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'moon' | 'stars'
  size?: 'sm' | 'md' | 'lg'
  message?: string
  fullScreen?: boolean
}

export function Preloader({ 
  variant = 'spinner', 
  size = 'md', 
  message,
  fullScreen = true 
}: PreloaderProps) {
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }

  const containerClass = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-amber-50'
    : 'flex items-center justify-center py-12'

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} rounded-full border-4 border-sky-100 border-t-sky-500 border-r-amber-400 animate-spin`} />
          </div>
        )

      case 'dots':
        return (
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )

      case 'pulse':
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-sky-500 to-amber-400 animate-pulse`} />
            <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-gradient-to-r from-sky-500 to-amber-400 animate-ping opacity-75`} />
          </div>
        )

      case 'moon':
        return (
          <div className="relative">
            <Moon 
              size={size === 'sm' ? 24 : size === 'md' ? 40 : 56} 
              className="text-sky-500 animate-pulse"
            />
            <div className="absolute -top-2 -right-2">
              <Star size={16} className="text-amber-400 animate-ping" />
            </div>
          </div>
        )

      case 'stars':
        return (
          <div className="relative w-20 h-20">
            <Sparkles 
              size={40} 
              className="absolute inset-0 m-auto text-sky-500 animate-pulse"
            />
            <Star 
              size={16} 
              className="absolute top-0 right-0 text-amber-400 animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <Star 
              size={16} 
              className="absolute bottom-0 left-0 text-sky-400 animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <Star 
              size={16} 
              className="absolute top-0 left-0 text-sky-600 animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* Loader */}
        <div className="flex justify-center mb-4">
          {renderLoader()}
        </div>

        {/* Message */}
        {message && (
          <p className="text-gray-600 text-sm md:text-base font-medium animate-pulse">
            {message}
          </p>
        )}

        {/* Brand */}
        {fullScreen && (
          <div className="mt-8 opacity-50">
            <p className="text-xs text-gray-400">احلامي</p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Inline Loader - For use inside components
 */
export function InlineLoader({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-3',
    lg: 'w-8 h-8 border-4'
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full border-sky-100 border-t-sky-500 animate-spin inline-block`} />
  )
}

/**
 * Page Loader - Beautiful full page loader
 */
export function PageLoader({ message = "جاري التحميل..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-amber-50">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-sky-100 animate-ping opacity-75" />
          
          {/* Middle ring */}
          <div className="absolute inset-2 rounded-full border-4 border-sky-400 animate-spin" 
               style={{ animationDuration: '2s' }} 
          />
          
          {/* Inner icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={32} className="text-sky-500 animate-pulse" />
          </div>
        </div>

        {/* Brand */}
        <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-500 via-sky-400 to-amber-400 bg-clip-text text-transparent mb-2">
          احلامي
        </h2>

        {/* Message */}
        <p className="text-slate-600 text-sm animate-pulse">
          {message}
        </p>

        {/* Progress dots */}
        <div className="flex gap-2 justify-center mt-4">
          <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}








