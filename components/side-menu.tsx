"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Fragment, useMemo } from "react"
import {
  BadgeCheck,
  BookOpen,
  Headset,
  Home,
  Info,
  LayoutDashboard,
  Link2,
  LogIn,
  Mail,
  Monitor,
  ScrollText,
  Share2,
  Star,
  Users,
  User,
  X,
  Youtube,
  Facebook,
  Instagram,
  Music,
} from "lucide-react"

import type { Profile } from "@/lib/auth-client"

interface SideMenuProps {
  open: boolean
  onClose: () => void
  profile: Pick<Profile, "fullName" | "role" | "avatarUrl"> | null
}

interface MenuItem {
  label: string
  href?: string
  icon: React.ReactNode
  dividerBefore?: boolean
  target?: React.HTMLAttributeAnchorTarget
  rel?: string
  adminOnly?: boolean
}

const dividerId = "divider"

export function SideMenu({ open, onClose, profile }: SideMenuProps) {
  const router = useRouter()
  const pathname = usePathname()

  const isAdmin = useMemo(() => {
    return profile?.role === "admin" || profile?.role === "super_admin"
  }, [profile?.role])

  const items: MenuItem[] = useMemo(() => {
    const baseItems: MenuItem[] = [
      {
        label: "الصفحة الرئيسية",
        href: "/",
        icon: <Home size={20} />,
      },
      {
        label: "الملف الشخصي",
        href: "/account",
        icon: <User size={20} />,
      },
      {
        label: dividerId,
        icon: null,
        dividerBefore: true,
      },
      {
        label: "انشر التطبيق",
        href: "/share",
        icon: <Share2 size={20} />,
      },
      {
        label: "من نحن",
        href: "/about",
        icon: <Info size={20} />,
      },
      {
        label: "انضم لفريق المعبّرين",
        href: "/join",
        icon: <Users size={20} />,
      },
      {
        label: "كيفية طلب تفسير رؤيا",
        href: "/guide",
        icon: <BookOpen size={20} />,
      },
      {
        label: "الشروط والأحكام",
        href: "/terms",
        icon: <ScrollText size={20} />,
      },
      {
        label: "البريد الإلكتروني",
        href: "mailto:support@ahlami.app",
        icon: <Mail size={20} />,
      },
      {
        label: "خدمة العملاء",
        href: "/support",
        icon: <Headset size={20} />,
      },
      {
        label: "قيّم التطبيق",
        href: "/rate",
        icon: <Star size={20} />,
      },
      {
        label: "شاشات الافتتاح",
        href: "/screens",
        icon: <Monitor size={20} />,
      },
      {
        label: "صفحتنا على معروف",
        href: "https://maroof.sa/",
        icon: <BadgeCheck size={20} />,
      },
    ]

    if (isAdmin) {
      const adminHref = profile?.role === "super_admin" ? "/admin" : "/admin/dreams"
      baseItems.splice(2, 0, {
        label: "لوحة تحكم الإدارة",
        href: adminHref,
        icon: <LayoutDashboard size={20} />,
        adminOnly: true,
      })

      // Add super admin specific items
      if (profile?.role === 'super_admin') {
        baseItems.splice(3, 0, {
          label: 'إدارة المحتوى',
          href: '/admin/content',
          icon: <ScrollText size={20} />,
          adminOnly: true,
        })
      }
    }

    return baseItems
  }, [isAdmin, profile?.role])

  const handleNavigate = (href?: string) => {
    if (!href) return
    if (href.startsWith("http") || href.startsWith("mailto:")) {
      return
    }

    if (pathname === href) {
      onClose()
      return
    }

    router.push(href)
    onClose()
  }

  return (
    <div
      className={`fixed inset-0 z-[200] transition-all duration-300 ${open ? "visible bg-slate-900/50" : "invisible bg-transparent"
        }`}
      onClick={onClose}
    >
      <aside
        className={`absolute inset-y-0 right-0 flex w-[280px] max-w-[85%] transform flex-col bg-gradient-to-b from-[#1894DA] via-[#2a1361] to-[#F2D254] text-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"
          }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              {profile?.fullName ? profile.fullName.charAt(0) : "أ"}
            </div>
            <div className="text-right">
              <p className="text-xs text-white/60">مرحبا بك في احلامي</p>
              <p className="text-sm font-semibold">
                {profile?.fullName ? profile.fullName : "ضيف"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="إغلاق القائمة"
          >
            <X size={18} />
          </button>
        </div>

        {!profile ? (
          <div className="mx-5 mt-5 rounded-2xl border border-white/15 bg-white/10 p-4 text-right">
            <p className="text-xs text-white/60">الرجاء تسجيل الدخول للاستفادة من جميع خدماتنا.</p>
            <button
              onClick={() => {
                router.push("/auth/login")
                onClose()
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-[#2f166f] transition hover:bg-amber-200"
            >
              <LogIn size={18} />
              <span>تسجيل الدخول</span>
            </button>
          </div>
        ) : null

        }

        <nav className="mt-6 flex-1 overflow-y-auto px-2 pb-8">
          <ul className="space-y-1 text-sm">
            {items.map((item) => {
              if (item.label === dividerId) {
                return (
                  <li key="divider" className="my-2 border-t border-white/10" />
                )
              }

              if (item.adminOnly && !isAdmin) {
                return null
              }

              return (
                <Fragment key={item.label}>
                  <li>
                    {item.href ? (
                      item.href.startsWith("http") || item.href.startsWith("mailto:") ? (
                        <Link
                          href={item.href}
                          target={item.target}
                          rel={item.rel ?? (item.href.startsWith("http") ? "noopener noreferrer" : undefined)}
                          onClick={onClose}
                          className="flex items-center justify-between rounded-2xl px-4 py-3 text-right transition hover:bg-white/10"
                        >
                          <span className="flex items-center gap-3 text-white">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </span>
                          <Link2 size={16} className="text-white/40" />
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleNavigate(item.href)}
                          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-right text-white transition hover:bg-white/10"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </button>
                      )
                    ) : (
                      <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white/60">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                    )}
                  </li>
                </Fragment>
              )
            })}
          </ul>
        </nav>

        <div className="mt-auto border-t border-white/10 px-5 py-6">
          <p className="mb-3 text-sm font-semibold text-white">تابعنا</p>
          <div className="flex items-center gap-3">
            <Link
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <Youtube size={20} />
            </Link>
            <Link
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <Facebook size={20} />
            </Link>
            <Link
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <Instagram size={20} />
            </Link>
            <Link
              href="https://www.tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <Music size={20} />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  )
}

