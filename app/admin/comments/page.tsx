"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, fetchWithAuth } from "@/lib/api-client"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { PageLoader } from "@/components/ui/preloader"
import { MessageSquare } from "lucide-react"

interface Comment {
  id: string
  content: string
  isApproved: boolean
  createdAt: string
  user?: { id: string; fullName: string | null; email: string }
  dream?: { id: string; title: string }
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      try {
        const user = await getCurrentUser()
        if (!user || user.profile.role !== "super_admin") {
          router.push("/dashboard")
          return
        }
        const res = await fetchWithAuth("/api/admin/comments")
        if (res.ok) {
          const data = await res.json()
          setComments(data.comments || [])
        }
      } catch (e) {
        console.error("[Admin Comments] Load error:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const toggleApproved = async (comment: Comment) => {
    setTogglingId(comment.id)
    try {
      const res = await fetchWithAuth(`/api/admin/comments/${comment.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isApproved: !comment.isApproved }),
      })
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === comment.id ? { ...c, isApproved: !comment.isApproved } : c
          )
        )
      }
    } catch (e) {
      console.error("[Admin Comments] Toggle error:", e)
    } finally {
      setTogglingId(null)
    }
  }

  if (loading) {
    return <PageLoader message="جاري تحميل التعليقات..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <DashboardHeader />

      <main className="mx-auto mt-6 w-full max-w-4xl px-4">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-sky-100 p-2">
            <MessageSquare className="h-6 w-6 text-sky-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">آراء العملاء</h1>
            <p className="text-sm text-slate-500">
              اختر التعليقات التي تظهر في قسم «اراء عملاء احلامي» في الصفحة الرئيسية
            </p>
          </div>
        </div>

        {comments.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-sky-200 bg-white/80 p-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-sky-300" />
            <p className="text-slate-600">لا توجد تعليقات من الرائيين بعد.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div
                key={c.id}
                className="rounded-3xl border border-sky-100 bg-white/95 p-5 shadow-md"
              >
                <p className="text-right text-sm leading-relaxed text-slate-700">{c.content}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-sky-100 pt-3">
                  <span className="text-xs text-slate-500">
                    {c.user?.fullName || c.user?.email || "—"} ·{" "}
                    {c.dream?.title ? `رؤيا: ${c.dream.title}` : ""} ·{" "}
                    {new Date(c.createdAt).toLocaleDateString("ar-SA", { dateStyle: "short" })}
                  </span>
                  <label className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-600">
                      {c.isApproved ? "يظهر في الصفحة الرئيسية" : "مخفي"}
                    </span>
                    <button
                      type="button"
                      disabled={togglingId === c.id}
                      onClick={() => toggleApproved(c)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 disabled:opacity-50 ${
                        c.isApproved ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                      role="switch"
                      aria-checked={c.isApproved}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                          c.isApproved ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
