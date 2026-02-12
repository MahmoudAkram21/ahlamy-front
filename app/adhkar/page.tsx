"use client"

import {
  Sun,
  Moon,
  Sparkles,
  Sunrise,
  BookOpen,
  BookMarked,
  Hand,
  ChevronRight,
} from "lucide-react"
import { useEffect, useState } from "react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { InfoPageShell } from "@/components/info-page-shell"
import { PageLoader } from "@/components/ui/preloader"

const AZKAR_API_URL =
  "https://raw.githubusercontent.com/nawafalqari/azkar-api/56df51279ab6eb86dc2f6202c7de26c8948331c1/azkar.json"

interface AzkarItem {
  category: string
  count: string
  description: string
  reference: string
  content: string
}

function flattenAzkarItems(arr: unknown[]): AzkarItem[] {
  const out: AzkarItem[] = []
  for (const x of arr) {
    if (Array.isArray(x)) {
      out.push(...flattenAzkarItems(x))
    } else if (x && typeof x === "object" && "content" in x && typeof (x as AzkarItem).content === "string") {
      const item = x as AzkarItem
      if (item.category !== "stop") out.push(item)
    }
  }
  return out
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "أذكار الصباح": <Sun className="h-10 w-10" />,
  "أذكار المساء": <Moon className="h-10 w-10" />,
  "أذكار النوم": <Moon className="h-10 w-10" />,
  "أذكار الاستيقاظ": <Sunrise className="h-10 w-10" />,
  "أذكار بعد السلام من الصلاة المفروضة": <Hand className="h-10 w-10" />,
  "تسابيح": <Sparkles className="h-10 w-10" />,
  "أدعية قرآنية": <BookOpen className="h-10 w-10" />,
  "أدعية الأنبياء": <BookMarked className="h-10 w-10" />,
}

function getCategoryIcon(categoryName: string) {
  return CATEGORY_ICONS[categoryName] ?? <Sparkles className="h-10 w-10" />
}

function parseCount(s: string): number {
  const n = parseInt(s, 10)
  return Number.isNaN(n) ? 0 : Math.max(0, n)
}

export default function AdhkarPage() {
  const [data, setData] = useState<Record<string, AzkarItem[]> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  // remaining count per item: key = "categoryName-index", value = remaining
  const [remainingCounts, setRemainingCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchAzkar = async () => {
      try {
        const res = await fetch(AZKAR_API_URL)
        if (!res.ok) throw new Error("فشل تحميل الأذكار")
        const json: Record<string, unknown[]> = await res.json()
        const byCategory: Record<string, AzkarItem[]> = {}
        for (const [categoryName, rawList] of Object.entries(json)) {
          if (!Array.isArray(rawList)) continue
          const items = flattenAzkarItems(rawList)
          if (items.length > 0) byCategory[categoryName] = items
        }
        setData(byCategory)
      } catch (e) {
        setError(e instanceof Error ? e.message : "حدث خطأ")
      } finally {
        setLoading(false)
      }
    }
    fetchAzkar()
  }, [])

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 flex items-center justify-center">
          <PageLoader message="جاري تحميل الأذكار..." />
        </div>
        <BottomNavigation />
      </>
    )
  }

  if (error || !data) {
    return (
      <>
        <InfoPageShell title="الأذكار والأدعية" subtitle="ذكّر قلبك وأحيِ يومك بأذكار من السنة.">
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-center text-rose-700">
            {error ?? "لم يتم تحميل الأذكار."}
          </div>
        </InfoPageShell>
        <BottomNavigation />
      </>
    )
  }

  const categoryOrder = Object.keys(data)

  // Detail view: one category's items with back
  if (selectedCategory && data[selectedCategory]) {
    const items = data[selectedCategory]
    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
          <header className="bg-gradient-to-br from-sky-600 via-sky-500 to-amber-300 text-white shadow-xl">
            <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 text-right">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="flex items-center justify-center rounded-full p-2 text-white/90 transition hover:bg-white/20"
                aria-label="رجوع"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <h1 className="flex-1 text-xl font-bold tracking-wide">{selectedCategory}</h1>
            </div>
          </header>

          <main className="mx-auto mt-4 w-full max-w-4xl px-4">
            <div className="rounded-3xl border border-sky-100 bg-white/95 p-4 shadow-lg backdrop-blur">
              <ul className="space-y-4 text-right">
                {items.map((item, idx) => {
                  const countKey = `${selectedCategory}-${idx}`
                  const initialCount = parseCount(item.count)
                  const remaining = remainingCounts[countKey] ?? initialCount
                  const hasCount = item.count && item.count !== "stop" && initialCount > 0
                  const decrement = () => {
                    const current = remainingCounts[countKey] ?? initialCount
                    if (current <= 0) return
                    setRemainingCounts((prev) => ({
                      ...prev,
                      [countKey]: Math.max(0, (prev[countKey] ?? initialCount) - 1),
                    }))
                  }
                  return (
                    <li
                      key={countKey}
                      className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
                    >
                      <p className="text-base leading-relaxed text-slate-800 font-medium">
                        {item.content}
                      </p>
                      {hasCount && (
                        <button
                          type="button"
                          onClick={decrement}
                          disabled={remaining <= 0}
                          className="mt-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          عدد المرات: {remaining}
                        </button>
                      )}
                      {item.description && (
                        <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                      )}
                      {item.reference && (
                        <p className="mt-1 text-xs text-slate-400">{item.reference}</p>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </main>
        </div>
        <BottomNavigation />
      </>
    )
  }

  // Grid view: category cards (حصن المسلم style)
  return (
    <>
      <InfoPageShell
        title="الأذكار والأدعية"
        subtitle="ذكّر قلبك وأحيِ يومك بأذكار مستوحاة من السنة الصحيحة."
        ctaLabel="تحميل حصن المسلم PDF"
        ctaHref="https://islamhouse.com/ar/books/209437/"
      >
        <section className="pb-6">
          <div className="grid grid-cols-2 gap-4">
            {categoryOrder.map((categoryName) => {
              const items = data[categoryName]
              if (!items || items.length === 0) return null
              const icon = getCategoryIcon(categoryName)
              return (
                <button
                  key={categoryName}
                  type="button"
                  onClick={() => setSelectedCategory(categoryName)}
                  className="flex min-h-[140px] flex-col items-center justify-end rounded-2xl bg-gradient-to-b from-sky-600 to-sky-700 p-4 text-white shadow-lg transition hover:from-sky-500 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
                >
                  <span className="mb-2 flex flex-1 items-center justify-center text-amber-300">
                    {icon}
                  </span>
                  <span className="text-center text-sm font-semibold leading-snug">
                    {categoryName}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      </InfoPageShell>
      <BottomNavigation />
    </>
  )
}
