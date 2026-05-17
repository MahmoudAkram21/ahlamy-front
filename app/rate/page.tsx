"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Star } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { buildApiUrl } from "@/lib/api-client"
import { PageLoader } from "@/components/ui/preloader"
import { InfoPageShell } from "@/components/info-page-shell"

interface PageContent {
  id: string
  pageKey: string
  title: string | null
  content: string
  isPublished: boolean
}

const stores = [
  { label: "متجر Google Play", href: "https://play.google.com/store" },
  { label: "متجر Apple App Store", href: "https://apps.apple.com" },
  { label: "Huawei Gallery", href: "https://appgallery.huawei.com" },
]

export default function RatePage() {
  const [page, setPage] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const loadPage = async () => {
      try {
        const response = await fetch(buildApiUrl("/pages/rate"), {
          cache: "no-store",
        })
        if (response.ok) {
          const data = await response.json()
          setPage(data.page)
        }
      } catch (error) {
        console.error("[Rate] Error loading page:", error)
      } finally {
        setLoading(false)
      }
    }
    loadPage()
  }, [])

  const submitReview = async () => {
    setSubmitting(true)
    setSubmitMessage(null)
    setSubmitError(null)

    try {
      const response = await fetch(buildApiUrl("/reviews"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ rating, content }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "تعذر إرسال التقييم")
      }

      setContent("")
      setRating(5)
      setSubmitMessage("تم إرسال تقييمك للإدارة، وسيظهر بعد المراجعة.")
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "تعذر إرسال التقييم")
    } finally {
      setSubmitting(false)
    }
  }

  const reviewForm = (
    <div className="mt-8 rounded-3xl border border-sky-100 bg-sky-50/70 p-5 text-right">
      <h2 className="text-xl font-bold text-slate-900">شارك تقييمك</h2>
      <div className="mt-4 flex justify-end gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const value = index + 1
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={value <= rating ? "text-amber-500" : "text-slate-300"}
              aria-label={`${value} نجوم`}
            >
              <Star size={26} fill="currentColor" />
            </button>
          )
        })}
      </div>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="اكتب تجربتك مع أحلامي..."
        className="mt-4 min-h-32 w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-right text-sm text-slate-800 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
      />
      {submitError ? <p className="mt-3 text-sm font-semibold text-rose-600">{submitError}</p> : null}
      {submitMessage ? <p className="mt-3 text-sm font-semibold text-emerald-700">{submitMessage}</p> : null}
      <button
        type="button"
        onClick={submitReview}
        disabled={submitting || content.trim().length < 10}
        className="mt-4 w-full rounded-full bg-gradient-to-r from-sky-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
      </button>
    </div>
  )

  if (loading) {
    return <PageLoader message="جاري التحميل..." />
  }

  if (page) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
        <DashboardHeader />
        <main className="mx-auto mt-6 w-full max-w-4xl px-4">
          <div className="rounded-3xl border border-sky-100 bg-white/95 p-8 shadow-lg backdrop-blur">
            {page.title && (
              <h1 className="mb-6 text-3xl font-bold text-slate-900">{page.title}</h1>
            )}
            <div
              className="cms-content text-right leading-relaxed text-slate-700"
              style={{ direction: "rtl" }}
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
            {reviewForm}
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {stores.map((store) => (
                <Link
                  key={store.label}
                  href={store.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-sky-600 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  {store.label}
                </Link>
              ))}
            </div>
            <style jsx>{`
              .cms-content {
                overflow-wrap: break-word;
                word-break: break-word;
                max-width: 100%;
              }
              .cms-content h1 {
                font-size: 2rem;
                font-weight: bold;
                margin-bottom: 1rem;
                color: #0f172a;
              }
              .cms-content h2 {
                font-size: 1.5rem;
                font-weight: bold;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
                color: #0369a1;
              }
              .cms-content p {
                margin-bottom: 1rem;
                line-height: 1.75;
              }
              .cms-content ul,
              .cms-content ol {
                margin-right: 1.5rem;
                margin-bottom: 1rem;
              }
              .cms-content li {
                margin-bottom: 0.5rem;
              }
            `}</style>
          </div>
        </main>
        <BottomNavigation />
      </div>
    )
  }

  return (
    <>
      <InfoPageShell
        title="قيّم تطبيق احلامي"
        subtitle="ملاحظاتك تساعدنا على تطوير التجربة وتحسين خدمات التفسير للجميع."
      >
        <section className="space-y-6 text-right">
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">لماذا نطلب تقييمك؟</h2>
            <p className="mt-2 text-sm text-slate-600 leading-7">
              التقييمات الإيجابية ترفع ثقة المستخدمين الجدد وتشجعنا على الاستثمار أكثر في تطوير خصائص المنصة. أما
              الملاحظات البنائية فتمكننا من معالجة أي نقطة ضعف بشكل عاجل.
            </p>
          </div>
          <div className="rounded-2xl bg-sky-50/70 p-5">
            <h3 className="text-base font-semibold text-slate-900">كيف تقيّمنا؟</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-slate-600">
              <li>اختر متجر التطبيقات الذي تستخدمه من القائمة أدناه.</li>
              <li>اكتب بضع كلمات عن تجربتك، وما أعجبك أو ما تحتاج تحسينه.</li>
              <li>أرسل التقييم وشارك لقطة شاشة مع أصدقائك لدعمنا أكثر.</li>
            </ol>
          </div>
          {reviewForm}
          <div className="grid gap-3 md:grid-cols-3">
            {stores.map((store) => (
              <Link
                key={store.label}
                href={store.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-sky-600 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {store.label}
              </Link>
            ))}
          </div>
        </section>
      </InfoPageShell>
      <BottomNavigation />
    </>
  )
}
