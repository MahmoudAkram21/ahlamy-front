"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-client"
import { buildApiUrl } from "@/lib/api-client"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { PageLoader } from "@/components/ui/preloader"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface Interpreter {
  id: string
  fullName: string | null
  email: string
  isAvailable: boolean
  totalInterpretations: number
  rating: string
}

export default function AdminInterpretersPage() {
  const router = useRouter()
  const [interpreters, setInterpreters] = useState<Interpreter[]>([])
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

        const response = await fetch(buildApiUrl("/admin/interpreters"), {
          credentials: "include",
        })

        if (response.status === 403) {
          router.push("/dashboard")
          return
        }

        if (response.ok) {
          const data = await response.json()
          setInterpreters(data.interpreters || [])
        }
      } catch (error) {
        console.error("[Admin Interpreters] Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInterpreters()
  }, [router])

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





