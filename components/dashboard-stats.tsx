"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { buildApiUrl } from "@/lib/api-client"

interface Stats {
  total: number
  new: number
  pending_inquiry: number
  pending_interpretation: number
  interpreted: number
  returned: number
}

export function DashboardStats() {
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

  const metrics = [
    { label: "كل الرؤى", value: stats.total, accent: "from-sky-500 to-amber-300" },
    { label: "جديدة", value: stats.new, accent: "from-emerald-500 to-emerald-300" },
    { label: "قيد الاستفسار", value: stats.pending_inquiry, accent: "from-amber-500 to-amber-300" },
    { label: "قيد التفسير", value: stats.pending_interpretation, accent: "from-indigo-500 to-indigo-300" },
    { label: "تم التفسير", value: stats.interpreted, accent: "from-sky-600 to-sky-400" },
    { label: "مرجعة", value: stats.returned, accent: "from-rose-500 to-rose-300" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {metrics.map((metric) => (
        <Card
          key={metric.label}
          className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white/95 p-4 shadow-sm backdrop-blur"
        >
          <div className={`absolute inset-0 opacity-20 blur-lg bg-gradient-to-r ${metric.accent}`} />
          <div className="relative">
            <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
            <div className="text-xs font-semibold text-slate-500">{metric.label}</div>
          </div>
        </Card>
      ))}
    </div>
  )
}
