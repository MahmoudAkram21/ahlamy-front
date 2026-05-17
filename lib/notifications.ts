import { buildApiUrl } from "@/lib/api-client"

export type NotificationType =
  | "admin_broadcast"
  | "dream_assigned"
  | "dream_message"
  | "dream_submitted"
  | "dream_status_changed"
  | "request_assigned"
  | "request_status_changed"

export interface AppNotification {
  id: string
  type: NotificationType
  message: string
  isRead: boolean
  referenceId: string | null
  createdAt: string
}

export async function fetchNotifications() {
  const response = await fetch(buildApiUrl("/notifications"), {
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch notifications")
  }

  const data = await response.json()
  return (data.notifications || []) as AppNotification[]
}

export async function fetchUnreadNotificationCount() {
  const response = await fetch(buildApiUrl("/notifications/count"), {
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch notification count")
  }

  const data = await response.json()
  return Number(data.unreadCount || 0)
}

export async function markNotificationRead(id: string) {
  const response = await fetch(buildApiUrl(`/notifications/${id}/read`), {
    method: "PATCH",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Failed to mark notification as read")
  }
}

export async function markAllNotificationsRead() {
  const response = await fetch(buildApiUrl("/notifications/read-all"), {
    method: "PATCH",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Failed to mark notifications as read")
  }
}

export function getNotificationTitle(type: NotificationType) {
  switch (type) {
    case "admin_broadcast":
      return "إشعار من الإدارة"
    case "dream_assigned":
    case "request_assigned":
      return "تعيين جديد"
    case "dream_message":
      return "رسالة جديدة"
    case "dream_submitted":
      return "رؤية جديدة"
    case "dream_status_changed":
    case "request_status_changed":
      return "تحديث الحالة"
    default:
      return "إشعار"
  }
}
