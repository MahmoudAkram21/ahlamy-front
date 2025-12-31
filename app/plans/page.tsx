"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-client"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Check } from "lucide-react"
import { buildApiUrl } from "@/lib/api-client"
import { PageLoader } from "@/components/ui/preloader"

interface Plan {
  id: string
  name: string
  description?: string | null
  price: number
  currency: string
  letterQuota?: number | null
  features?: string[] | null
  isActive: boolean
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const letterCount = searchParams.get('letterCount') ? parseInt(searchParams.get('letterCount') || '0', 10) : null
  const dreamId = searchParams.get('dreamId')

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        console.log('[Plans] Checking authentication...')
        
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          console.log('[Plans] No user found, redirecting to login')
          router.push("/auth/login")
          return
        }
        
        setUserId(currentUser.user.id)
        console.log('[Plans] User authenticated, fetching plans...')

        const response = await fetch(buildApiUrl('/plans'), {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setPlans(data.plans || [])
          console.log('[Plans] Loaded', data.plans.length, 'plans')
        }
      } catch (error) {
        console.error('[Plans] Error fetching plans:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [router])

  const handleSelectPlan = async (planId: string) => {
    try {
      // If dreamId is present, this is a per-dream purchase
      if (dreamId) {
        console.log('[Plans] Purchasing plan for dream:', planId, 'plan:', planId)
        
        const response = await fetch(buildApiUrl('/payments/purchase-for-dream'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ dreamId, planId }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log('[Plans] Checkout session created, redirecting to Stripe...')
          // Redirect to Stripe checkout
          if (data.url) {
            window.location.href = data.url
          } else {
            console.error('[Plans] No checkout URL received')
          }
        } else {
          const error = await response.json().catch(() => ({}))
          console.error('[Plans] Purchase failed:', error)
          alert(error.error || 'فشل في إنشاء جلسة الدفع')
        }
      } else {
        // Legacy subscription flow
        console.log('[Plans] Subscribing to plan:', planId)
        
        const response = await fetch(buildApiUrl('/plans/subscribe'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ planId }),
        })

        if (response.ok) {
          console.log('[Plans] Subscription successful')
          router.push("/dashboard")
        } else {
          console.error('[Plans] Subscription failed')
        }
      }
    } catch (error) {
      console.error('[Plans] Error selecting plan:', error)
      alert('حدث خطأ أثناء معالجة الطلب')
    }
  }

  if (loading) {
    return <PageLoader message="جاري تحميل الخطط المتاحة..." />
  }

  // Find the smallest plan that covers the letter count
  const findSmallestCoveringPlan = () => {
    if (letterCount === null) return null
    
    const coveringPlans = plans.filter(
      (plan) =>
        plan.letterQuota !== null &&
        plan.letterQuota !== undefined &&
        plan.letterQuota >= letterCount
    )
    
    if (coveringPlans.length === 0) return null
    
    // Find the plan with the minimum letterQuota
    return coveringPlans.reduce((smallest, current) => {
      if (!smallest) return current
      const smallestQuota = smallest.letterQuota ?? Infinity
      const currentQuota = current.letterQuota ?? Infinity
      return currentQuota < smallestQuota ? current : smallest
    })
  }

  const smallestCoveringPlan = findSmallestCoveringPlan()

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <DashboardHeader />

      <main className="mx-auto mt-6 w-full max-w-6xl px-4">
        <div className="mb-6 text-right">
          <h1 className="text-2xl font-bold text-slate-900">اختر خطتك</h1>
          {letterCount !== null && (
            <p className="mt-1 text-sm text-slate-600">
              عدد أحرف رؤيتك: <span className="font-semibold text-sky-600">{letterCount.toLocaleString('ar-EG')}</span> حرف
            </p>
          )}
          <p className="text-sm text-slate-500">اختر الباقة الأنسب لتجربتك في احلامي</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            // Check if this is the smallest plan that covers the letter count
            const isSmallestCoveringPlan = smallestCoveringPlan?.id === plan.id
            
            return (
            <div
              key={plan.id}
              className={`flex flex-col rounded-3xl p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl ${
                isSmallestCoveringPlan
                  ? 'border-2 border-emerald-400 bg-gradient-to-br from-emerald-50/80 to-white ring-2 ring-emerald-200'
                  : 'border border-sky-100 bg-white/95'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {isSmallestCoveringPlan && (
                  <div className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                    ✓ يناسب رؤيتك
                  </div>
                )}
              </div>

              <h3 className="mt-3 text-lg font-bold text-slate-900 text-center md:text-right">{plan.name}</h3>
              {plan.description && (
                <p className="mb-4 text-sm text-slate-500 text-center md:text-right">{plan.description}</p>
              )}

              <div className="mb-6 text-center md:text-right">
                <span className="text-3xl font-bold text-sky-600">
                  {new Intl.NumberFormat("ar-EG", {
                    style: "currency",
                    currency: plan.currency || "EGP",
                    maximumFractionDigits: 0,
                  }).format(plan.price)}
                </span>
                <span className="text-xs text-slate-400"> / رؤية واحدة</span>
              </div>

              <div className="space-y-2 rounded-2xl bg-sky-50/60 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>حد الأحرف</span>
                  <span className="font-semibold text-sky-600">
                    {plan.letterQuota !== null && plan.letterQuota !== undefined ? plan.letterQuota.toLocaleString("ar-EG") : "غير محدود"}
                  </span>
                </div>
              </div>

              <ul className="mb-6 mt-4 flex-1 space-y-2">
                {(Array.isArray(plan.features) ? plan.features : []).map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                      <Check size={14} />
                    </span>
                    <span className="text-right">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl ${
                  isSmallestCoveringPlan
                    ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300'
                    : 'bg-gradient-to-r from-sky-500 via-sky-400 to-amber-300'
                }`}
              >
                {isSmallestCoveringPlan ? '✓ اختر هذه الخطة (مناسبة)' : 'اختر هذه الخطة'}
              </button>
            </div>
          )})}
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
