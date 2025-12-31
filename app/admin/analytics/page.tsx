"use client"

import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { ArrowRight } from "lucide-react"

export default function AdminAnalyticsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardHeader />

      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="text-foreground hover:text-primary">
            <ArrowRight size={24} />
          </button>
          <h1 className="text-3xl font-bold text-foreground">التحليلات</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">الطلبات حسب الحالة</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">مكتملة</span>
                <span className="font-semibold text-foreground">45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">قيد الانتظار</span>
                <span className="font-semibold text-foreground">12</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">الإيرادات</h3>
            <div className="text-3xl font-bold text-primary">$1,250</div>
            <p className="text-sm text-muted-foreground mt-2">هذا الشهر</p>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}
