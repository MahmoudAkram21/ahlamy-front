"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/api-client"
import { buildApiUrl } from "@/lib/api-client"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { PageLoader } from "@/components/ui/preloader"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"

interface Interpreter {
  id: string
  fullName: string | null
  email: string
  isAvailable: boolean
  totalInterpretations: number
  rating: string
}

const VISION_TYPE_LABELS: Record<string, string> = {
  gold_sa: "ذهبي سعودي",
  silver_sa: "فضي سعودي",
  bronze_sa: "برونزي سعودي",
  gold_eg: "ذهبي مصري",
  silver_eg: "فضي مصري",
  bronze_eg: "برونزي مصري",
}

interface StatsByTypeItem {
  interpreterId: string
  fullName: string
  email: string
  counts: Record<string, number>
  total: number
}

export default function AdminInterpretersPage() {
  const router = useRouter()
  const [interpreters, setInterpreters] = useState<Interpreter[]>([])
  const [statsByType, setStatsByType] = useState<StatsByTypeItem[]>([])
  const [statsMonth, setStatsMonth] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInterpreters = async () => {
      try {
        const current = await getCurrentUser()

        if (!current) {
          router.push("/auth/admin-login")
          return
        }

        if (!current.profile.isAdmin && !current.profile.isSuperAdmin) {
          router.push("/dashboard")
          return
        }

        const [interpretersRes, statsRes] = await Promise.all([
          fetch(buildApiUrl("/admin/interpreters"), { credentials: "include" }),
          fetch(buildApiUrl("/admin/interpreters/stats-by-type"), { credentials: "include" }),
        ])

        if (interpretersRes.status === 403) {
          router.push("/dashboard")
          return
        }

        if (interpretersRes.ok) {
          const data = await interpretersRes.json()
          setInterpreters(data.interpreters || [])
        }
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStatsByType(statsData.stats || [])
          setStatsMonth(statsData.month || "")
        }
      } catch (error) {
        console.error("[Admin Interpreters] Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInterpreters()
  }, [router])

  const handleExport = async (format: string) => {
    try {
      const url = `${buildApiUrl("/admin/interpreters/stats-by-type/export")}?format=${format}`
      const res = await fetch(url, { credentials: "include" })
      if (!res.ok) return
      const blob = await res.blob()
      const disposition = res.headers.get("Content-Disposition")
      const filename = disposition?.match(/filename="?([^";]+)"?/)?.[1] || `vision-stats.${format === "pdf" ? "html" : format}`
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return <PageLoader message="جاري تحميل بيانات المفسرين..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <DashboardHeader />

      <main className="mx-auto mt-6 w-full max-w-5xl px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">المفسرون</h1>
          <p className="mt-1 text-sm text-slate-500">عرض حالة المفسرين وإجمالي التفاسير والدرجة التقييمية الحالية.</p>
        </div>

        <section className="mb-8 rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-lg backdrop-blur">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 text-right">عداد الرؤى حسب النوع (الشهر الحالي)</h2>
            {statsMonth && <span className="text-sm text-slate-500">{statsMonth}</span>}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => handleExport("txt")}
              >
                <FileText size={16} className="ml-1" />
                تصدير ورقة
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => handleExport("pdf")}
              >
                <Download size={16} className="ml-1" />
                تصدير PDF
              </Button>
            </div>
          </div>
          {statsByType.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-4">لا توجد إحصائيات لهذا الشهر.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-sky-100">
                    <th className="py-2 px-2 font-semibold text-slate-700">المفسر</th>
                    {Object.entries(VISION_TYPE_LABELS).map(([, label]) => (
                      <th key={label} className="py-2 px-2 font-semibold text-slate-700">{label}</th>
                    ))}
                    <th className="py-2 px-2 font-semibold text-slate-700">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {statsByType.map((row) => (
                    <tr key={row.interpreterId} className="border-b border-sky-50">
                      <td className="py-2 px-2">{row.fullName || row.email}</td>
                      {Object.keys(VISION_TYPE_LABELS).map((key) => (
                        <td key={key} className="py-2 px-2">{row.counts[key] ?? 0}</td>
                      ))}
                      <td className="py-2 px-2 font-semibold">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {interpreters.length === 0 ? (
          <Card className="rounded-3xl border border-sky-100 bg-white/95 p-6 text-center text-slate-500 shadow-md">
            لا يوجد مفسرون مسجلون حالياً.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {interpreters.map((interpreter) => (
              <Card key={interpreter.id} className="rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {interpreter.fullName || interpreter.email}
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">{interpreter.email}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`rounded-full border-none px-3 py-1 text-xs font-semibold ${
                      interpreter.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {interpreter.isAvailable ? "متاح" : "غير متاح"}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-sky-50/70 px-4 py-3">
                    <p className="text-xs text-slate-500">إجمالي التفاسير</p>
                    <p className="text-base font-semibold text-slate-800">{interpreter.totalInterpretations}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50/70 px-4 py-3">
                    <p className="text-xs text-slate-500">التقييم</p>
                    <p className="text-base font-semibold text-amber-600">{interpreter.rating || "0"}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}





