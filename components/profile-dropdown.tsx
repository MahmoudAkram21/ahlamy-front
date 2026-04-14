"use client"

import { LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { getCurrentUser, logout, type Profile } from "@/lib/api-client"

interface ProfileDropdownProps {
  onClose: () => void
}

export function ProfileDropdown({ onClose }: ProfileDropdownProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUser = await getCurrentUser()

        if (currentUser?.profile) {
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

  return (
    <div className="absolute left-0 top-[calc(100%+0.75rem)] z-[250] w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border bg-card shadow-lg">
      {loading ? (
        <div className="flex min-h-20 items-center px-4 py-4">
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      ) : (
        <div className="max-h-[calc(100dvh-5rem)] overflow-y-auto">
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-white">
                {profile?.fullName?.charAt(0) || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-semibold text-foreground">
                  {profile?.fullName || "المستخدم"}
                </h4>
                <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
          </div>

          <div className="py-2">
            <button
              onClick={() => {
                router.push("/account")
                onClose()
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-right text-foreground transition-colors hover:bg-muted"
            >
              <User size={18} />
              <span>حسابي</span>
            </button>
            <div className="my-2 border-t border-border" />
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-2 text-right text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut size={18} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
