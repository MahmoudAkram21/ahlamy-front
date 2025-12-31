"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-client"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { buildApiUrl } from "@/lib/api-client"
import { PageLoader } from "@/components/ui/preloader"

interface AdminStats {
  totalUsers: number
  totalRequests: number
  totalRevenue: number
  completedRequests: number
  totalPlans: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalRequests: 0,
    totalRevenue: 0,
    completedRequests: 0,
    totalPlans: 0,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('[Admin] Checking authentication...')
        
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          console.log('[Admin] No user found, redirecting to login')
          router.push("/auth/admin-login")
          return
        }

        if (!currentUser.profile.isSuperAdmin) {
          console.log('[Admin] Redirecting non super admin to distribution view')
          router.push("/admin/dreams")
          return
        }

        console.log('[Admin] Super admin authenticated, fetching stats...')

        // Fetch stats
        const response = await fetch(buildApiUrl('/admin/stats'), {
          credentials: 'include',
        })

        if (response.status === 403) {
          router.push("/dashboard")
          return
        }

        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
          console.log('[Admin] Stats loaded')
        }
      } catch (error) {
        console.error('[Admin] Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [router])

  if (loading) {
    return <PageLoader message="جاري تجهيز لوحة المسؤول..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <DashboardHeader />

      <main className="mx-auto mt-6 flex w-full max-w-6xl flex-col gap-6 px-4">
        <section className="rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-lg backdrop-blur">
          <h1 className="mb-6 text-2xl font-bold text-slate-900 text-right">لوحة تحكم المسؤول</h1>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-sky-100 bg-slate-50 p-5 text-center">
              <div className="text-3xl font-bold text-sky-600">{stats.totalUsers}</div>
              <div className="mt-1 text-sm text-slate-500">إجمالي المستخدمين</div>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center">
              <div className="text-3xl font-bold text-indigo-600">{stats.totalRequests}</div>
              <div className="mt-1 text-sm text-indigo-500">إجمالي الطلبات</div>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5 text-center">
              <div className="text-3xl font-bold text-emerald-600">{stats.completedRequests}</div>
              <div className="mt-1 text-sm text-emerald-600">الطلبات المكتملة</div>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center">
              <div className="text-3xl font-bold text-amber-500">${stats.totalRevenue}</div>
              <div className="mt-1 text-sm text-amber-500">الإيرادات الكلية</div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            onClick={() => router.push("/admin/users")}
            className="rounded-3xl border border-sky-100 bg-white/95 p-6 text-right shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <h3 className="mb-2 text-xl font-bold text-slate-900">إدارة المستخدمين</h3>
            <p className="text-sm text-slate-500">عرض وإدارة جميع المستخدمين</p>
          </button>
          <button
            onClick={() => router.push("/admin/plans")}
            className="rounded-3xl border border-sky-100 bg-white/95 p-6 text-right shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <h3 className="mb-2 text-xl font-bold text-slate-900">إدارة الخطط</h3>
            <p className="text-sm text-slate-500">إنشاء وتعديل الخطط</p>
          </button>
          <button
            onClick={() => router.push("/admin/dreams")}
            className="rounded-3xl border border-sky-100 bg-white/95 p-6 text-right shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <h3 className="mb-2 text-xl font-bold text-slate-900">توزيع الرؤى</h3>
            <p className="text-sm text-slate-500">إسناد الرؤى غير المفسرة إلى المفسرين</p>
          </button>
          <button
            onClick={() => router.push("/admin/interpreters")}
            className="rounded-3xl border border-sky-100 bg-white/95 p-6 text-right shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <h3 className="mb-2 text-xl font-bold text-slate-900">المفسرون</h3>
            <p className="text-sm text-slate-500">متابعة حالة المفسرين وإحصاءاتهم</p>
          </button>
          <button
            onClick={() => router.push("/admin/analytics")}
            className="rounded-3xl border border-sky-100 bg-white/95 p-6 text-right shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <h3 className="mb-2 text-xl font-bold text-slate-900">التحليلات</h3>
            <p className="text-sm text-slate-500">عرض التقارير والإحصائيات</p>
          </button>
        </section>
      </main>

      <BottomNavigation />
    </div>
  )
}
