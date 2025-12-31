"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { buildApiUrl } from "@/lib/api-client"

interface Request {
  id: string
  title: string
  status: string
  createdAt: string
  dreamerId: string
}

interface Stats {
  total: number
  completed: number
  pending: number
}

export default function InterpreterDashboard() {
  const [requests, setRequests] = useState<Request[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[Interpreter Dashboard] Fetching requests...')
        
        const response = await fetch(buildApiUrl('/requests'), {
          method: 'GET',
          credentials: 'include',
        })

        if (response.status === 401) {
          console.log('[Interpreter Dashboard] Unauthorized, redirecting to login')
          router.push('/auth/login')
          return
        }

        if (!response.ok) {
          throw new Error('Failed to fetch requests')
        }

        const requestsData = await response.json()
        console.log('[Interpreter Dashboard] Fetched', requestsData.length, 'requests')
        
        setRequests(requestsData || [])

        const completed = requestsData?.filter((r: Request) => r.status === "completed").length || 0
        const pending = requestsData?.filter((r: Request) => r.status !== "completed").length || 0

        setStats({
          total: requestsData?.length || 0,
          completed,
          pending,
        })
      } catch (error) {
        console.error('[Interpreter Dashboard] Error fetching data:', error)
        setError('فشل تحميل البيانات')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24">
        <Card className="p-6 max-w-md mx-auto text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            إعادة المحاولة
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <DashboardHeader />

      <main className="mx-auto mt-6 flex w-full max-w-4xl flex-col gap-6 px-4">
        <section className="rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-lg backdrop-blur">
          <h1 className="mb-4 text-2xl font-bold text-slate-900 text-right">لوحة تحكم المفسر</h1>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-sky-100 bg-slate-50 p-4 text-center">
              <div className="text-3xl font-bold text-sky-600">{stats.total}</div>
              <div className="mt-1 text-sm text-slate-500">إجمالي الطلبات</div>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-center">
              <div className="text-3xl font-bold text-emerald-600">{stats.completed}</div>
              <div className="mt-1 text-sm text-emerald-600">مكتملة</div>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-center">
              <div className="text-3xl font-bold text-amber-500">{stats.pending}</div>
              <div className="mt-1 text-sm text-amber-500">قيد الانتظار</div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 text-right">طلبات التفسير</h2>
          {requests.length === 0 ? (
            <Card className="rounded-3xl border border-sky-100 bg-white/95 p-6 text-center text-slate-500 shadow-md">
              لا توجد طلبات حالياً
            </Card>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="cursor-pointer overflow-hidden rounded-3xl border border-sky-100 bg-white/95 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  onClick={() => router.push(`/interpreter/requests/${request.id}`)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        request.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-sky-100 text-sky-700"
                      }`}
                    >
                      {request.status}
                    </span>
                    <div className="flex-1 text-right">
                      <h3 className="text-sm font-semibold text-slate-900">{request.title}</h3>
                      <p className="text-xs text-slate-500">
                        {new Date(request.createdAt).toLocaleDateString("ar-SA", { day: "numeric", month: "long" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNavigation />
    </div>
  )
}
