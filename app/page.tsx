"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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
  User,
  X,
} from "lucide-react"

import { BottomNavigation } from "@/components/bottom-navigation"
import { Card } from "@/components/ui/card"
import { PageLoader } from "@/components/ui/preloader"
import { getCurrentUser, buildApiUrl, type Profile } from "@/lib/api-client"
import {
  getTimingsByCoords,
  getTimingsByCity,
  getNextPrayer,
  getNowHHmm,
  type PrayerTimesData,
  type NextPrayer,
} from "@/lib/prayer-times"
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

interface ApprovedComment {
  id: string
  content: string
  user?: { fullName: string | null }
}

export default function HomePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [fabOpen, setFabOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [approvedComments, setApprovedComments] = useState<ApprovedComment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true)

  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null)
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null)
  const [prayerLoading, setPrayerLoading] = useState(true)
  const [prayerError, setPrayerError] = useState<string | null>(null)

  const fetchPrayerTimes = useCallback(() => {
    setPrayerLoading(true)
    setPrayerError(null)
    let cancelled = false

    const resolve = async (lat?: number, lon?: number) => {
      try {
        const data =
          lat != null && lon != null
            ? await getTimingsByCoords(lat, lon)
            : await getTimingsByCity("Cairo", "Egypt")
        if (cancelled) return
        if (!data) {
          setPrayerError("تعذر تحميل المواقيت")
          setPrayerData(null)
          setNextPrayer(null)
          return
        }
        setPrayerData(data)
        const next = getNextPrayer(data.timings, getNowHHmm(data.timezone))
        setNextPrayer(next)
      } catch {
        if (!cancelled) {
          setPrayerError("تعذر تحميل المواقيت")
          setPrayerData(null)
          setNextPrayer(null)
        }
      } finally {
        if (!cancelled) setPrayerLoading(false)
      }
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords.latitude, pos.coords.longitude),
        () => resolve(),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      )
    } else {
      resolve()
    }

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    fetchPrayerTimes()
  }, [fetchPrayerTimes])

  // Update next prayer every minute so the card stays correct (e.g. after 15:17 we show Maghrib)
  useEffect(() => {
    if (!prayerData) return
    const updateNext = () => {
      setNextPrayer((prev) => {
        const next = getNextPrayer(prayerData.timings, getNowHHmm(prayerData.timezone))
        return next ?? prev
      })
    }
    const id = setInterval(updateNext, 60 * 1000)
    return () => clearInterval(id)
  }, [prayerData])

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
    const fetchApproved = async () => {
      setCommentsLoading(true)
      try {
        const url = buildApiUrl("/comments") + "?approved=true"
        const res = await fetch(url, { credentials: "omit" })
        const data = await res.json().catch(() => null)
        if (res.ok && data != null) {
          const list = Array.isArray(data) ? data : (data?.comments ?? [])
          setApprovedComments(Array.isArray(list) ? list : [])
        } else {
          setApprovedComments([])
        }
      } catch {
        setApprovedComments([])
      } finally {
        setCommentsLoading(false)
      }
    }
    fetchApproved()
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

  const initials = useMemo(() => profile?.fullName?.charAt(0) ?? "أ", [profile?.fullName])

  if (loading) {
    return <PageLoader message="جاري تحميل الصفحة الرئيسية..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <header className="rounded-b-[2rem] bg-gradient-to-br from-sky-600 via-sky-500 to-amber-300 text-white shadow-xl">
        <div className="relative px-4 pt-8 pb-10 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 right-6 w-40 h-40 rounded-full bg-amber-200 blur-3xl" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
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

           {profile && <button
              className="relative p-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 transition hover:bg-white/25"
              onClick={() => setNotificationsOpen((prev) => !prev)}
              aria-label="الإشعارات"
            >
              <Bell size={22} />
              <span className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-amber-300 shadow animate-pulse" />
            </button>}
          </div>
          <div className="relative z-10 mt-6 rounded-3xl border border-white/25 bg-white/15 p-4 backdrop-blur-lg shadow-lg">
            <div className="flex items-center justify-between text-white/90">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} />
                <span className="text-sm font-semibold">الصلاة القادمة</span>
              </div>
              <button
                type="button"
                onClick={() => fetchPrayerTimes()}
                disabled={prayerLoading}
                className="flex items-center gap-1 text-xs text-white/80 disabled:opacity-60"
              >
                <RefreshCcw size={14} className={prayerLoading ? "animate-spin" : ""} />
                تحديث
              </button>
            </div>
            <div className="mt-4 flex items-end justify-between">
              {prayerLoading && (
                <div className="flex w-full items-center justify-center py-6 text-white/80">
                  <span className="text-sm">جاري تحميل المواقيت...</span>
                </div>
              )}
              {!prayerLoading && prayerError && (
                <div className="flex w-full flex-col items-center gap-2 py-4 text-center">
                  <p className="text-sm text-white/90">{prayerError}</p>
                  <button
                    type="button"
                    onClick={() => fetchPrayerTimes()}
                    className="rounded-full bg-white/20 px-3 py-1 text-xs text-white"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              )}
              {!prayerLoading && !prayerError && prayerData && (
                <>
                  <div>
                    <p className="text-sm text-white/80">
                      {prayerData.hijri ?? prayerData.dateReadable}
                    </p>
                    <h2 className="text-3xl font-bold">
                      {nextPrayer ? nextPrayer.nameAr : "—"}
                    </h2>
                    {nextPrayer?.isTomorrow && (
                      <p className="mt-1 text-xs text-white/70">غداً</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/70">{prayerData.dateReadable}</p>
                    <p className="text-xs text-white/60">موعد الصلاة</p>
                    <p className="text-4xl font-extrabold tracking-wide">
                      {nextPrayer ? nextPrayer.time : "—"}
                    </p>
                  </div>
                </>
              )}
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
          <div>
            <h2 className="text-lg font-bold text-slate-900">اراء عملاء احلامي</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {commentsLoading
                ? "جاري تحميل الآراء..."
                : approvedComments.length > 0
                  ? "آراء معتمدة من الرائيين في منصتنا"
                  : "آراء وتجارب من مجتمع احلامي"}
            </p>
          </div>

          {commentsLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Card key={i} className="rounded-2xl border border-sky-100 bg-white/90 p-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 text-amber-200">{stars(5)}</div>
                    <Quote size={18} className="text-sky-200" />
                  </div>
                  <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="mt-4 h-3 w-24 animate-pulse rounded bg-slate-100" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {approvedComments.length > 0
                ? approvedComments.map((c) => (
                    <Card key={c.id} className="rounded-2xl border border-sky-100 bg-white/90 p-4 shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-400">{stars(5)}</div>
                        <Quote size={18} className="text-sky-400" />
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{c.content}</p>
                      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Heart size={14} className="text-rose-400" />
                        <span>{c.user?.fullName ?? "رائي"}</span>
                      </div>
                    </Card>
                  ))
                : testimonials.map((item) => (
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
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">من رؤى مجتمع احلامي</h2>
            <button className="text-sm font-medium text-sky-600">المزيد</button>
          </div>
          <div className="space-y-3">
            {communityDreams.map((dream) => (
              <Card key={dream.id} className="rounded-3xl border border-sky-100 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays size={14} />
                  <span>{dream.date}</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-700">{dream.preview}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-sky-600">
                  <button className="font-semibold">شارك التفسير</button>
                  <button className="font-semibold">تفاصيل أكثر</button>
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
          <div className="fixed inset-0 z-[240]" onClick={() => setNotificationsOpen(false)} />
          <NotificationsDropdown onClose={() => setNotificationsOpen(false)} />
        </>
      )}
    </div>
  )
}
