"use client"

import { LogOut, Settings, HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/auth-client"

interface HeaderMenuProps {
  onClose: () => void
}

export function HeaderMenu({ onClose }: HeaderMenuProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await logout()
      router.push("/auth/login")
      onClose()
    } catch (error) {
      console.error("[Header Menu] Sign out error:", error)
    }
  }

  return (
    <div
      className="fixed bg-card border border-border rounded-lg shadow-lg w-48 z-40"
      style={{
        top: "auto",
        left: "1rem",
        bottom: "calc(100% - 3.5rem)",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <div className="py-2">
        <button
          onClick={() => {
            router.push("/settings")
            onClose()
          }}
          className="w-full px-4 py-2 text-right flex items-center gap-3 hover:bg-muted transition-colors text-foreground"
        >
          <Settings size={18} />
          <span>الإعدادات</span>
        </button>
        <button
          onClick={() => {
            router.push("/help")
            onClose()
          }}
          className="w-full px-4 py-2 text-right flex items-center gap-3 hover:bg-muted transition-colors text-foreground"
        >
          <HelpCircle size={18} />
          <span>المساعدة</span>
        </button>
        <div className="border-t border-border my-2" />
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2 text-right flex items-center gap-3 hover:bg-destructive/10 transition-colors text-destructive"
        >
          <LogOut size={18} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  )
}
