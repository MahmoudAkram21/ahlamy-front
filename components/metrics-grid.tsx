"use client"

interface Metric {
  label: string
  value: string
  icon: string
}

export function MetricsGrid({ metrics }: { metrics: Metric[] }) {
  const iconMap: Record<string, string> = {
    "📊": "📊",
    "✨": "✨",
    "⏳": "⏳",
    "✅": "✅",
    "⌛": "⌛",
    "💬": "💬",
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground px-4">الإحصائيات</h3>
      <div className="grid grid-cols-2 gap-4 px-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-card rounded-2xl p-4 shadow-sm border border-border hover:shadow-md transition-shadow"
          >
            <p className="text-xs text-muted-foreground mb-3">{metric.label}</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-primary">{metric.value}</p>
              <span className="text-2xl">{iconMap[metric.icon] || metric.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
