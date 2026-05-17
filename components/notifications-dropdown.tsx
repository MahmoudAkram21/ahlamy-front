"use client"

import { useEffect, useState } from "react"
import { X, Bell, MessageSquare, Star } from "lucide-react"
import {
  type AppNotification,
  fetchNotifications,
  getNotificationTitle,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications"

interface NotificationsDropdownProps {
  onClose: () => void
  onReadStateChange?: () => void
}

export function NotificationsDropdown({ onClose, onReadStateChange }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications()
        if (cancelled) return

        setNotifications(data)

        if (data.some((notification) => !notification.isRead)) {
          await markAllNotificationsRead()
          onReadStateChange?.()
        }
      } catch (error) {
        console.error('[Notifications] Error fetching:', error)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadNotifications()
    return () => {
      cancelled = true
    }
  }, [onReadStateChange])

  const getIcon = (type: string) => {
    switch (type) {
      case 'dream_assigned':
      case 'dream_submitted':
      case 'dream_status_changed':
      case 'request_assigned':
      case 'request_status_changed':
        return <Bell size={18} className="text-sky-500" />
      case 'dream_message':
        return <MessageSquare size={18} className="text-sky-400" />
      case 'rating':
        return <Star size={18} className="text-amber-400" />
      default:
        return <Bell size={18} className="text-gray-500" />
    }
  }

  const formatTime = (value: string) =>
    new Intl.DateTimeFormat("ar-EG", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value))

  const handleNotificationClick = async (notification: AppNotification) => {
    if (notification.isRead) return

    setNotifications((prev) =>
      prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
    )

    try {
      await markNotificationRead(notification.id)
      onReadStateChange?.()
    } catch (error) {
      console.error("[Notifications] Mark read error:", error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="absolute left-0 top-[calc(100%+0.75rem)] z-[300] w-[min(22rem,calc(100vw-2rem))]">
      <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white/95 shadow-xl backdrop-blur">
        <div className="flex items-center justify-between bg-gradient-to-r from-sky-500 via-sky-400 to-amber-300 px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 shadow-inner">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold">الإشعارات</h3>
              <p className="text-[11px] text-white/80">{unreadCount > 0 ? "لديك تنبيهات جديدة" : "لا توجد تنبيهات جديدة"}</p>
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
            <ul className="divide-y divide-sky-50">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-5 py-4 transition hover:bg-sky-50/80 ${
                    !notification.isRead ? "bg-sky-50/90" : "bg-white/90"
                  } cursor-pointer`}
                >
                  <div className="flex gap-3">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-500 shadow-inner">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 text-right">
                      <div className="flex items-start justify-between gap-3">
                        {!notification.isRead ? <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" /> : <span />}
                        <p className="text-sm font-semibold text-slate-900">{getNotificationTitle(notification.type)}</p>
                      </div>
                      <p className="mt-1 text-xs leading-6 text-slate-500">{notification.message}</p>
                      <p className="mt-2 text-[11px] font-medium text-slate-400">{formatTime(notification.createdAt)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
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
