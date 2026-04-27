"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { buildApiUrl } from "@/lib/api-client"
import { PageLoader } from "@/components/ui/preloader"
import { MessageCircle, Phone } from "lucide-react"

interface PageContent {
  id: string
  pageKey: string
  title: string | null
  content: string
  isPublished: boolean
}

const supportPhone = "+201007708656"
const supportWhatsapp = "201007708656"

export default function SupportPage() {
  const [page, setPage] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPage = async () => {
      try {
        const response = await fetch(buildApiUrl('/pages/support'), {
          cache: 'no-store',
        })

        if (response.ok) {
          const data = await response.json()
          setPage(data.page)
        }
      } catch (error) {
        console.error('[Support] Error loading page:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [])

  if (loading) {
    return <PageLoader message="جاري التحميل..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <DashboardHeader />

      <main className="mx-auto mt-6 w-full max-w-4xl px-4">
        {page ? (
          <div className="rounded-3xl border border-sky-100 bg-white/95 p-8 shadow-lg backdrop-blur">
            {page.title && (
              <h1 className="mb-6 text-3xl font-bold text-slate-900">{page.title}</h1>
            )}

            <div
              className="cms-content text-right leading-relaxed text-slate-700"
              style={{ direction: 'rtl' }}
              dangerouslySetInnerHTML={{ __html: page.content }}
            />

            <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50/70 p-5 text-right">
              <h2 className="text-xl font-bold text-slate-900">للتواصل معنا</h2>
              <p className="mt-2 text-sm text-slate-600">
                يمكنك التواصل مع فريق الدعم على الرقم التالي:
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <a
                  href={`tel:${supportPhone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100"
                  dir="ltr"
                >
                  <Phone size={18} />
                  {supportPhone}
                </a>
                <a
                  href={`https://wa.me/${supportWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                >
                  <MessageCircle size={18} />
                  واتساب
                </a>
              </div>
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
                overflow-wrap: break-word;
                word-break: break-word;
              }
              .cms-content h2 {
                font-size: 1.5rem;
                font-weight: bold;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
                color: #0369a1;
                overflow-wrap: break-word;
                word-break: break-word;
              }
              .cms-content p {
                margin-bottom: 1rem;
                line-height: 1.75;
                overflow-wrap: break-word;
                word-break: break-word;
              }
              .cms-content ul {
                margin-right: 1.5rem;
                margin-bottom: 1rem;
                list-style-type: disc;
              }
              .cms-content li {
                margin-bottom: 0.5rem;
                overflow-wrap: break-word;
                word-break: break-word;
              }
            `}</style>
          </div>
        ) : (
          <div className="rounded-3xl border border-sky-100 bg-white/95 p-12 text-center shadow-lg">
            <p className="text-slate-600">المحتوى غير متوفر حالياً</p>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
