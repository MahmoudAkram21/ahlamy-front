"use client"

import { useEffect, useState } from "react"
import { Mail, MessageCircle, Phone } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { buildApiUrl } from "@/lib/api-client"
import { PageLoader } from "@/components/ui/preloader"

interface Setting {
  key: string
  value: string
}

interface SettingConfig {
  title: string
  content: string
}

const ALLOWED_KEYS = ["email", "whastapp", "whatsapp", "phone"] as const

const SETTING_CONFIG: Record<(typeof ALLOWED_KEYS)[number], { icon: typeof Mail; label: string; className: string }> = {
  email: {
    icon: Mail,
    label: "البريد الإلكتروني",
    className: "bg-emerald-50 border-emerald-200 text-emerald-800 [&_svg]:text-emerald-600",
  },
  whastapp: {
    icon: MessageCircle,
    label: "واتساب",
    className: "bg-green-50 border-green-200 text-green-800 [&_svg]:text-green-600",
  },
  whatsapp: {
    icon: MessageCircle,
    label: "واتساب",
    className: "bg-green-50 border-green-200 text-green-800 [&_svg]:text-green-600",
  },
  phone: {
    icon: Phone,
    label: "الهاتف",
    className: "bg-sky-50 border-sky-200 text-sky-800 [&_svg]:text-sky-600",
  },
}

function getSettingConfig(key: (typeof ALLOWED_KEYS)[number]) {
  return SETTING_CONFIG[key]
}

export default function SupportPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
const [pageContent, setPageContent] = useState<SettingConfig | null>(null)
  useEffect(() => {
    const loadPage = async () => {
      try {
        const response = await fetch(buildApiUrl("/app-settings"), {
          cache: "no-store",
        })
        const pageContent = await fetch(buildApiUrl("/pages/support"), {
          cache: "no-store",
        })

        if (response.ok) {
          const data = await response.json()
          setSettings(Array.isArray(data.settings) ? data.settings : [])
        }
        if (pageContent.ok) {
          const data = await pageContent.json()
          setPageContent(data.page)
        }
      } catch (error) {
        console.error("[Support] Error loading page:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [])

  if (loading) {
    return <PageLoader message="جاري التحميل..." />
  }

  const visibleSettings = settings.filter(
    (item): item is Setting & { key: (typeof ALLOWED_KEYS)[number] } =>
      item.key in SETTING_CONFIG
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <DashboardHeader />

      <main className="mx-auto mt-6 w-full max-w-4xl px-4" dir="rtl">
        {/* <h1 className="mb-6 text-2xl font-bold text-slate-900">تواصل معنا</h1> */}

        {pageContent && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{pageContent.title}</h2>
            <div className="mt-4" dangerouslySetInnerHTML={{ __html: pageContent.content }} />
          </div>
        )}

        {visibleSettings.length > 0 ? (
          <div className="flex w-full flex-col gap-4">
            {visibleSettings.map((item) => {
              const config = getSettingConfig(item.key)
              const Icon = config.icon
              const isWhatsApp = item.key === "whastapp" || item.key === "whatsapp"
              const href =
                item.key === "email"
                  ? `mailto:${item.value}`
                  : item.key === "phone"
                    ? `tel:${item.value}`
                    : isWhatsApp
                      ? `https://wa.me/${item.value.replace(/\D/g, "")}`
                      : null

              return (
                <a
                  key={item.key}
                  href={href ?? undefined}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-5 shadow-sm transition hover:shadow-md ${config.className}`}
                  dir="ltr"
                  style={{ textAlign: "left" }}
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                    <Icon className="h-7 w-7" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium opacity-90">{config.label}</p>
                    <p className="mt-0.5 truncate text-lg font-semibold">{item.value}</p>
                  </div>
                </a>
              )
            })}
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
