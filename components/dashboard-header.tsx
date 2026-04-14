"use client"

import { useEffect, useState } from "react"
import { Bell, Menu, Sun } from "lucide-react"

import { NotificationsDropdown } from "./notifications-dropdown"
import { ProfileDropdown } from "./profile-dropdown"
import { SideMenu } from "./side-menu"
import { getCurrentUser, type Profile } from "@/lib/api-client"

export function DashboardHeader() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleProfileToggle = () => {
    setProfileOpen((prev) => {
      const next = !prev
      if (next) {
        setNotificationsOpen(false)
      }
      return next
    })
  }

  const handleNotificationsToggle = () => {
    setNotificationsOpen((prev) => {
      const next = !prev
      if (next) {
        setProfileOpen(false)
      }
      return next
    })
  }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const current = await getCurrentUser()
        if (current?.profile) {
          setProfile(current.profile)
        }
      } catch (error) {
        console.error("[Header] Unable to load profile:", error)
      }
    }

    loadProfile()
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md">
        <div className="bg-gradient-to-r from-sky-500 via-sky-400 to-amber-200 text-white shadow-lg dark:from-sky-700 dark:via-sky-800 dark:to-amber-500">
          <div className="mx-auto relative flex min-h-20 max-w-screen-lg items-center justify-center px-4 py-3">
            <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
             <div className="relative">
              {/* Profile */ }
            <button
              onClick={handleProfileToggle}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/60 bg-white/20 transition hover:bg-white/30"
              aria-label="الملف الشخصي"
            >
              <span>{profile?.fullName?.charAt(0) || "أ"}</span>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border border-white bg-emerald-300" />
            </button>
            {profileOpen && <ProfileDropdown onClose={() => setProfileOpen(false)} />}
            </div>

              <div className="relative">
                {/* Notifications */ }
              <button
                onClick={handleNotificationsToggle}
                className="relative rounded-full bg-white/10 p-2 transition hover:bg-white/20"
                aria-label="الإشعارات"
              >
                <Bell size={22} className="text-white" />
                <span className="absolute -top-1 -right-1 h-2 w-2 animate-ping rounded-full bg-amber-300" />
              </button>
              {notificationsOpen && <NotificationsDropdown onClose={() => setNotificationsOpen(false)} />}
              </div>
            </div>
            <div className="flex flex-col items-center px-16 text-center sm:px-24">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <Sun size={18} className="text-amber-200" />
                </div>
                <h1 className="text-xl font-extrabold tracking-wide drop-shadow-sm">احلامي</h1>
              </div>
              <p className="mt-1 text-xs text-white/80">
                {profile?.fullName ? `مرحبا، ${profile.fullName}` : "مساحتك لتفسير الأحلام"}
              </p>
            </div>

        

            <div className="absolute right-4 top-1/2 -translate-y-1/2">
             {/* navigation side menu*/ }
              <button
                onClick={() => setMenuOpen(true)}
                className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
                aria-label="القائمة الرئيسية"
              >
                <Menu size={22} />
              </button>
            </div>
            
          </div>
        </div>
      </header>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} profile={profile} />
    </>
  )
}
