"use client"

import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface DreamHeaderProps {
  dreamId: string
}

export function DreamHeader({ dreamId }: DreamHeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 backdrop-blur-lg">
      <div className="flex items-center justify-between bg-gradient-to-r from-sky-600 via-sky-500 to-amber-300 px-4 py-4 text-white shadow-md">
        <button
          onClick={() => router.back()}
          className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
          aria-label="عودة"
        >
          <ArrowRight size={22} />
        </button>
        <div className="text-center">
          <p className="text-xs text-white/80">رؤيا رقم</p>
          <h1 className="text-lg font-semibold tracking-wide">#{dreamId.slice(0, 6)}</h1>
        </div>
        <div className="w-10" />
      </div>
    </header>
  )
}
