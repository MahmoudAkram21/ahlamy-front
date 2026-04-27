"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { buildApiUrl } from "@/lib/api-client"
import { PageLoader } from "@/components/ui/preloader"

interface PageContent {
  id: string
  pageKey: string
  title: string | null
  content: string
  isPublished: boolean
}

const defaultTermsContent = `
  <p>يرجى قراءة هذه الشروط بعناية قبل استخدام تطبيق أحلامي. باستخدامك للتطبيق فإنك توافق على الالتزام بهذه الشروط.</p>
  <h2><br>الحسابات</h2>
  <p>يتحمل المستخدم مسؤولية الحفاظ على سرية بيانات الدخول الخاصة به، كما يجب تقديم بيانات صحيحة عند إنشاء الحساب أو تحديثه.</p>
  <h2><br>طلبات التفسير</h2>
  <p>تفسيرات الرؤى المقدمة عبر التطبيق اجتهادية ولا تعد وعداً بحدوث أمر معين أو بديلاً عن الاستشارة الشرعية أو الطبية أو القانونية المتخصصة.</p>
  <h2><br>التواصل والدعم</h2>
  <p>لأي استفسار أو طلب مساعدة، يمكن التواصل مع فريق الدعم من خلال صفحة الدعم والمساعدة داخل التطبيق.</p>
  <h2><br>تحديث الشروط</h2>
  <p>يحق لإدارة التطبيق تحديث هذه الشروط عند الحاجة، ويعد استمرار استخدام التطبيق بعد التحديث موافقة على الشروط المعدلة.</p>
`

function hasUsableTermsContent(content?: string | null) {
  if (!content) return false

  const text = content.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim()
  return text.length >= 120 && content.includes("<h2")
}

export default function TermsPage() {
  const [page, setPage] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPage = async () => {
      try {
        const response = await fetch(buildApiUrl('/pages/terms'), {
          cache: 'no-store',
        })

        if (response.ok) {
          const data = await response.json()
          setPage(data.page)
        }
      } catch (error) {
        console.error('[Terms] Error loading page:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [])

  if (loading) {
    return <PageLoader message="جاري التحميل..." />
  }

  const termsContent = hasUsableTermsContent(page?.content) ? page!.content : defaultTermsContent

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <DashboardHeader />

      <main className="mx-auto mt-6 w-full max-w-4xl px-4">
          <div className="rounded-3xl border border-sky-100 bg-white/95 p-8 shadow-lg backdrop-blur">
            {page?.title && (
              <h1 className="mb-6 text-3xl font-bold text-slate-900">{page.title}</h1>
            )}

            <div
              className="cms-content text-right leading-relaxed text-slate-700"
              style={{ direction: 'rtl' }}
              dangerouslySetInnerHTML={{ __html: termsContent }}
            />

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
      </main>

      <BottomNavigation />
    </div>
  )
}
