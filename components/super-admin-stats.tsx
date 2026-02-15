"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { fetchWithAuth } from "@/lib/api-client"

interface AdminStats {
  stats: {
    totalUsers: number
    totalRequests: number
    completedRequests: number
    totalPlans: number
    totalRevenue: number
    totalDreams: number
    dreams: {
      new: number
      pending_payment: number
      pending_inquiry: number
      pending_interpretation: number
      interpreted: number
      returned: number
    }
  }
}

export function SuperAdminStats() {
  const [data, setData] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetchWithAuth("/api/admin/stats")
        if (response.ok) {
          const json = await response.json()
          setData(json)
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="py-6 text-center text-slate-500">
        جاري تحميل الإحصائيات...
      </div>
    )
  }

  if (!data?.stats) {
    return (
      <div className="py-6 text-center text-rose-500">
        فشل تحميل الإحصائيات
      </div>
    )
  }

  const s = data.stats
  const dreamLabels: Record<string, string> = {
    new: "جديدة",
    pending_payment: "بانتظار الدفع",
    pending_inquiry: "قيد الاستفسار",
    pending_interpretation: "قيد التفسير",
    interpreted: "تم التفسير",
    returned: "مرجعة",
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-500">إحصائيات النظام كاملة (بدون تحديد فترة)</p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card className="relative overflow-hidden rounded-3xl border border-violet-100 bg-white/95 p-4 shadow-sm backdrop-blur">
          <div className="absolute inset-0 opacity-20 blur-lg bg-gradient-to-r from-violet-500 to-purple-300" />
          <div className="relative">
            <div className="text-2xl font-bold text-slate-900">{s.totalUsers}</div>
            <div className="text-xs font-semibold text-slate-500">المستخدمون</div>
          </div>
        </Card>
        <Link href="/dreams">
          <Card className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white/95 p-4 shadow-sm backdrop-blur transition hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
            <div className="absolute inset-0 opacity-20 blur-lg bg-gradient-to-r from-sky-500 to-amber-300" />
            <div className="relative">
              <div className="text-2xl font-bold text-slate-900">{s.totalDreams}</div>
              <div className="text-xs font-semibold text-slate-500">إجمالي الرؤى</div>
            </div>
          </Card>
        </Link>
        <Card className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white/95 p-4 shadow-sm backdrop-blur">
          <div className="absolute inset-0 opacity-20 blur-lg bg-gradient-to-r from-emerald-500 to-green-300" />
          <div className="relative">
            <div className="text-2xl font-bold text-slate-900">{s.totalRequests}</div>
            <div className="text-xs font-semibold text-slate-500">الطلبات</div>
          </div>
        </Card>
        <Card className="relative overflow-hidden rounded-3xl border border-amber-100 bg-white/95 p-4 shadow-sm backdrop-blur">
          <div className="absolute inset-0 opacity-20 blur-lg bg-gradient-to-r from-amber-500 to-orange-300" />
          <div className="relative">
            <div className="text-2xl font-bold text-slate-900">{s.completedRequests}</div>
            <div className="text-xs font-semibold text-slate-500">الطلبات المكتملة</div>
          </div>
        </Card>
        <Card className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white/95 p-4 shadow-sm backdrop-blur">
          <div className="absolute inset-0 opacity-20 blur-lg bg-gradient-to-r from-indigo-500 to-indigo-300" />
          <div className="relative">
            <div className="text-2xl font-bold text-slate-900">{s.totalPlans}</div>
            <div className="text-xs font-semibold text-slate-500">الباقات</div>
          </div>
        </Card>
        <Card className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white/95 p-4 shadow-sm backdrop-blur">
          <div className="absolute inset-0 opacity-20 blur-lg bg-gradient-to-r from-rose-500 to-pink-300" />
          <div className="relative">
            <div className="text-2xl font-bold text-slate-900">
              {typeof s.totalRevenue === "number"
                ? s.totalRevenue.toFixed(0)
                : s.totalRevenue}
            </div>
            <div className="text-xs font-semibold text-slate-500">إيرادات الدفع</div>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-2">تفصيل الرؤى حسب الحالة</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Object.entries(s.dreams).map(([key, value]) => (
            <Link key={key} href={`/dreams?status=${key}`}>
              <Card className="rounded-2xl border border-sky-100 bg-white/90 p-3 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                <div className="text-lg font-bold text-slate-900">{value}</div>
                <div className="text-xs font-semibold text-slate-500">
                  {dreamLabels[key] ?? key}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
