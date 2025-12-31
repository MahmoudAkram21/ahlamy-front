"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-client"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { ArrowRight } from "lucide-react"
import { buildApiUrl } from "@/lib/api-client"
import { PageLoader } from "@/components/ui/preloader"

type PlanScope = "egypt" | "international" | "custom"

interface Plan {
  id: string
  name: string
  description?: string | null
  price: number
  currency: string
  durationDays: number
  scope: PlanScope
  letterQuota?: number | null
  audioMinutesQuota?: number | null
  maxDreams?: number | null
  maxInterpretations?: number | null
  features?: string[] | null
  countryCodes?: string[] | null
  isActive: boolean
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    currency: "EGP",
    scope: "egypt" as PlanScope,
    durationDays: "30",
    letterQuota: "",
    audioMinutesQuota: "",
    countryCodes: "",
    features: "",
    isActive: true,
  })
  const router = useRouter()

  const updateForm = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleCreatePlan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!form.name.trim()) {
      setFormError("يرجى إدخال اسم الخطة")
      return
    }

    if (!form.price || Number.isNaN(Number(form.price))) {
      setFormError("يرجى إدخال سعر صالح")
      return
    }

    if (!form.durationDays || Number.isNaN(Number(form.durationDays))) {
      setFormError("يرجى تحديد مدة الخطة بالأيام")
      return
    }

    setSaving(true)

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        price: Number(form.price),
        currency: form.currency.trim().toUpperCase(),
        scope: form.scope,
        durationDays: Number(form.durationDays),
        letterQuota: form.letterQuota ? Number(form.letterQuota) : null,
        audioMinutesQuota: form.audioMinutesQuota ? Number(form.audioMinutesQuota) : null,
        countryCodes: form.countryCodes
          ? form.countryCodes
              .split(',')
              .map((code) => code.trim().toUpperCase())
              .filter(Boolean)
          : [],
        features: form.features
          ? form.features
              .split('\n')
              .map((feature) => feature.trim())
              .filter(Boolean)
          : [],
        isActive: form.isActive,
      }

      const response = await fetch(buildApiUrl('/plans'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error || 'فشل إنشاء الخطة')
      }

      const data = await response.json()
      setPlans((prev) => [data.plan, ...prev])
      setFormSuccess("تم إنشاء الخطة بنجاح")
      setForm((prev) => ({
        ...prev,
        name: "",
        description: "",
        price: "",
        durationDays: prev.durationDays,
        letterQuota: "",
        audioMinutesQuota: "",
        countryCodes: "",
        features: "",
        isActive: true,
      }))
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الخطة")
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePlanActive = async (plan: Plan) => {
    try {
      const response = await fetch(buildApiUrl(`/plans/${plan.id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: !plan.isActive }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error || 'تعذر تحديث حالة الخطة')
      }

      const data = await response.json()
      setPlans((prev) => prev.map((item) => (item.id === plan.id ? data.plan : item)))
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "حدث خطأ أثناء تحديث حالة الخطة")
    }
  }

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        console.log('[Admin Plans] Checking authentication...')
        
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          router.push("/auth/login")
          return
        }

        if (currentUser.profile.role !== "super_admin") {
          router.push("/dashboard")
          return
        }

        console.log('[Admin Plans] Fetching plans...')
        
        const response = await fetch(buildApiUrl('/plans?includeInactive=true'), {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setPlans(data.plans || [])
          console.log('[Admin Plans] Loaded', data.plans.length, 'plans')
        }
      } catch (error) {
        console.error('[Admin Plans] Error fetching plans:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [router])

  if (loading) {
    return <PageLoader message="جاري تحميل الخطط..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <DashboardHeader />

      <main className="mx-auto mt-6 w-full max-w-6xl px-4">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-full bg-white/70 p-2 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-sky-600"
          >
            <ArrowRight size={22} />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">إدارة الخطط</h1>
        </div>

        <section className="mb-8 rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-lg backdrop-blur">
          <h2 className="mb-4 text-lg font-bold text-slate-900">إنشاء خطة جديدة</h2>
          <p className="mb-6 text-sm text-slate-500">
            قم بتحديد تفاصيل الخطة بما يتناسب مع السوق المستهدف وحدود الاستخدام للمستخدمين.
          </p>

          {formError && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleCreatePlan} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">اسم الخطة</label>
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                className="w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
                placeholder="مثال: باقة الفجر"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">وصف مختصر</label>
              <input
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
                className="w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
                placeholder="أضف وصفاً جذاباً للخطة"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">السعر</label>
              <input
                type="number"
                value={form.price}
                onChange={(event) => updateForm("price", event.target.value)}
                className="w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
                placeholder="مثال: 199"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">العملة</label>
              <input
                value={form.currency}
                onChange={(event) => updateForm("currency", event.target.value.toUpperCase())}
                className="w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm uppercase outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
                placeholder="EGP, USD..."
                maxLength={6}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">عدد الأيام</label>
              <input
                type="number"
                value={form.durationDays}
                onChange={(event) => updateForm("durationDays", event.target.value)}
                className="w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">نطاق الخطة</label>
              <select
                value={form.scope}
                onChange={(event) => updateForm("scope", event.target.value as PlanScope)}
                className="w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
              >
                <option value="egypt">مصر</option>
                <option value="international">دولي</option>
                <option value="custom">مخصص</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">حد الأحرف</label>
              <input
                type="number"
                value={form.letterQuota}
                onChange={(event) => updateForm("letterQuota", event.target.value)}
                className="w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
                placeholder="اتركه فارغاً ليكون غير محدود"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">دقائق التسجيل الصوتي</label>
              <input
                type="number"
                value={form.audioMinutesQuota}
                onChange={(event) => updateForm("audioMinutesQuota", event.target.value)}
                className="w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
                placeholder="اتركه فارغاً ليكون غير محدود"
                min="0"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-600">دول مستهدفة (رموز مفصولة بفواصل)</label>
              <input
                value={form.countryCodes}
                onChange={(event) => updateForm("countryCodes", event.target.value)}
                className="w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
                placeholder="مثال: EG, SA, AE"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-600">مزايا الخطة (سطر لكل ميزة)</label>
              <textarea
                value={form.features}
                onChange={(event) => updateForm("features", event.target.value)}
                className="min-h-[120px] w-full rounded-3xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
                placeholder={"وصف صوتي للرؤى\nمتابعة مباشرة مع المفسر"}
              />
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <input
                id="plan-active"
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => updateForm("isActive", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-200"
              />
              <label htmlFor="plan-active" className="text-sm text-slate-600">
                تفعيل الخطة فوراً
              </label>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-amber-300 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "جاري الحفظ..." : "إنشاء الخطة"}
              </button>
            </div>
          </form>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
                  {plan.scope === "egypt" ? "مصر" : plan.scope === "international" ? "دولي" : "مخصص"}
                </div>
                <button
                  onClick={() => handleTogglePlanActive(plan)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${plan.isActive ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
                >
                  {plan.isActive ? "نشط" : "موقوف"}
                </button>
              </div>

              <h3 className="mb-1 text-lg font-bold text-slate-900">{plan.name}</h3>
              {plan.description && <p className="mb-2 text-sm text-slate-500">{plan.description}</p>}

              <div className="mb-4 text-2xl font-bold text-sky-600">
                {new Intl.NumberFormat("ar-EG", {
                  style: "currency",
                  currency: plan.currency || "USD",
                  maximumFractionDigits: 0,
                }).format(plan.price)}
              </div>

              <div className="mb-4 space-y-2 rounded-2xl bg-sky-50/60 p-3 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>المدة</span>
                  <span className="font-semibold text-slate-900">{plan.durationDays} يوم</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>حد الأحرف</span>
                  <span className="font-semibold text-sky-600">
                    {plan.letterQuota !== null && plan.letterQuota !== undefined ? plan.letterQuota.toLocaleString("ar-EG") : "غير محدود"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>دقائق التسجيل</span>
                  <span className="font-semibold text-amber-600">
                    {plan.audioMinutesQuota !== null && plan.audioMinutesQuota !== undefined ? plan.audioMinutesQuota : "غير محدود"}
                  </span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-500">
                {(Array.isArray(plan.features) ? plan.features : []).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
