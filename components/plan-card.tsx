"use client"

interface PlanCardProps {
  name: string
  price: number
  features: string[]
  onSelect: () => void
}

export function PlanCard({ name, price, features, onSelect }: PlanCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-xl font-bold text-foreground mb-4">{name}</h3>
      <div className="text-3xl font-bold text-primary mb-6">${price}</div>
      <ul className="space-y-2 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="text-sm text-foreground">
            ✓ {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        className="w-full bg-primary text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
      >
        اختر
      </button>
    </div>
  )
}
