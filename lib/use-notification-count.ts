"use client"

import { useCallback, useEffect, useState } from "react"
import { fetchUnreadNotificationCount } from "@/lib/notifications"

export function useNotificationCount(enabled = true) {
  const [count, setCount] = useState(0)

  const refresh = useCallback(async () => {
    if (!enabled) return

    try {
      setCount(await fetchUnreadNotificationCount())
    } catch (error) {
      console.error("[Notifications] Count fetch error:", error)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    refresh()
    const intervalId = window.setInterval(refresh, 60 * 1000)
    return () => window.clearInterval(intervalId)
  }, [enabled, refresh])

  return { count, setCount, refresh }
}
