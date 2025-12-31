"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Bell, Menu, Sun } from "lucide-react"

import { NotificationsDropdown } from "./notifications-dropdown"
import { ProfileDropdown } from "./profile-dropdown"
import { SideMenu } from "./side-menu"
import { getCurrentUser, type Profile } from "@/lib/auth-client"

export function DashboardHeader() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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

  const initials = useMemo(() => profile?.fullName?.charAt(0) ?? "أ", [profile?.fullName])

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md">
        <div className="bg-gradient-to-r from-sky-500 via-sky-400 to-amber-200 dark:from-sky-700 dark:via-sky-800 dark:to-amber-500 text-white shadow-lg">
          <div className="mx-auto flex items-center justify-between px-4 py-3 max-w-screen-lg">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMenuOpen(true)}
                className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
                aria-label="القائمة الرئيسية"
              >
                <Menu size={22} />
              </button>

              <button
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className="relative rounded-full bg-white/10 p-2 transition hover:bg-white/20"
                aria-label="الإشعارات"
              >
                <Bell size={22} className="text-white" />
                <span className="absolute -top-1 -right-1 h-2 w-2 animate-ping rounded-full bg-amber-300" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
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

            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/60 bg-white/20 transition hover:bg-white/30"
              aria-label="الملف الشخصي"
            >
              {profile?.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt="صورة الحساب"
                  width={40}
                  height={40}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-base font-semibold text-white">{initials}</span>
              )}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border border-white bg-emerald-300" />
            </button>
          </div>
        </div>

        {notificationsOpen && <NotificationsDropdown onClose={() => setNotificationsOpen(false)} />}
        {profileOpen && <ProfileDropdown onClose={() => setProfileOpen(false)} />}
      </header>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} profile={profile} />
    </>
  )
}
