"use client"

import { CheckCircle2, RotateCcw } from "lucide-react"

interface DreamActionsProps {
  onMarkComplete: () => void
  onReject: () => void
  dreamStatus?: string
}

export function DreamActions({ onMarkComplete, onReject, dreamStatus }: DreamActionsProps) {
  if (dreamStatus === "interpreted" || dreamStatus === "returned") {
    return (
      <div className="px-4 pb-4">
        <div className="rounded-2xl bg-slate-100 py-3 text-center text-slate-600">
          <p className="text-sm font-medium">
            {dreamStatus === "interpreted" ? "تم تفسير هذه الرؤيا" : "تم إرجاع هذه الرؤيا"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pb-6 pt-2">
      <div className="space-y-3 rounded-3xl border border-sky-100 bg-white/95 p-4 shadow-md backdrop-blur">
        <button
          onClick={onMarkComplete}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-amber-300 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <CheckCircle2 size={20} />
          تم التفسير
        </button>
        <button
          onClick={onReject}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100"
        >
          <RotateCcw size={20} />
          إرجاع الرؤيا
        </button>
      </div>
    </div>
  )
}
