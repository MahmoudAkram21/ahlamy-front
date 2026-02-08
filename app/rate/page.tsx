"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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
