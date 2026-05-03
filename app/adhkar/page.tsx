"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, RotateCcw } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { InfoPageShell } from "@/components/info-page-shell"
import rawAdhkarData from "@/lib/adhkar.json"

type DhikrItem = {
  category: string
  count: string
  description: string
  reference: string
  content: string
}

type AdhkarData = Record<string, DhikrItem[]>

const adhkarData = rawAdhkarData as AdhkarData

const categoryDescriptions: Record<string, string> = {
  "أذكار الصباح": "ابدأ يومك بأذكار الصباح وعدّاد لكل تكرار.",
  "أذكار المساء": "اختم يومك بورد المساء مع متابعة التقدم.",
  "أذكار بعد السلام من الصلاة المفروضة": "أذكار تقال بعد الصلوات المكتوبة.",
  تسابيح: "تسابيح جامعة مع عدّادات للتكرار.",
  "أذكار النوم": "أذكار ما قبل النوم للحفظ والسكينة.",
  "أذكار الاستيقاظ": "أذكار بداية اليوم عند الاستيقاظ.",
  "أدعية قرآنية": "أدعية وردت في القرآن الكريم.",
  "أدعية الأنبياء": "أدعية الأنبياء عليهم السلام.",
}

const categories = Object.entries(adhkarData).map(([title, items]) => ({
  title,
  description: categoryDescriptions[title] ?? `${items.length} ذكر ودعاء من هذا القسم.`,
  itemsCount: items.length,
  repeatsCount: items.reduce((total, item) => total + getRepeatTarget(item.count), 0),
}))

const initialCategory = categories[0]?.title ?? ""

function getRepeatTarget(count: string) {
  const parsed = Number.parseInt(count, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

function getItemKey(category: string, index: number) {
  return `${category}-${index}`
}

export default function AdhkarPage() {
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({})

  const activeItems = adhkarData[activeCategory] ?? []
  const activeTarget = useMemo(
    () => activeItems.reduce((total, item) => total + getRepeatTarget(item.count), 0),
    [activeItems],
  )
  const activeProgress = useMemo(
    () =>
      activeItems.reduce((total, item, index) => {
        const key = getItemKey(activeCategory, index)
        return total + Math.min(completedCounts[key] ?? 0, getRepeatTarget(item.count))
      }, 0),
    [activeCategory, activeItems, completedCounts],
  )

  const incrementCounter = (item: DhikrItem, index: number) => {
    const key = getItemKey(activeCategory, index)
    const target = getRepeatTarget(item.count)

    setCompletedCounts((current) => ({
      ...current,
      [key]: Math.min((current[key] ?? 0) + 1, target),
    }))
  }

  const resetCounter = (index: number) => {
    const key = getItemKey(activeCategory, index)

    setCompletedCounts((current) => ({
      ...current,
      [key]: 0,
    }))
  }

  const resetActiveCategory = () => {
    setCompletedCounts((current) => {
      const next = { ...current }
      activeItems.forEach((_, index) => {
        next[getItemKey(activeCategory, index)] = 0
      })
      return next
    })
  }

  return (
    <>
      <InfoPageShell
        title="الأذكار والأدعية"
        subtitle="ذكّر قلبك وأحيِ يومك بأذكار مستوحاة من السنة الصحيحة."
      >
        <section className="space-y-6 text-right" dir="rtl">
          <div className="rounded-2xl bg-emerald-50/70 p-5">
            <h2 className="text-lg font-bold text-slate-900">اذكر الله صباحاً ومساءً</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              اختر القسم، ثم اضغط على زر العدّاد بعد كل قراءة. يحفظ العداد تقدمك داخل الصفحة حتى
              تنتقل بين الأقسام بسهولة.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {categories.map((item) => {
              const isActive = item.title === activeCategory

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveCategory(item.title)}
                  className={`rounded-2xl border p-5 text-right shadow-sm transition ${
                    isActive
                      ? "border-emerald-300 bg-emerald-50 shadow-emerald-100"
                      : "border-emerald-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                  }`}
                >
                  <span className="block text-base font-semibold text-slate-900">{item.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-slate-600">{item.description}</span>
                  <span className="mt-4 inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                    {item.itemsCount} ذكر | {item.repeatsCount} تكرار
                  </span>
                </button>
              )
            })}
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white/90 p-5">
            <div className="flex flex-col gap-3 border-b border-sky-100 pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{activeCategory}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {activeProgress} من {activeTarget} تكرار مكتمل
                </p>
              </div>
              <button
                type="button"
                onClick={resetActiveCategory}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                إعادة القسم
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {activeItems.map((item, index) => {
                const target = getRepeatTarget(item.count)
                const key = getItemKey(activeCategory, index)
                const completed = Math.min(completedCounts[key] ?? 0, target)
                const isComplete = completed >= target

                return (
                  <article
                    key={key}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <p className="text-lg leading-9 text-slate-900">{item.content.trim()}</p>
                      <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {target} مرة
                      </span>
                    </div>

                    {item.description ? (
                      <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    ) : null}

                    {item.reference ? (
                      <p className="mt-2 text-xs leading-6 text-slate-500">{item.reference}</p>
                    ) : null}

                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white md:max-w-sm">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${(completed / target) * 100}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => resetCounter(index)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:text-sky-700"
                          aria-label="إعادة هذا الذكر"
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => incrementCounter(item, index)}
                          disabled={isComplete}
                          className={`inline-flex min-w-32 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                            isComplete
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          ) : null}
                          {completed} / {target}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      </InfoPageShell>
      <BottomNavigation />
    </>
  )
}
