"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { buildApiUrl } from "@/lib/api-client"

interface Stats {
  total: number
  new: number
  pending_payment?: number
  pending_inquiry: number
  pending_interpretation: number
  interpreted: number
  returned: number
}

interface DashboardStatsProps {
  role?: string | null
}

export function DashboardStats({ role }: DashboardStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(buildApiUrl("/dreams/stats"), {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="py-6 text-center text-slate-500">جاري تحميل الإحصائيات...</div>
  }

  if (!stats) {
    return <div className="py-6 text-center text-rose-500">فشل تحميل الإحصائيات</div>
  }

  const allMetrics = [
    { key: "total", label: "كل الرؤى", value: stats.total, accent: "from-sky-500 to-amber-300" },
    { key: "new", label: "جديدة", value: stats.new, accent: "from-emerald-500 to-emerald-300" },
    { key: "pending_payment", label: "بانتظار الدفع", value: stats.pending_payment ?? 0, accent: "from-orange-500 to-orange-300" },
    { key: "pending_inquiry", label: "قيد الاستفسار", value: stats.pending_inquiry, accent: "from-amber-500 to-amber-300" },
    { key: "pending_interpretation", label: "قيد التفسير", value: stats.pending_interpretation, accent: "from-indigo-500 to-indigo-300" },
    { key: "interpreted", label: "تم التفسير", value: stats.interpreted, accent: "from-sky-600 to-sky-400" },
    { key: "returned", label: "مرجعة", value: stats.returned, accent: "from-rose-500 to-rose-300" },
  ]
  const metrics =
    role === "interpreter"
      ? allMetrics.filter((m) => m.key !== "pending_payment")
      : allMetrics

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {metrics.map((metric) => {
        const href = metric.key === "total" ? "/dreams" : `/dreams?status=${metric.key}`
        return (
          <Link key={metric.key} href={href}>
            <Card
              className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white/95 p-4 shadow-sm backdrop-blur transition hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              <div className={`absolute inset-0 opacity-20 blur-lg bg-gradient-to-r ${metric.accent}`} />
              <div className="relative">
                <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
                <div className="text-xs font-semibold text-slate-500">{metric.label}</div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
