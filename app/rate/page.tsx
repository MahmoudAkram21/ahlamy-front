"use client"

import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { InfoPageShell } from "@/components/info-page-shell"

const stores = [
  { label: "متجر Google Play", href: "https://play.google.com/store" },
  { label: "متجر Apple App Store", href: "https://apps.apple.com" },
  { label: "Huawei Gallery", href: "https://appgallery.huawei.com" },
]

export default function RatePage() {
  return (
    <>
      <InfoPageShell
        title="قيّم تطبيق احلامي"
        subtitle="ملاحظاتك تساعدنا على تطوير التجربة وتحسين خدمات التفسير للجميع."
      >
        <section className="space-y-6 text-right">
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">لماذا نطلب تقييمك؟</h2>
            <p className="mt-2 text-sm text-slate-600 leading-7">
              التقييمات الإيجابية ترفع ثقة المستخدمين الجدد وتشجعنا على الاستثمار أكثر في تطوير خصائص المنصة. أما
              الملاحظات البنائية فتمكننا من معالجة أي نقطة ضعف بشكل عاجل.
            </p>
          </div>

          <div className="rounded-2xl bg-sky-50/70 p-5">
            <h3 className="text-base font-semibold text-slate-900">كيف تقيّمنا؟</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-slate-600">
              <li>اختر متجر التطبيقات الذي تستخدمه من القائمة أدناه.</li>
              <li>اكتب بضع كلمات عن تجربتك، وما أعجبك أو ما تحتاج تحسينه.</li>
              <li>أرسل التقييم وشارك لقطة شاشة مع أصدقائك لدعمنا أكثر.</li>
            </ol>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {stores.map((store) => (
              <Link
                key={store.label}
                href={store.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-sky-600 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {store.label}
              </Link>
            ))}
          </div>
        </section>
      </InfoPageShell>
      <BottomNavigation />
    </>
  )
}


