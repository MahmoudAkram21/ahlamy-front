"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { InterpreterStatusCard } from "@/components/interpreter-status-card"
import { DashboardStats } from "@/components/dashboard-stats"
import { SuperAdminStats } from "@/components/super-admin-stats"
import { PendingDreamsList } from "@/components/pending-dreams-list"
import { Button } from "@/components/ui/button"
import { apiFetch, getCurrentUser } from "@/lib/api-client"
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
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0)
  const router = useRouter()

  const fetchNotificationUnreadCount = useCallback(async () => {
    try {
      const data = await apiFetch<{ unreadCount: number }>("/api/notifications/unread-count")
      setNotificationUnreadCount(data.unreadCount ?? 0)
    } catch {
      setNotificationUnreadCount(0)
    }
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) { 
          //clear all auth cookies to ensure clean state
          

          console.log('[Dashboard] No user found, redirecting to login')
          router.push('/auth/login')
          return
        }

        console.log('[Dashboard] User loaded:', currentUser.profile.email)
        setProfile(currentUser.profile)
      } catch (error) {
        console.error('[Dashboard] Error fetching profile:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  useEffect(() => {
    if (profile?.role === "dreamer") {
      fetchNotificationUnreadCount()
    }
  }, [profile?.role, fetchNotificationUnreadCount])

  const handleToggleAvailability = async () => {
    try {
      if (!profile) return

      const newAvailability = !profile.isAvailable

      const response = await fetch(buildApiUrl('/profile/availability'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          isAvailable: newAvailability,
        }),
      })

      if (response.ok) {
        setProfile({ ...profile, isAvailable: newAvailability })
        console.log('[Dashboard] Availability updated:', newAvailability)
      } else {
        console.error('[Dashboard] Failed to update availability')
      }
    } catch (error) {
      console.error('[Dashboard] Error updating availability:', error)
    }
  }

  if (loading) {
    return <PageLoader message="جاري تحميل لوحة التحكم..." />
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-amber-50">
        <div className="rounded-3xl bg-white/90 px-8 py-6 text-slate-600 shadow-lg backdrop-blur">
          جاري تحميل البيانات...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <DashboardHeader />

      <main className="mx-auto mt-6 flex w-full max-w-4xl flex-col gap-6 px-4">
        {/* Dreamer: show banner when they have unread notifications */}
        {profile.role === "dreamer" && notificationUnreadCount > 0 && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    لديك {notificationUnreadCount} إشعار{notificationUnreadCount === 1 ? "" : "ات"} جديد{notificationUnreadCount === 1 ? "" : "ة"}
                  </p>
                  <p className="text-xs text-slate-500">اضغط على أيقونة الجرس أعلاه لعرضها</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Only show interpreter status card if user is an interpreter */}
        {profile.role === 'interpreter' && (
          <InterpreterStatusCard
            name={profile.fullName || "المفسر"}
            status={profile.isAvailable ? "available" : "offline"}
            dreamsInterpreted={profile.totalInterpretations || 0}
          />
        )}

        {/* Availability toggle - only for interpreters */}
        {profile.role === 'interpreter' && (
          <section className="rounded-3xl border border-sky-100 bg-white/90 p-4 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">حالة التوفر</h2>
                <p className="text-sm text-slate-500">
                  يمكنك التحكم في استقبال طلبات التفسير بحسب وقتك وروتينك اليومي.
                </p>
              </div>
              <Button
                onClick={handleToggleAvailability}
                className="w-full rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-amber-300 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl md:w-auto"
              >
                {profile.isAvailable ? "إيقاف استقبال الرؤى" : "استئناف استقبال الرؤى"}
              </Button>
            </div>
          </section>
        )}

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {profile.role === "super_admin" ? "إحصائيات النظام" : "إحصائياتي"}
            </h2>
            {profile.role === "interpreter" && (
              <p className="mt-0.5 text-xs text-slate-500">
                الرؤى المُعيَّنة لك فقط
              </p>
            )}
          </div>
          <div className="rounded-3xl border border-sky-100 bg-white/95 p-4 shadow-lg backdrop-blur">
            {profile.role === "super_admin" ? (
              <SuperAdminStats />
            ) : (
              <DashboardStats role={profile.role} />
            )}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">الرؤى المعلقة</h2>
            <span className="text-xs font-semibold text-sky-600">آخر ٥ رؤى بانتظار الرد</span>
          </div>
          <PendingDreamsList />
        </section>
      </main>

      <BottomNavigation />
    </div>
  )
}
