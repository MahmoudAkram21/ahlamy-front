"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  Heart,
  Menu,
  Plus,
  Quote,
  RefreshCcw,
  Star,
  X,
} from "lucide-react"

import { BottomNavigation } from "@/components/bottom-navigation"
import { Card } from "@/components/ui/card"
import { PageLoader } from "@/components/ui/preloader"
import { getCurrentUser, type Profile } from "@/lib/api-client"
import { SideMenu } from "@/components/side-menu"
import { NotificationsDropdown } from "@/components/notifications-dropdown"

interface QuickLink {
  title: string
  icon: string
  href: string
  accent: string
}

interface Testimonial {
  id: number
  name: string
  quote: string
  rating: number
}

interface CommunityDream {
  id: number
  date: string
  preview: string
}

const quickLinks: QuickLink[] = [
  { title: "القرآن الكريم", icon: "📖", href: "/quran", accent: "from-sky-400 to-sky-200" },
  { title: "الأذكار والأدعية", icon: "🤲", href: "/adhkar", accent: "from-emerald-400 to-emerald-200" },
  { title: "القبلة", icon: "🧭", href: "/qibla", accent: "from-sky-500 to-sky-300" },
  { title: "الرقية الشرعية", icon: "🛡️", href: "/ruqya", accent: "from-teal-400 to-teal-200" },
]

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "مريم.س",
    quote: "جزاكم الله خيرا على المنصة، التفسير كان دقيقًا ومطمئنًا جدًا.",
    rating: 5,
  },
  {
    id: 2,
    name: "عبدالله.م",
    quote: "سرعة الرد وجودة التفسير كانت رائعة، شكرا لفريق احلامي.",
    rating: 5,
  },
]

const communityDreams: CommunityDream[] = [
  {
    id: 1,
    date: "٢٣ أبريل ٢٠٢٤",
    preview:
      "السلام عليكم ورحمة الله وبركاته، رأيت أنني أقف بجوار الكعبة وأدعو لأهلي وأشعر براحة كبيرة...",
  },
  {
    id: 2,
    date: "١٥ فبراير ٢٠٢٤",
    preview: "حلمت أني بجوار ضريح الإمام وأردد دعاءً بصوت مسموع، وكان الجو مليئًا بالسكينة...",
  },
  {
    id: 3,
    date: "٢٩ يناير ٢٠٢٤",
    preview: "رأيت راية بيضاء ترتفع في بيتنا ومعها كلمات تبشر بالخير، ما تفسير ذلك؟",
  },
]

const stars = (count: number) =>
  Array.from({ length: count }).map((_, idx) => <Star key={idx} size={14} className="text-amber-400" fill="currentColor" />)

export default function HomePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [fabOpen, setFabOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setProfile(currentUser.profile)
        }
      } catch (error) {
        console.error("[Home] Error loading user:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  useEffect(() => {
    if (!fabOpen) return
    const handler = () => setFabOpen(false)
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [fabOpen])

  useEffect(() => {
    if (!notificationsOpen) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [notificationsOpen])


  if (loading) {
    return <PageLoader message="جاري تحميل الصفحة الرئيسية..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <header className="rounded-b-[2rem] bg-gradient-to-br from-sky-600 via-sky-500 to-amber-300 text-white shadow-xl">
        <div className="relative overflow-visible px-4 pt-8 pb-10">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-[2rem] opacity-20">
            <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 right-6 w-40 h-40 rounded-full bg-amber-200 blur-3xl" />
          </div>

          <div className="relative z-[320] flex items-center justify-between">
            <button
              className="p-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 transition hover:bg-white/25"
              onClick={() => setMenuOpen(true)}
              aria-label="القائمة الرئيسية"
            >
              <Menu size={22} />
            </button>

            <div className="text-center">
              <Image src="/ahlamy 3.png" alt="Cloud" width={150} height={160} />
            </div>

            <div className="relative">
            <button
              className="relative rounded-full border border-white/20 bg-white/15 p-2 backdrop-blur-sm transition hover:bg-white/25"
              onClick={() => setNotificationsOpen((prev) => !prev)}
              aria-label="الإشعارات"
            >
              <Bell size={22} />
              <span className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-amber-300 shadow animate-pulse" />
            </button>
            {notificationsOpen && <NotificationsDropdown onClose={() => setNotificationsOpen(false)} />}
          </div>

          </div>

          <div className="relative z-10 mt-6 rounded-3xl border border-white/25 bg-white/15 p-4 backdrop-blur-lg shadow-lg">
            <div className="flex items-center justify-between text-white/90">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} />
                <span className="text-sm font-semibold">الصلاة القادمة</span>
              </div>
              <button
                type="button"
                onClick={() => router.push("/prayer-times")}
                className="flex items-center gap-1 text-xs text-white/80 hover:underline"
                aria-label="تحديث مواقيت الصلاة"
              >
                <RefreshCcw size={14} />
                تحديث
              </button>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-sm text-white/80">السبت 17 جمادى الأول 1447</p>
                <h2 className="text-3xl font-bold">الفجر</h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/70">8 نوفمبر 2025</p>
                <p className="text-4xl font-extrabold tracking-wide">04:23</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-6 flex w-full max-w-3xl flex-col gap-6 px-4">
        <section className="rounded-3xl bg-white/80 p-4 shadow-lg backdrop-blur-sm">
          <div className="grid grid-cols-4 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="group flex flex-col items-center gap-2 rounded-2xl bg-white/90 p-3 text-center text-xs font-semibold text-slate-600 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${link.accent} text-2xl shadow-inner transition group-hover:scale-105`}
                >
                  {link.icon}
                </span>
                <span className="leading-tight">{link.title}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-r from-sky-500 via-sky-400 to-amber-300 p-1 shadow-xl">
          <div className="rounded-[1.7rem] bg-white/90 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">أرسل رؤياك الآن</h2>
                <p className="text-xs text-slate-500">نخبة من المفسرين بانتظارك لتفسير أدق التفاصيل.</p>
              </div>
              <Link
                href="/dreams/new"
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-amber-400 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
              >
                <span>ابدأ الآن</span>
                <ChevronLeft size={18} />
              </Link>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl bg-slate-100">
              <div className="relative h-36 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80"
                  alt="منظر المسجد النبوي"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 640px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">آراء المستخدمين</h2>
            <Link href="/testimonials" className="text-sm font-medium text-sky-600 hover:underline">
              المزيد
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.map((item) => (
              <Card key={item.id} className="rounded-2xl border border-sky-100 bg-white/90 p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400">{stars(item.rating)}</div>
                  <Quote size={18} className="text-sky-400" />
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.quote}</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Heart size={14} className="text-rose-400" />
                  <span>{item.name}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">من رؤى مجتمع احلامي</h2>
            <Link href="/community" className="text-sm font-medium text-sky-600 hover:underline">
              المزيد
            </Link>
          </div>
          <div className="space-y-3">
            {communityDreams.map((dream) => (
              <Card key={dream.id} className="rounded-3xl border border-sky-100 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays size={14} />
                  <span>{dream.date}</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-700">{dream.preview}</p>
                <div className="mt-3">
                  <Link
                    href={`/community#dream-${dream.id}`}
                    className="text-xs font-semibold text-sky-600 hover:underline"
                    aria-label="لتفاصيل أكثر"
                  >
                    لتفاصيل أكثر
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-24 flex justify-center">
        <div className="pointer-events-auto flex flex-col items-center gap-3">
          {fabOpen && (
            <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => {
                  router.push("/dreams/new")
                  setFabOpen(false)
                }}
                className="w-36 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur"
              >
                الرؤيا لي
              </button>
              <button
                onClick={() => {
                  router.push("/dreams/new?for=other")
                  setFabOpen(false)
                }}
                className="w-36 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur"
              >
                الرؤيا لشخص آخر
              </button>
            </div>
          )}

          <button
            onClick={() => setFabOpen((prev) => !prev)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-amber-400 text-white shadow-xl transition hover:scale-105 hover:shadow-2xl"
          >
            {fabOpen ? <X size={28} /> : <Plus size={28} />}
          </button>
        </div>
      </div>

      <BottomNavigation />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} profile={profile} />
      {notificationsOpen && (
        <>
          <div className="fixed inset-0 z-[290]" onClick={() => setNotificationsOpen(false)} />
        </>
      )}
    </div>
  )
}
