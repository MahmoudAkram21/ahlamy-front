"use client"

import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { InfoPageShell } from "@/components/info-page-shell"

const resources = [
  { title: "مواقيت الصلاة حول العالم", href: "https://www.islamicfinder.org/world", description: "اختر مدينتك لتحصل على جدول محدث للمواقيت." },
  { title: "تنبيهات الصلاة", href: "https://muslimpro.com", description: "تطبيق يدعم الإشعارات الصوتية والمرئية." },
  { title: "تقويم أم القرى", href: "https://www.ummulqura.org.sa/Calendar.aspx", description: "التقويم الرسمي للمملكة العربية السعودية." },
]

export default function PrayerTimesPage() {
  return (
    <>
      <InfoPageShell
        title="مواقيت الصلاة"
        subtitle="حافظ على صلاتك مع أدوات تنبيه دقيقة وجداول محدثة يومياً."
      >
        <section className="space-y-6 text-right">
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

