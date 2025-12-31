"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser } from "@/lib/auth-client"
import { PageLoader } from "@/components/ui/preloader"
import { buildApiUrl } from "@/lib/api-client"

export default function NewDreamPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [dreamDate, setDreamDate] = useState("")
  const [mood, setMood] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()

        if (!currentUser) {
          console.log('[New Dream] No user found, redirecting to login')
          router.push("/auth/login")
          return
        }

        console.log('[New Dream] User authenticated:', currentUser.profile.email)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('[New Dream] Auth check failed:', error)
        router.push("/auth/login")
      } finally {
        setCheckingAuth(false)
      }
    }

    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(buildApiUrl("/dreams"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          description: content, // Backend expects 'description' not 'content'
          dream_date: dreamDate,
          mood,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || "فشل في إنشاء الرؤيا"
        throw new Error(errorMessage)
      }

      const dream = await response.json()
      const letterCount = Array.from(content).length
      console.log('[New Dream] Dream created:', dream.id)
      // Redirect to plans page with letter count to highlight matching plans
      router.push(`/plans?dreamId=${dream.id}&letterCount=${letterCount}`)
    } catch (err) {
      console.error('[New Dream] Error creating dream:', err)
      setError(err instanceof Error ? err.message : "حدث خطأ ما")
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return <PageLoader message="جاري التحقق من الحساب..." />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <header className="rounded-b-[2rem] bg-gradient-to-br from-sky-600 via-sky-500 to-amber-300 px-4 py-10 text-center text-white shadow-xl">
        <h1 className="text-3xl font-bold">شارك رؤيتك</h1>
        <p className="mt-2 text-sm text-white/80">كل التفاصيل تساعد مفسرينا على قراءة رؤاك بدقة أكبر.</p>
      </header>

      <main className="mx-auto mt-6 w-full max-w-3xl px-4">
        <Card className="rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-lg backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">عنوان الرؤيا</label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: رأيت نورًا ساطعًا في السماء"
                required
                disabled={loading}
                className="rounded-2xl bg-slate-50"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">تفاصيل الرؤيا</label>
                <span className="text-xs font-medium text-slate-500">
                  عدد الأحرف: <span className="text-sky-600">{Array.from(content).length}</span>
                </span>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="اكتب تفاصيل رؤيتك بالكامل..."
                required
                disabled={loading}
                rows={6}
                className="rounded-3xl bg-slate-50"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">تاريخ الرؤيا</label>
                <Input
                  type="date"
                  value={dreamDate}
                  onChange={(e) => setDreamDate(e.target.value)}
                  disabled={loading}
                  className="rounded-2xl bg-slate-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">الحالة المزاجية</label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className="rounded-2xl bg-slate-50">
                    <SelectValue placeholder="اختر الحالة المزاجية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="happy">سعيد</SelectItem>
                    <SelectItem value="sad">حزين</SelectItem>
                    <SelectItem value="peaceful">هادئ</SelectItem>
                    <SelectItem value="anxious">قلق</SelectItem>
                    <SelectItem value="confused">مرتبك</SelectItem>
                    <SelectItem value="determined">مصمم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-amber-300 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
              disabled={loading}
            >
              {loading ? "جاري الإرسال..." : "إرسال الرؤيا"}
            </Button>
          </form>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  )
}
