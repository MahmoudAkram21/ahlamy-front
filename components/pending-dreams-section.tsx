"use client"

import { Clock, User } from "lucide-react"

interface PendingDream {
  id: string
  dreamer: string
  title: string
  submittedAt: string
  priority: "high" | "medium" | "low"
}

export function PendingDreamsSection({ dreams }: { dreams: PendingDream[] }) {
  const priorityColors = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-blue-100 text-blue-700",
  }

  const priorityLabels = {
    high: "عاجل",
    medium: "متوسط",
    low: "عادي",
  }

  return (
    <div className="space-y-4 px-4">
      <h3 className="text-lg font-bold text-foreground">الرؤى المعلقة</h3>
      <div className="space-y-3">
        {dreams.map((dream) => (
          <div
            key={dream.id}
            className="bg-card rounded-2xl p-4 border border-border hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">{dream.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User size={14} />
                  <span>{dream.dreamer}</span>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${priorityColors[dream.priority]}`}>
                {priorityLabels[dream.priority]}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={14} />
              <span>{dream.submittedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
