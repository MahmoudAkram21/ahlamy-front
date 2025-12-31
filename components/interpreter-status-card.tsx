"use client"

import { CheckCircle2, User } from "lucide-react"

interface InterpreterStatusCardProps {
  name: string
  status: "available" | "busy" | "offline"
  dreamsInterpreted: number
}

export function InterpreterStatusCard({ name, status, dreamsInterpreted }: InterpreterStatusCardProps) {
  const statusStyles = {
    available: "bg-emerald-100/80 text-emerald-700",
    busy: "bg-amber-100/80 text-amber-700",
    offline: "bg-slate-100 text-slate-600",
  }

  const statusLabels = {
    available: "متاح",
    busy: "مشغول",
    offline: "غير متصل",
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-sky-400 to-amber-300 p-6 text-white shadow-xl">
      <div className="absolute right-6 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm text-white/80">المفسر</p>
          <h2 className="text-2xl font-bold">{name}</h2>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${statusStyles[status]}`}>
            <CheckCircle2 size={18} className="text-emerald-500" />
            <span>{statusLabels[status]}</span>
          </div>
          <p className="text-xs text-white/80">تم تفسير {dreamsInterpreted} رؤية</p>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 shadow-inner">
          <User size={30} />
        </div>
      </div>
    </div>
  )
}
