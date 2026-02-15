"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, fetchWithAuth } from "@/lib/api-client"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { ArrowRight, Trash2, Eye, EyeOff, Plus } from "lucide-react"
import { PageLoader } from "@/components/ui/preloader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog } from "@/components/ui/dialog"

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

  // Create user dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "dreamer",
    isAvailable: true,
  })

  // Delete confirmation state
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

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

      const response = await fetchWithAuth(`/api/admin/users/${userId}`, {
        method: "PATCH",
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

  const handleCreateUser = async () => {
    try {
      setCreating(true)
      setFormError(null)

      // Validation
      if (!createForm.email || !createForm.password) {
        setFormError("البريد الإلكتروني وكلمة المرور مطلوبان")
        setCreating(false)
        return
      }

      if (createForm.password.length < 6) {
        setFormError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
        setCreating(false)
        return
      }

      const response = await fetchWithAuth("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(createForm),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || 'فشل إنشاء المستخدم')
      }

      const data = await response.json()
      setUsers((prev) => [data.user, ...prev])
      setFormSuccess('تم إنشاء المستخدم بنجاح')
      setShowCreateDialog(false)
      
      // Reset form
      setCreateForm({
        email: '',
        password: '',
        fullName: '',
        role: 'dreamer',
        isAvailable: true,
      })
    } catch (error) {
      console.error('[Admin Users] Create error:', error)
      setFormError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return

    try {
      setDeleting(true)
      setFormError(null)

      const response = await fetchWithAuth(`/api/admin/users/${deleteConfirmUser.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || 'فشل حذف المستخدم')
      }

      setUsers((prev) => prev.filter((u) => u.id !== deleteConfirmUser.id))
      setFormSuccess('تم حذف المستخدم بنجاح')
      setDeleteConfirmUser(null)
    } catch (error) {
      console.error('[Admin Users] Delete error:', error)
      setFormError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع')
    } finally {
      setDeleting(false)
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
        
        const response = await fetchWithAuth("/api/admin/users")

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
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <DashboardHeader />

      <main className="mx-auto mt-6 w-full max-w-6xl min-w-0 px-4 overflow-x-hidden">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.back()}
              className="shrink-0 rounded-full bg-white/70 p-2 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-sky-600"
            >
              <ArrowRight size={22} />
            </button>
            <h1 className="min-w-0 truncate text-xl font-bold text-slate-900 sm:text-2xl">إدارة المستخدمين</h1>
          </div>
          <button
            onClick={() => {
              setFormError(null)
              setFormSuccess(null)
              setShowCreateDialog(true)
            }}
            className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-amber-400 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Plus size={18} />
            <span>إضافة مستخدم</span>
          </button>
        </div>

        {formError && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{formError}</div>
        )}

        {formSuccess && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {formSuccess}
          </div>
        )}

        <div className="min-w-0 overflow-hidden rounded-3xl border border-sky-100 bg-white/95 shadow-lg backdrop-blur">
          <div
            className="w-full min-w-0 overflow-x-auto overflow-y-visible"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <table className="min-w-full divide-y divide-sky-100 text-right" style={{ minWidth: "max-content" }}>
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
                        <div className="flex items-center gap-3">
                          <button
                            className="text-sky-600 transition hover:text-amber-400"
                            onClick={() => startEditing(user)}
                          >
                            تعديل
                          </button>
                          <button
                            className="text-rose-600 transition hover:text-rose-700"
                            onClick={() => {
                              setFormError(null)
                              setFormSuccess(null)
                              setDeleteConfirmUser(user)
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create User Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false)
          setShowPassword(false)
        }}
        title="إضافة مستخدم جديد"
        actions={
          <>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setShowCreateDialog(false)
                setShowPassword(false)
              }}
              disabled={creating}
            >
              إلغاء
            </Button>
            <Button
              className="rounded-full bg-gradient-to-r from-sky-500 to-amber-400 text-white"
              onClick={handleCreateUser}
              disabled={creating}
            >
              {creating ? "جارٍ الإنشاء..." : "إنشاء"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              البريد الإلكتروني *
            </label>
            <Input
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              placeholder="example@email.com"
              className="rounded-full"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              كلمة المرور *
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="********"
                className="rounded-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">الحد الأدنى 6 أحرف</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">الاسم الكامل</label>
            <Input
              type="text"
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
              placeholder="أدخل الاسم الكامل"
              className="rounded-full"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">الدور *</label>
            <Select
              value={createForm.role}
              onValueChange={(value) => setCreateForm({ ...createForm, role: value })}
            >
              <SelectTrigger className="rounded-full">
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dreamer">رائي</SelectItem>
                <SelectItem value="interpreter">مفسر</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
                <SelectItem value="super_admin">مدير رئيسي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="create-available"
              checked={createForm.isAvailable}
              onChange={(e) => setCreateForm({ ...createForm, isAvailable: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-sky-600"
            />
            <label htmlFor="create-available" className="text-sm font-medium text-slate-700">
              متاح
            </label>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmUser}
        onClose={() => setDeleteConfirmUser(null)}
        title="تأكيد الحذف"
        actions={
          <>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setDeleteConfirmUser(null)}
              disabled={deleting}
            >
              إلغاء
            </Button>
            <Button
              className="rounded-full bg-rose-600 text-white hover:bg-rose-700"
              onClick={handleDeleteUser}
              disabled={deleting}
            >
              {deleting ? "جارٍ الحذف..." : "حذف"}
            </Button>
          </>
        }
      >
        <div>
          <p className="mb-2 text-slate-700">
            هل أنت متأكد من حذف المستخدم <strong>{deleteConfirmUser?.email}</strong>؟
          </p>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-semibold">⚠️ تحذير:</p>
            <p className="mt-1">
              سيتم حذف جميع البيانات المرتبطة بهذا المستخدم بشكل نهائي (الأحلام، الرسائل، المدفوعات، إلخ).
              هذا الإجراء لا يمكن التراجع عنه.
            </p>
          </div>
        </div>
      </Dialog>

      <BottomNavigation />
    </div>
  )
}
