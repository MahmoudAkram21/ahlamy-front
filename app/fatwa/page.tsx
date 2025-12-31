"use client"

import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { InfoPageShell } from "@/components/info-page-shell"

const fatwaSources = [
  { title: "مركز الفتوى - إسلام ويب", href: "https://fatwa.islamweb.net", description: "مرجع موثوق للأسئلة المتعلقة بالرؤى والأحلام." },
  { title: "اللجنة الدائمة للإفتاء", href: "https://www.alifta.gov.sa", description: "فتاوى كبار العلماء في المملكة العربية السعودية." },
  { title: "دار الإفتاء المصرية", href: "https://www.dar-alifta.org", description: "إجابات شرعية معتمدة، مع خدمات الهاتف والرسائل." },
]

export default function FatwaPage() {
  return (
    <>
      <InfoPageShell
        title="فتاوى الرؤى"
        subtitle="تعرف على أحكام الرؤى وحدودها الشرعية من مصادر موثوقة."
      >
        <section className="space-y-6 text-right">
          <div className="rounded-2xl bg-indigo-50/70 p-5">
            <h2 className="text-lg font-bold text-slate-900">قبل طلب الفتوى</h2>
            <p className="mt-2 text-sm text-slate-600">
              التأكد من صحة المعلومة مسؤولية، لذلك اختر جهة رسمية واسأل متخصصاً موثوقاً، وابتعد عن التأويلات المنتشرة دون علم.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {fatwaSources.map((source) => (
              <div key={source.title} className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">{source.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{source.description}</p>
                <Link
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600 underline"
                >
                  زيارة الموقع
                </Link>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white/90 p-5">
            <h3 className="text-base font-semibold text-slate-900">نصائح مهمة</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• لا تشارك تفاصيلك الشخصية مع مصادر غير موثوقة.</li>
              <li>• تذكر أن الرؤى لا تبنى عليها قرارات مصيرية دون تثبت.</li>
              <li>• استخِر الله دوماً، فهو خير من يرشدك إلى الصواب.</li>
            </ul>
          </div>
        </section>
      </InfoPageShell>
      <BottomNavigation />
    </>
  )
}

