"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, logout } from "@/lib/auth-client"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  User,
  Mail,
  Briefcase,
  Star,
  Shield,
  LogOut,
  Edit,
  Save,
  Camera,
} from "lucide-react"
import { PageLoader } from "@/components/ui/preloader"
import { buildApiUrl } from "@/lib/api-client"

interface Profile {
  id: string
  email: string
  fullName: string | null
  role: string
  avatarUrl: string | null
  bio: string | null
  isAvailable: boolean
  totalInterpretations: number
  rating: string
  isAdmin: boolean
  isSuperAdmin: boolean
  createdAt: string
  updatedAt: string
  currentPlan?: {
    id: string
    name: string
    price: string
    durationDays: number
    currency: string
    letterQuota: number | null
    audioMinutesQuota: number | null
    scope: string
  } | null
  subscription?: {
    id: string
    planId: string
    startedAt: string
    expiresAt: string | null
    lettersUsed: number
    audioMinutesUsed: number
    plan: {
      id: string
      name: string
      price: string
      currency: string
      letterQuota: number | null
      audioMinutesQuota: number | null
      durationDays: number
      scope: string
    } | null
  } | null
}

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()

  // Edit form state
  const [editedName, setEditedName] = useState("")
  const [editedBio, setEditedBio] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          console.log('[Account] No user found, redirecting to login')
          router.push('/auth/login')
          return
        }

        console.log('[Account] User loaded:', currentUser.profile.email)
        setProfile(currentUser.profile)
        setEditedName(currentUser.profile.fullName || "")
        setEditedBio(currentUser.profile.bio || "")
      } catch (error) {
        console.error('[Account] Error fetching profile:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleSave = async () => {
    if (!profile) return
    
    setSaving(true)
    try {
      const response = await fetch(buildApiUrl('/profile/update'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fullName: editedName,
          bio: editedBio,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setEditing(false)
        console.log('[Account] Profile updated successfully')
      }
    } catch (error) {
      console.error('[Account] Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً! الحد الأقصى 2MB')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار صورة صالحة')
      return
    }

    try {
      console.log('[Account] Uploading avatar...')
      
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string

        const response = await fetch(buildApiUrl('/profile/upload-avatar'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ avatar: base64 }),
        })

        if (response.ok) {
          const data = await response.json()
          setProfile({ ...profile!, avatarUrl: data.avatarUrl })
          console.log('[Account] Avatar updated successfully:', data.avatarUrl)
        } else {
          const error = await response.json()
          console.error('[Account] Upload failed:', error)
          alert('فشل تحميل الصورة: ' + (error.error || 'خطأ غير معروف'))
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('[Account] Error uploading avatar:', error)
      alert('حدث خطأ أثناء تحميل الصورة')
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (loading) {
    return <PageLoader message="جاري تحميل حسابك..." />
  }

  if (!profile) {
    return null
  }

  const roleNames = {
    dreamer: "رائي",
    interpreter: "مفسر",
    admin: "مدير",
    super_admin: "مدير رئيسي",
  }

  const activePlan = profile.subscription?.plan ?? profile.currentPlan
  const lettersLimit = activePlan?.letterQuota ?? null
  const audioLimit = activePlan?.audioMinutesQuota ?? null
  const lettersUsed = profile.subscription?.lettersUsed ?? 0
  const audioUsed = profile.subscription?.audioMinutesUsed ?? 0
  const lettersRemaining = lettersLimit !== null && lettersLimit !== undefined ? Math.max(lettersLimit - lettersUsed, 0) : null
  const audioRemaining = audioLimit !== null && audioLimit !== undefined ? Math.max(audioLimit - audioUsed, 0) : null
  const lettersPercent =
    lettersLimit && lettersLimit > 0 ? Math.min(100, Math.round((lettersUsed / lettersLimit) * 100)) : 0
  const audioPercent =
    audioLimit && audioLimit > 0 ? Math.min(100, Math.round((audioUsed / audioLimit) * 100)) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <div className="bg-gradient-to-br from-sky-600 via-sky-500 to-amber-300 text-white">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-9">
          <div className="relative mb-4">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white/20 text-4xl font-bold shadow-xl backdrop-blur">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span>{profile.fullName?.charAt(0) || "أ"}</span>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-white p-2 text-sky-600 shadow-lg transition hover:scale-110"
            >
              <Camera size={16} />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <h1 className="text-2xl font-bold">{profile.fullName || "المستخدم"}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-white/85">
            <Briefcase size={16} />
            {roleNames[profile.role as keyof typeof roleNames] || profile.role}
          </p>
        </div>
      </div>

      <div className="-mt-8 mx-auto max-w-2xl px-4">
        {/* Stats Cards */}
        {profile.role === 'interpreter' && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            <Card className="rounded-2xl border border-sky-100 bg-white/95 p-5 text-center shadow-lg backdrop-blur">
              <div className="text-3xl font-bold text-sky-600">{profile.totalInterpretations}</div>
              <div className="mt-1 text-sm text-slate-600">تفسير مكتمل</div>
            </Card>
            <Card className="rounded-2xl border border-amber-100 bg-white/95 p-5 text-center shadow-lg backdrop-blur">
              <div className="flex items-center justify-center gap-1 text-3xl font-bold text-amber-500">
                {profile.rating} <Star size={24} fill="currentColor" />
              </div>
              <div className="mt-1 text-sm text-slate-600">التقييم</div>
            </Card>
          </div>
        )}

        {/* Active Plan Card */}
        {activePlan && (
          <Card className="mb-6 rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">خطة الاشتراك الحالية</h2>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
                {activePlan.scope === "egypt"
                  ? "مصر"
                  : activePlan.scope === "international"
                  ? "دولي"
                  : "مخصص"}
              </span>
            </div>
            <div className="mt-4 rounded-2xl bg-sky-50/60 p-4">
              <div className="flex flex-col gap-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>اسم الخطة</span>
                  <span className="font-semibold text-slate-900">{activePlan.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>السعر</span>
                  <span className="font-semibold text-sky-600">
                    {new Intl.NumberFormat("ar-EG", {
                      style: "currency",
                      currency: activePlan.currency || "USD",
                      maximumFractionDigits: 0,
                    }).format(Number(activePlan.price))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>المدة</span>
                  <span className="font-semibold text-slate-900">{activePlan.durationDays} يوم</span>
                </div>
                {profile.subscription?.expiresAt && (
                  <div className="flex items-center justify-between">
                    <span>ينتهي في</span>
                    <span className="font-semibold text-amber-600">
                      {new Date(profile.subscription.expiresAt).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>الأحرف المستخدمة</span>
                  <span className="text-slate-700">
                    {lettersUsed.toLocaleString("ar-EG")}
                    {lettersLimit ? ` / ${lettersLimit.toLocaleString("ar-EG")}` : " (غير محدود)"}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-amber-300 transition-all"
                    style={{ width: `${lettersLimit ? lettersPercent : 100}%` }}
                  />
                </div>
                {lettersRemaining !== null && (
                  <p className="text-xs text-slate-500">
                    متبقي {lettersRemaining.toLocaleString("ar-EG")} حرف
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>دقائق التسجيل</span>
                  <span className="text-slate-700">
                    {audioUsed}
                    {audioLimit ? ` / ${audioLimit}` : " (غير محدود)"}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-sky-500 transition-all"
                    style={{ width: `${audioLimit ? audioPercent : 100}%` }}
                  />
                </div>
                {audioRemaining !== null && (
                  <p className="text-xs text-slate-500">متبقي {audioRemaining} دقيقة</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Profile Info Card */}
        <Card className="mb-6 rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-lg backdrop-blur">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <User size={20} className="text-sky-500" />
              المعلومات الشخصية
            </h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-sm font-medium text-sky-600 transition hover:text-amber-400"
              >
                <Edit size={16} />
                تعديل
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <User size={16} className="text-slate-400" />
                الاسم الكامل
              </label>
              {editing ? (
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="rounded-2xl bg-slate-50"
                  placeholder="أدخل اسمك الكامل"
                />
              ) : (
                <p className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-900">
                  {profile.fullName || "غير محدد"}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <Mail size={16} className="text-slate-400" />
                البريد الإلكتروني
              </label>
              <p className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-900">
                {profile.email}
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <Briefcase size={16} className="text-slate-400" />
                نبذة عني
              </label>
              {editing ? (
                <Textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  className="rounded-2xl bg-slate-50"
                  placeholder="أخبرنا عن نفسك..."
                  rows={3}
                />
              ) : (
                <p className="min-h-[4rem] rounded-2xl bg-slate-50 px-4 py-3 text-slate-900">
                  {profile.bio || "لا توجد نبذة"}
                </p>
              )}
            </div>

            {/* Admin Badge */}
            {(profile.isAdmin || profile.isSuperAdmin) && (
              <div className="flex items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sky-700">
                <Shield size={18} className="text-sky-500" />
                <span className="text-sm font-medium">
                  {profile.isSuperAdmin ? "مدير رئيسي" : "مدير"}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            {editing ? (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 h-12 rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-amber-300 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  {saving ? (
                    <>جاري الحفظ...</>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setEditing(false)
                    setEditedName(profile.fullName || "")
                    setEditedBio(profile.bio || "")
                  }}
                  variant="outline"
                  className="flex-1 h-12 rounded-full"
                >
                  إلغاء
                </Button>
              </div>
            ) : null}
          </div>
        </Card>

        {/* Account Details Card */}
        <Card className="mb-6 rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-lg backdrop-blur">
          <h2 className="mb-4 text-lg font-bold text-slate-900">تفاصيل الحساب</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-600">تاريخ الإنشاء</span>
              <span className="font-medium text-slate-900">
                {new Date(profile.createdAt).toLocaleDateString('ar-SA')}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 py-2">
              <span className="text-slate-600">آخر تحديث</span>
              <span className="font-medium text-slate-900">
                {new Date(profile.updatedAt).toLocaleDateString('ar-SA')}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 py-2">
              <span className="text-slate-600">الحالة</span>
              <span className={`font-medium ${profile.isAvailable ? "text-emerald-600" : "text-slate-500"}`}>
                {profile.isAvailable ? "● متاح" : "● غير متاح"}
              </span>
            </div>
          </div>
        </Card>

        {/* Delete Account */}
        <Card className="mb-6 rounded-3xl border border-rose-200 bg-rose-50/80 p-6 shadow-lg backdrop-blur">
          <h2 className="mb-3 text-lg font-bold text-rose-700">حذف الحساب</h2>
          <p className="text-sm text-rose-600">
            سيؤدي حذف حسابك إلى إزالة جميع بياناتك نهائياً، بما في ذلك الرؤى، الرسائل، والاشتراكات. لا يمكن التراجع عن هذه العملية.
          </p>
          {deleteError && (
            <div className="mt-4 rounded-2xl border border-rose-300 bg-white/60 px-4 py-3 text-sm text-rose-700">
              {deleteError}
            </div>
          )}
          <button
            onClick={async () => {
              if (deleting) return
              const confirmed = window.confirm("هل أنت متأكد من رغبتك في حذف الحساب؟ لا يمكن التراجع عن هذا الإجراء.")
              if (!confirmed) return

              try {
                setDeleting(true)
                setDeleteError(null)

                const response = await fetch(buildApiUrl('/profile/account'), {
                  method: 'DELETE',
                  credentials: 'include',
                })

                if (!response.ok) {
                  const error = await response.json().catch(() => ({}))
                  throw new Error(error?.error || 'تعذر حذف الحساب')
                }

                await logout()
                router.push('/')
              } catch (error) {
                console.error('[Account] Delete account error:', error)
                setDeleteError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع')
              } finally {
                setDeleting(false)
              }
            }}
            disabled={deleting}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleting ? 'جاري حذف الحساب...' : 'حذف الحساب نهائياً'}
          </button>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="h-14 w-full rounded-full border-2 border-rose-200 text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
        >
          <LogOut size={20} className="mr-2" />
          تسجيل الخروج
        </Button>
      </div>

      <BottomNavigation />
    </div>
  )
}

