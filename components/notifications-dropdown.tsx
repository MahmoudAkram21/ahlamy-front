"use client"

import { useEffect, useState } from "react"
import { X, Bell, MessageSquare, Star } from "lucide-react"
import { buildApiUrl } from "@/lib/api-client"

interface NotificationsDropdownProps {
  onClose: () => void
}

interface Notification {
  id: number
  title: string
  message: string
  time: string
  type: 'dream' | 'message' | 'rating'
  isRead?: boolean
}

export function NotificationsDropdown({ onClose }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(buildApiUrl('/notifications'), {
          credentials: 'include',
        })
        
        if (response.ok) {
          const data = await response.json()
          // For now, use mock data - you can enhance this later
          setNotifications([
            {
              id: 1,
              title: "رؤية جديدة",
              message: "تم استقبال رؤية جديدة تحتاج إلى تفسير",
              time: "منذ 5 دقائق",
              type: 'dream',
              isRead: false,
            },
            {
              id: 2,
              title: "رسالة جديدة",
              message: "لديك رسالة جديدة من أحد الرائين",
              time: "منذ ساعة",
              type: 'message',
              isRead: false,
            },
          ])
        }
      } catch (error) {
        console.error('[Notifications] Error fetching:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'dream':
        return <Bell size={18} className="text-sky-500" />
      case 'message':
        return <MessageSquare size={18} className="text-sky-400" />
      case 'rating':
        return <Star size={18} className="text-amber-400" />
      default:
        return <Bell size={18} className="text-gray-500" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

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
                  className={`px-5 py-4 transition hover:bg-sky-50/80 ${
                    !notification.isRead ? "bg-sky-50/90" : "bg-white/90"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-500 shadow-inner">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                      <p className="mt-1 text-xs leading-6 text-slate-500">{notification.message}</p>
                      <p className="mt-2 text-[11px] font-medium text-slate-400">{notification.time}</p>
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
