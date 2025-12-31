"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { buildApiUrl } from "@/lib/api-client"

interface Dream {
  id: string
  title: string
  status: string
  created_at: string
  dreamer_id: string
}

export function PendingDreamsList() {
  const [dreams, setDreams] = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDreams = async () => {
      try {
        const response = await fetch(buildApiUrl("/dreams"), {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          // Filter for pending dreams
          const pending = data.filter((d: Dream) => d.status === "new" || d.status === "pending_inquiry")
          setDreams(pending.slice(0, 5))
        }
      } catch (error) {
        console.error("Error fetching dreams:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDreams()
  }, [])

  if (loading) {
    return <div className="py-8 text-center text-slate-500">جاري التحميل...</div>
  }

  if (dreams.length === 0) {
    return <div className="py-8 text-center text-slate-500">لا توجد رؤى قيد الانتظار</div>
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      new: { label: "جديدة", className: "bg-sky-100 text-sky-700" },
      pending_inquiry: { label: "قيد الاستفسار", className: "bg-amber-100 text-amber-700" },
    }
    return statusMap[status] || { label: status, className: "bg-slate-100 text-slate-600" }
  }

  return (
    <div className="space-y-3">
      {dreams.map((dream) => {
        const status = getStatusBadge(dream.status)
        return (
          <Link key={dream.id} href={`/dream/${dream.id}`}>
            <Card className="group relative overflow-hidden rounded-3xl border border-sky-100 bg-white/90 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-500 to-amber-300 opacity-75" />
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-slate-900">{dream.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(dream.created_at).toLocaleDateString("ar-SA", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <Badge variant="outline" className={`${status.className} border-none rounded-full px-3 py-1 text-xs font-semibold`}>
                  {status.label}
                </Badge>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
