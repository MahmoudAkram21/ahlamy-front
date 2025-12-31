"use client"

import { LogOut, User, Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getCurrentUser, logout } from "@/lib/auth-client"

interface ProfileDropdownProps {
  onClose: () => void
}

export function ProfileDropdown({ onClose }: ProfileDropdownProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUser = await getCurrentUser()

        if (currentUser) {
          setProfile(currentUser.profile)
        }
      } catch (error) {
        console.error("[Profile Dropdown] Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSignOut = async () => {
    try {
      await logout()
      router.push("/auth/login")
      onClose()
    } catch (error) {
      console.error("[Profile Dropdown] Sign out error:", error)
    }
  }

  if (loading) {
    return (
      <div className="fixed top-12 right-0 bg-card border border-border rounded-lg shadow-lg w-64 z-40 p-4">
        <p className="text-muted-foreground text-sm">جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div
      className="fixed bg-card border border-border rounded-lg shadow-lg w-64 z-40"
      style={{
        top: "auto",
        right: "1rem",
        bottom: "calc(100% - 3.5rem)",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      {/* Profile Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            {profile?.fullName?.charAt(0) || "U"}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground text-sm">{profile?.fullName || "المستخدم"}</h4>
            <p className="text-xs text-muted-foreground">{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <button
          onClick={() => {
            router.push("/account")
            onClose()
          }}
          className="w-full px-4 py-2 text-right flex items-center gap-3 hover:bg-muted transition-colors text-foreground"
        >
          <User size={18} />
          <span>حسابي</span>
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
