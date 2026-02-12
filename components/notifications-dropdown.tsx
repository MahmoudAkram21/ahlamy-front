"use client"

import { useEffect, useState } from "react"
import { X, Bell, MessageSquare, Star, Heart, UserPlus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import { apiFetch } from "@/lib/api-client"

interface NotificationsDropdownProps {
  onClose: () => void
}

/** Matches backend Notification model */
interface Notification {
  id: string
  type: "LIKE" | "COMMENT" | "FOLLOW" | "SYSTEM"
  title: string
  message: string
  isRead: boolean
  createdAt: string
  entityId?: string | null
  entityType?: string | null
}

interface NotificationsResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
  limit: number
  offset: number
}

function formatTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: ar,
    })
  } catch {
    return dateStr
  }
}

export function NotificationsDropdown({ onClose }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch<NotificationsResponse>("/notifications", {
        method: "GET",
      })
      setNotifications(data.notifications ?? [])
      setUnreadCount(data.unreadCount ?? 0)
    } catch (error) {
      console.error("[Notifications] Error fetching:", error)
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAsRead = async (id: string) => {
    const prev = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    setNotifications(prev)
    setUnreadCount((c) => Math.max(0, c - 1))
    try {
      await apiFetch<{ ok: boolean }>(`/notifications/${id}/read`, { method: "PATCH" })
    } catch (e) {
      console.error("[Notifications] Mark read failed:", e)
      fetchNotifications()
    }
  }

  const markAllAsRead = async () => {
    if (unreadCount === 0) return
    setNotifications((list) => list.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
    try {
      await apiFetch<{ ok: boolean; updatedCount: number }>("/notifications/read-all", {
        method: "PATCH",
      })
    } catch (e) {
      console.error("[Notifications] Mark all read failed:", e)
      fetchNotifications()
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return <Heart size={18} className="text-rose-500" />
      case "COMMENT":
        return <MessageSquare size={18} className="text-sky-400" />
      case "FOLLOW":
        return <UserPlus size={18} className="text-emerald-500" />
      case "SYSTEM":
      default:
        return <Bell size={18} className="text-amber-500" />
    }
  }

  return (
    <div className="fixed right-4 top-24 z-[250] w-[calc(100vw-2rem)] max-w-sm">
      <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white/95 shadow-xl backdrop-blur">
        <div className="flex items-center justify-between bg-gradient-to-r from-sky-500 via-sky-400 to-amber-300 px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 shadow-inner">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold">الإشعارات</h3>
              <p className="text-[11px] text-white/80">
                {unreadCount > 0 ? "لديك تنبيهات جديدة" : "لا توجد تنبيهات جديدة"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/30 bg-white/10 p-1.5 transition hover:bg-white/20"
            aria-label="إغلاق الإشعارات"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-slate-500">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-r-transparent" />
              <p className="text-sm">جاري التحميل...</p>
            </div>
          ) : notifications.length > 0 ? (
            <>
              {unreadCount > 0 && (
                <div className="border-b border-sky-50 px-4 py-2 text-left">
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-sky-600 hover:text-sky-700"
                  >
                    تعليم الكل كمقروء
                  </button>
                </div>
              )}
              <ul className="divide-y divide-sky-50">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && !notification.isRead) {
                        e.preventDefault()
                        markAsRead(notification.id)
                      }
                    }}
                    className={`px-5 py-4 transition hover:bg-sky-50/80 ${
                      !notification.isRead ? "bg-sky-50/90" : "bg-white/90"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-500 shadow-inner">
                        {getIcon(notification.type)}
                      </div>
                      <div className="min-w-0 flex-1 text-right">
                        <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                        <p className="mt-1 text-xs leading-6 text-slate-500">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-[11px] font-medium text-slate-400">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-slate-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-400">
                <Bell size={24} />
              </div>
              <p className="text-sm">لا توجد إشعارات جديدة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
