"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-client"
import { buildApiUrl } from "@/lib/api-client"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageLoader } from "@/components/ui/preloader"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Interpreter {
  id: string
  fullName: string | null
  email: string
  isAvailable: boolean
  totalInterpretations: number
  rating: string
}

interface Dream {
  id: string
  title: string
  content: string
  status: string
  createdAt: string
  dreamer: {
    id: string
    fullName: string | null
    email: string
  }
  interpreter: {
    id: string
    fullName: string | null
    email: string
  } | null
}

export default function AdminDreamsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dreams, setDreams] = useState<Dream[]>([])
  const [interpreters, setInterpreters] = useState<Interpreter[]>([])
  const [selectedInterpreter, setSelectedInterpreter] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
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

        const [dreamsRes, interpretersRes] = await Promise.all([
          fetch(buildApiUrl("/dreams"), { credentials: "include" }),
          fetch(buildApiUrl("/admin/interpreters"), { credentials: "include" }),
        ])

        if (!dreamsRes.ok) {
          throw new Error("تعذر تحميل الرؤى")
        }

        const dreamsData: Dream[] = await dreamsRes.json()
        setDreams(dreamsData)

        if (interpretersRes.ok) {
          const interpretersData = await interpretersRes.json()
          setInterpreters(interpretersData.interpreters || [])
        }
      } catch (err) {
        console.error("[Admin Dreams] load error:", err)
        setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const unassignedDreams = useMemo(() => dreams.filter((dream) => !dream.interpreter), [dreams])
  const assignedDreams = useMemo(() => dreams.filter((dream) => dream.interpreter), [dreams])

  const handleAssign = async (dreamId: string) => {
    const interpreterId = selectedInterpreter[dreamId]
    if (!interpreterId) {
      setError("يرجى اختيار مفسر قبل إسناد الرؤيا")
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(buildApiUrl(`/dreams/${dreamId}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ interpreter_id: interpreterId }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || "تعذر إسناد الرؤيا")
      }

      const updatedDream: Dream = await response.json()

      setDreams((prev) => prev.map((dream) => (dream.id === updatedDream.id ? updatedDream : dream)))
      setSelectedInterpreter((prev) => {
        const copy = { ...prev }
        delete copy[dreamId]
        return copy
      })
    } catch (err) {
      console.error("[Admin Dreams] assign error:", err)
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <PageLoader message="جاري تحميل الرؤى..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <DashboardHeader />

      <main className="mx-auto mt-6 w-full max-w-5xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">توزيع الرؤى على المفسرين</h1>
            <p className="text-sm text-slate-500">قم بإسناد الرؤى الجديدة إلى المفسرين المتاحين لبدء المحادثة مع الرائي.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
        )}

        <section className="mb-8 rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-lg backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">رؤى بانتظار الإسناد</h2>
            <Badge variant="outline" className="rounded-full border-none bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              {unassignedDreams.length} رؤى
            </Badge>
          </div>

          {unassignedDreams.length === 0 ? (
            <div className="rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-6 text-sm text-slate-500 text-center">
              لا توجد رؤى بانتظار الإسناد حالياً.
            </div>
          ) : (
            <div className="space-y-4">
              {unassignedDreams.map((dream) => (
                <Card key={dream.id} className="rounded-2xl border border-sky-100 bg-white/95 p-5 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-slate-900">{dream.title}</h3>
                      <p className="text-xs text-slate-500">
                        {dream.dreamer.fullName || dream.dreamer.email} •{" "}
                        {new Date(dream.createdAt).toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <p className="text-xs leading-6 text-slate-500 line-clamp-3">{dream.content}</p>
                    </div>
                    <div className="flex flex-col gap-3 md:w-72">
                      <Select
                        value={selectedInterpreter[dream.id] || ""}
                        onValueChange={(value) =>
                          setSelectedInterpreter((prev) => ({
                            ...prev,
                            [dream.id]: value,
                          }))
                        }
                      >
                        <SelectTrigger className="rounded-full bg-slate-50 text-sm">
                          <SelectValue placeholder="اختر المفسر" />
                        </SelectTrigger>
                        <SelectContent>
                          {interpreters.length === 0 ? (
                            <SelectItem value="none" disabled>
                              لا يوجد مفسرون متاحون حالياً
                            </SelectItem>
                          ) : (
                            interpreters.map((interpreter) => (
                              <SelectItem key={interpreter.id} value={interpreter.id}>
                                <div className="flex items-center justify-between gap-3">
                                  <span>{interpreter.fullName || interpreter.email}</span>
                                  <span className="text-xs text-slate-400">
                                    {interpreter.isAvailable ? "متاح" : "غير متاح"} • {interpreter.totalInterpretations} تفسير
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>

                      <Button
                        onClick={() => handleAssign(dream.id)}
                        disabled={saving}
                        className="rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-amber-300 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-70"
                      >
                        {saving ? "جاري الإسناد..." : "إسناد إلى المفسر"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-lg backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">رؤى تم إسنادها</h2>
            <Badge variant="outline" className="rounded-full border-none bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              {assignedDreams.length} رؤى
            </Badge>
          </div>

          {assignedDreams.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-6 text-sm text-slate-500 text-center">
              لم يتم إسناد أي رؤى بعد.
            </div>
          ) : (
            <div className="space-y-4">
              {assignedDreams.map((dream) => (
                <Card key={dream.id} className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{dream.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {dream.dreamer.fullName || dream.dreamer.email} •{" "}
                        {new Date(dream.createdAt).toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <p className="mt-2 text-xs leading-6 text-slate-500 line-clamp-3">{dream.content}</p>
                    </div>
                    <div className="rounded-2xl bg-sky-50/80 px-4 py-3 text-right">
                      <p className="text-xs text-slate-500">المفسر المسؤول</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {dream.interpreter?.fullName || dream.interpreter?.email || "غير معروف"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">الحالة الحالية: {dream.status}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNavigation />
    </div>
  )
}

