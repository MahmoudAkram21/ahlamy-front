"use client"

import { useEffect, useMemo, useState } from "react"
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

interface FaqItem {
  question: string
  answerHtml: string
}

const fallbackContent = `
  <h1>الأسئلة الشائعة</h1>
  <h2>كيف أرسل رؤيا جديدة؟</h2>
  <p>سجل الدخول، اختر الخطة المناسبة، ثم اكتب تفاصيل الرؤيا بوضوح من داخل التطبيق.</p>
  <h2>متى يصلني التفسير؟</h2>
  <p>يمكنك متابعة حالة الطلب داخل التطبيق، وسيصلك إشعار عند اكتمال التفسير.</p>
  <h2>هل يمكنني التواصل مع المفسر؟</h2>
  <p>نعم، تظهر المحادثة الخاصة بالرؤيا عند الحاجة إلى استفسار أو توضيح.</p>
`

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function extractFaqItems(html: string): FaqItem[] {
  const content = html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi, "")
  const sections = content.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2\b|$)/gi)

  return Array.from(sections)
    .map((section) => ({
      question: stripHtml(section[1] || ""),
      answerHtml: (section[2] || "").trim(),
    }))
    .filter((item) => item.question && stripHtml(item.answerHtml))
}

export default function FaqsPage() {
  const [page, setPage] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPage = async () => {
      try {
        const response = await fetch(buildApiUrl("/pages/faqs"), {
          cache: "no-store",
        })

        if (response.ok) {
          const data = await response.json()
          setPage(data.page)
        }
      } catch (error) {
        console.error("[FAQs] Error loading page:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [])

  const content = page?.content || fallbackContent
  const faqItems = useMemo(() => extractFaqItems(content), [content])

  if (loading) {
    return <PageLoader message="جاري التحميل..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <DashboardHeader />

      <main className="mx-auto mt-6 w-full max-w-5xl px-4">
        <section className="text-right" dir="rtl">
          <h1 className="mb-6 text-3xl font-bold text-slate-900">{page?.title || "الأسئلة الشائعة"}</h1>

          {faqItems.length > 0 ? (
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <article key={`${item.question}-${index}`} className="rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-lg backdrop-blur">
                  <h2 className="text-xl font-bold leading-8 text-slate-900">{item.question}</h2>
                  <div
                    className="faq-answer mt-4 leading-8 text-slate-600"
                    dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                  />
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-sky-100 bg-white/95 p-8 shadow-lg backdrop-blur">
              <div
                className="cms-content leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          )}

          <style jsx>{`
            .cms-content,
            .faq-answer {
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
            .cms-content p,
            .faq-answer :global(p) {
              margin-bottom: 1rem;
              line-height: 1.75;
              overflow-wrap: break-word;
              word-break: break-word;
            }
            .faq-answer :global(p:last-child) {
              margin-bottom: 0;
            }
            .cms-content ul,
            .faq-answer :global(ul) {
              margin-right: 1.5rem;
              margin-bottom: 1rem;
              list-style-type: disc;
            }
            .cms-content li,
            .faq-answer :global(li) {
              margin-bottom: 0.5rem;
              overflow-wrap: break-word;
              word-break: break-word;
            }
          `}</style>
        </section>
      </main>

      <BottomNavigation />
    </div>
  )
}
