"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { InfoPageShell } from "@/components/info-page-shell"
import {
  getTimingsByCoords,
  getTimingsByCity,
  getTodayPrayerList,
  type PrayerTimesData,
} from "@/lib/prayer-times"

const resources = [
  { title: "مواقيت الصلاة حول العالم", href: "https://www.islamicfinder.org/world", description: "اختر مدينتك لتحصل على جدول محدث للمواقيت." },
  { title: "تنبيهات الصلاة", href: "https://muslimpro.com", description: "تطبيق يدعم الإشعارات الصوتية والمرئية." },
  { title: "تقويم أم القرى", href: "https://www.ummulqura.org.sa/Calendar.aspx", description: "التقويم الرسمي للمملكة العربية السعودية." },
]

export default function PrayerTimesPage() {
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrayerTimes = useCallback(() => {
    setLoading(true)
    setError(null)
    let cancelled = false

    const resolve = async (lat?: number, lon?: number) => {
      try {
        const data =
          lat != null && lon != null
            ? await getTimingsByCoords(lat, lon)
            : await getTimingsByCity("Cairo", "Egypt")
        if (cancelled) return
        if (!data) {
          setError("تعذر تحميل المواقيت")
          setPrayerData(null)
          return
        }
        setPrayerData(data)
      } catch {
        if (!cancelled) {
          setError("تعذر تحميل المواقيت")
          setPrayerData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords.latitude, pos.coords.longitude),
        () => resolve(),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      )
    } else {
      resolve()
    }

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    fetchPrayerTimes()
  }, [fetchPrayerTimes])

  const todayList = prayerData ? getTodayPrayerList(prayerData.timings) : []

  return (
    <>
      <InfoPageShell
        title="مواقيت الصلاة"
        subtitle="حافظ على صلاتك مع أدوات تنبيه دقيقة وجداول محدثة يومياً."
      >
        <section className="space-y-6 text-right">
          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">جدول اليوم</h2>
            {loading && (
              <p className="mt-3 text-sm text-slate-500">جاري تحميل المواقيت...</p>
            )}
            {!loading && error && (
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-sm text-slate-600">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchPrayerTimes()}
                  className="self-start rounded-full bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}
            {!loading && !error && todayList.length > 0 && (
              <>
                <p className="mt-1 text-sm text-slate-500">{prayerData?.dateReadable}</p>
                <ul className="mt-4 space-y-3">
                  {todayList.map(({ key, nameAr, time }) => (
                    <li
                      key={key}
                      className="flex items-center justify-between rounded-xl bg-amber-50/80 py-2.5 px-4"
                    >
                      <span className="font-medium text-slate-800">{nameAr}</span>
                      <span className="text-lg font-semibold tabular-nums text-amber-700">{time}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="rounded-2xl bg-amber-50/70 p-5">
            <h2 className="text-lg font-bold text-slate-900">خطة الالتزام بالصلاة</h2>
            <p className="mt-2 text-sm text-slate-600">
              اربط وقتك اليومي بالصلوات الخمس. جرب أن تبدأ أعمالك بعد تحديد موعد الصلاة القادمة، وستلاحظ بركة في وقتك.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {resources.map((item) => (
              <div key={item.title} className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                <Link
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center text-sm font-semibold text-amber-600 underline"
                >
                  عرض التفاصيل
                </Link>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white/90 p-5">
            <h3 className="text-base font-semibold text-slate-900">تذكير سريع</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• احرص على صلاة الجماعة متى ما استطعت.</li>
              <li>• استخدم تطبيقاً معتمداً لضبط الفروقات الزمنية.</li>
              <li>• جدد نيتك مع كل أذان، فالصلاة صلة بينك وبين الله.</li>
            </ul>
          </div>
        </section>
      </InfoPageShell>
      <BottomNavigation />
    </>
  )
}

