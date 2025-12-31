"use client"

import type React from "react"

import { Home, LayoutDashboard, Moon, Sparkles, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

export function BottomNavigation() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { href: "/", label: "الرئيسية", icon: <Home size={22} /> },
    { href: "/dreams", label: "رؤاي", icon: <Moon size={22} /> },
    { href: "/dashboard", label: "لوحة", icon: <LayoutDashboard size={22} /> },
    { href: "/good-news", label: "إشراقات", icon: <Sparkles size={22} /> },
    { href: "/account", label: "حسابي", icon: <User size={22} /> },
  ]

  return (
    <nav className="safe-area-inset-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-sky-100 bg-white/95 backdrop-blur-lg shadow-[0_-8px_30px_rgba(14,116,144,0.08)]">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-500 via-sky-400 to-amber-300" />
      
      <div className="flex justify-around items-center h-16 sm:h-18 max-w-screen-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex h-full w-full flex-col items-center justify-center gap-1 transition-all duration-200 ${
                isActive ? "text-sky-600" : "text-slate-400 hover:text-sky-500"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 -mx-3 rounded-t-3xl bg-sky-50" />
              )}

              <div
                className={`relative z-10 transition-transform ${
                  isActive ? "scale-110" : "group-hover:scale-105"
                }`}
              >
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow-lg animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`relative z-10 text-[10px] font-medium ${
                  isActive ? "text-sky-700" : ""
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
