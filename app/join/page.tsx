"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { buildApiUrl } from "@/lib/api-client"
import { PageLoader } from "@/components/ui/preloader"
import { InfoPageShell } from "@/components/info-page-shell"
import Link from "next/link"

interface PageContent {
  id: string
  pageKey: string
  title: string | null
  content: string
  isPublished: boolean
}

export default function JoinPage() {
  const [page, setPage] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPage = async () => {
      try {
        const response = await fetch(buildApiUrl("/pages/join"), {
          cache: "no-store",
        })
        if (response.ok) {
          const data = await response.json()
          setPage(data.page)
        }
      } catch (error) {
        console.error("[Join] Error loading page:", error)
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
            <p className="mt-6 text-sm text-slate-500">
              لمزيد من الاستفسارات يمكنك مراسلتنا على{" "}
              <Link href="mailto:support@ahlami.app" className="font-semibold text-sky-600 underline">
                support@ahlami.app
              </Link>
              .
            </p>
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
              .cms-content ul {
                margin-right: 1.5rem;
                margin-bottom: 1rem;
                list-style-type: disc;
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
        title="انضم لفريق المعبّرين"
        subtitle="نبحث دائماً عن معبرين معتمدين يمتلكون علماً شرعياً وخبرة عملية في تفسير الرؤى."
        ctaLabel="قدّم طلب الانضمام"
        ctaHref="/support"
      >
        <section className="space-y-6 text-right">
          <div className="rounded-2xl border border-sky-100 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-900">متطلبات الانضمام</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• شهادة أو تزكية معتمدة في علوم تفسير الرؤى.</li>
              <li>• التزام بأخلاقيات المهنة واحترام خصوصية المستخدمين.</li>
              <li>• قدرة على الرد المتوازن والسريع عبر المنصة.</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-sky-50/70 p-5">
            <h3 className="text-base font-semibold text-slate-900">ماذا نقدّم لك؟</h3>
            <p className="mt-2 text-sm text-slate-600">
              توفر المنصة لوحة تحكم متقدمة، وإحصائيات لأداءك، مع فريق دعم فني يساندك لحظة بلحظة، إضافة إلى نظام تقييم
              يعزز حضورك وخبرتك.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
            <h3 className="text-base font-semibold text-slate-900">خطوات التقديم</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-slate-600">
              <li>أرسل نبذة عنك وسيرتك عبر نموذج التواصل.</li>
              <li>سنراجع الطلب ونتواصل معك لإجراء مقابلة قصيرة.</li>
              <li>بعد الموافقة، ستتلقى حساباً مخصصاً للوصول إلى لوحة المعبّر.</li>
            </ol>
          </div>
          <p className="text-sm text-slate-500">
            لمزيد من الاستفسارات يمكنك مراسلتنا على{" "}
            <Link href="mailto:support@ahlami.app" className="font-semibold text-sky-600 underline">
              support@ahlami.app
            </Link>
            .
          </p>
        </section>
      </InfoPageShell>
      <BottomNavigation />
    </>
  )
}
