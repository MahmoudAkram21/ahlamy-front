"use client"

import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { InfoPageShell } from "@/components/info-page-shell"

const qiblaTools = [
  {
    title: "محدد القبلة عبر البوصلة",
    description: "استخدم بوصلة هاتفك واضبطه على اتجاه الشمال ثم اتبع الزاوية المحددة لبلدك.",
    href: "https://qiblafinder.withgoogle.com/intl/ar/",
  },
  {
    title: "محدد القبلة عبر الخرائط",
    description: "حدد موقعك على الخريطة وسيظهر لك خط مباشر يتجه إلى الكعبة.",
    href: "https://www.qiblalocator.com",
  },
  {
    title: "زاوية القبلة حسب المدن",
    description: "جدول يوضح زاوية القبلة بالدقيقة لكل مدينة حول العالم.",
    href: "https://www.islamicfinder.org/qibla/",
  },
]

export default function QiblaPage() {
  return (
    <>
      <InfoPageShell
        title="القبلة"
        subtitle="طرق موثوقة لتحديد اتجاه القبلة أينما كنت."
      >
        <section className="space-y-6 text-right">
          <div className="rounded-2xl bg-sky-50/70 p-5">
            <h2 className="text-lg font-bold text-slate-900">قبل استخدام البوصلة</h2>
            <p className="mt-2 text-sm text-slate-600">
              تأكد من ضبط إعدادات الموقع وخدمة GPS، وأبعد هاتفك عن الأجسام المعدنية للحصول على قراءة دقيقة.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {qiblaTools.map((tool) => (
              <div key={tool.title} className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">{tool.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{tool.description}</p>
                <Link
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center text-sm font-semibold text-sky-600 underline"
                >
                  افتح الأداة
                </Link>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
            <h3 className="text-base font-semibold text-slate-900">نصائح سريعة</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• في حال تعذر تحديد القبلة، صلِّ على حسب غلب الظن ولا تعد الصلاة.</li>
              <li>• إذا كنت على متن طائرة فاسأل طاقم الرحلة عن الاتجاه الصحيح.</li>
              <li>• استخدم التطبيقات التي تعمل دون اتصال في السفر.</li>
            </ul>
          </div>
        </section>
      </InfoPageShell>
      <BottomNavigation />
    </>
  )
}

