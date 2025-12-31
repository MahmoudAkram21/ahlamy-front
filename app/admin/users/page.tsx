"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-client"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { ArrowRight } from "lucide-react"
import { buildApiUrl } from "@/lib/api-client"
import { PageLoader } from "@/components/ui/preloader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  email: string
  fullName: string | null
  role: string
  isAdmin: boolean
  isSuperAdmin: boolean
  totalInterpretations: number
  isAvailable: boolean
  rating: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [form, setForm] = useState({
    fullName: "",
    role: "dreamer",
    isAvailable: "true",
    totalInterpretations: "0",
    rating: "",
  })
  const router = useRouter()

  const startEditing = (user: User) => {
    setFormError(null)
    setFormSuccess(null)
    setEditingId(user.id)
    setForm({
      fullName: user.fullName || "",
      role: user.role,
      isAvailable: user.isAvailable ? "true" : "false",
      totalInterpretations: user.totalInterpretations != null ? String(user.totalInterpretations) : "0",
      rating: user.rating ?? "",
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setSaving(false)
    setFormError(null)
    setFormSuccess(null)
  }

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async (userId: string) => {
    try {
      setSaving(true)
      setFormError(null)
      setFormSuccess(null)

      const totalInterpretations = Number(form.totalInterpretations || 0)
      const rating = form.rating ? Number(form.rating) : 0

      if (Number.isNaN(totalInterpretations) || totalInterpretations < 0) {
        setFormError("يرجى إدخال عدد صحيح للتفاسير المنجزة")
        setSaving(false)
        return
      }

      if (Number.isNaN(rating) || rating < 0) {
        setFormError("يرجى إدخال تقييم صالح")
        setSaving(false)
        return
      }

      const payload = {
        fullName: form.fullName.trim() ? form.fullName.trim() : null,
        role: form.role,
        isAvailable: form.isAvailable === "true",
        totalInterpretations,
        rating,
      }

      const response = await fetch(buildApiUrl(`/admin/users/${userId}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || "تعذر حفظ التغييرات")
      }

      const data = await response.json()

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, ...data.profile } : user)),
      )

      setFormSuccess("تم حفظ التغييرات بنجاح")
      setEditingId(null)
    } catch (error) {
      console.error("[Admin Users] Save error:", error)
      setFormError(error instanceof Error ? error.message : "حدث خطأ غير متوقع")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('[Admin Users] Checking authentication...')
        
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          router.push("/auth/login")
          return
        }

        if (!currentUser.profile.isSuperAdmin) {
          router.push("/admin/dreams")
          return
        }

        console.log('[Admin Users] Fetching users...')
        
        const response = await fetch(buildApiUrl('/admin/users'), {
          credentials: 'include',
        })

        if (response.status === 403) {
          router.push("/admin/dreams")
          return
        }

        if (response.ok) {
          const data = await response.json()
          setUsers(data.users || [])
          console.log('[Admin Users] Loaded', data.users.length, 'users')
        }
      } catch (error) {
        console.error('[Admin Users] Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [router])

  if (loading) {
    return <PageLoader message="جاري تحميل المستخدمين..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <DashboardHeader />

      <main className="mx-auto mt-6 w-full max-w-6xl px-4">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-full bg-white/70 p-2 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-sky-600"
          >
            <ArrowRight size={22} />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">إدارة المستخدمين</h1>
        </div>

        {formError && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{formError}</div>
        )}

        {formSuccess && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {formSuccess}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white/95 shadow-lg backdrop-blur">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-sky-100 text-right">
              <thead className="bg-sky-50/80">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-600">الاسم</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-600">البريد الإلكتروني</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-600">الدور</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-600">التوفر</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-600">عدد التفاسير</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-600">التقييم</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100">
                {users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-sky-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {editingId === user.id ? (
                        <Input
                          value={form.fullName}
                          onChange={(event) => handleChange("fullName", event.target.value)}
                          className="rounded-full bg-slate-50"
                          placeholder="أدخل الاسم الكامل"
                        />
                      ) : (
                        user.fullName || "غير متوفر"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {editingId === user.id ? (
                        <Select value={form.role} onValueChange={(value) => handleChange("role", value)}>
                          <SelectTrigger className="rounded-full bg-slate-50 text-sm">
                            <SelectValue placeholder="اختر الدور" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dreamer">رائي</SelectItem>
                            <SelectItem value="interpreter">مفسر</SelectItem>
                            <SelectItem value="admin">مدير</SelectItem>
                            <SelectItem value="super_admin">مدير رئيسي</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <>
                          {user.role}
                          {user.isSuperAdmin && " (مدير رئيسي)"}
                          {user.isAdmin && !user.isSuperAdmin && " (مدير)"}
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {editingId === user.id ? (
                        <Select value={form.isAvailable} onValueChange={(value) => handleChange("isAvailable", value)}>
                          <SelectTrigger className="rounded-full bg-slate-50 text-sm">
                            <SelectValue placeholder="اختر الحالة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">متاح</SelectItem>
                            <SelectItem value="false">غير متاح</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className={user.isAvailable ? "text-emerald-600" : "text-slate-400"}>
                          {user.isAvailable ? "متاح" : "غير متاح"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {editingId === user.id ? (
                        <Input
                          type="number"
                          min={0}
                          value={form.totalInterpretations}
                          onChange={(event) => handleChange("totalInterpretations", event.target.value)}
                          className="rounded-full bg-slate-50"
                        />
                      ) : (
                        user.totalInterpretations
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {editingId === user.id ? (
                        <Input
                          type="number"
                          min={0}
                          step={0.1}
                          value={form.rating}
                          onChange={(event) => handleChange("rating", event.target.value)}
                          className="rounded-full bg-slate-50"
                        />
                      ) : (
                        user.rating || "0"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {editingId === user.id ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-amber-300 px-4 text-white shadow-md"
                            onClick={() => handleSave(user.id)}
                            disabled={saving}
                          >
                            {saving ? "جارٍ الحفظ..." : "حفظ"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={cancelEditing}
                            disabled={saving}
                          >
                            إلغاء
                          </Button>
                        </div>
                      ) : (
                        <button
                          className="text-sky-600 transition hover:text-amber-400"
                          onClick={() => startEditing(user)}
                        >
                          تعديل
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
