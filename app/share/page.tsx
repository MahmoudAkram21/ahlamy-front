"use client"

import { BottomNavigation } from "@/components/bottom-navigation"
import { InfoPageShell } from "@/components/info-page-shell"

const shareSteps = [
  "انشر رابط التطبيق مع أصدقائك وعائلتك عبر واتساب وتليجرام.",
  "شارك تجربتك على شبكات التواصل وأخبر الآخرين كيف ساعدك احلامي.",
  "شجع من حولك على تقييم التطبيق داخل المتجر لدعم الفريق.",
]

const shareLinks = [
  { label: "شارك عبر واتساب", href: "https://wa.me/?text=جرّب%20تطبيق%20احلامي%20لتفسير%20الرؤى" },
  { label: "انشر على تويتر X", href: "https://twitter.com/intent/tweet?text=أشارككم%20تجربتي%20مع%20تطبيق%20احلامي%20لتفسير%20الرؤى" },
  { label: "انسخ رابط التطبيق", href: "https://ahlami.app" },
]

export default function SharePage() {
  return (
    <>
      <InfoPageShell
        title="انشر تطبيق احلامي"
        subtitle="بدعمك ينتشر الخير ويصل التفسير الموثوق إلى كل من يبحث عنه."
      >
        <section className="space-y-6 text-right">
          <div className="rounded-2xl bg-sky-50/70 p-5">
            <h2 className="text-lg font-bold text-slate-900">كيف تساعدنا مشاركتك؟</h2>
            <p className="mt-2 text-sm text-slate-600">
              كل مشاركة تقوم بها تمنح شخصاً جديداً فرصة للتواصل مع معبّر متخصص. نحن نؤمن أن نشر المعرفة رسالة مشتركة بيننا
              وبين مستخدمينا.
            </p>
          </div>

          <div className="rounded-2xl border border-sky-100 p-5">
            <h3 className="text-base font-semibold text-slate-900">خطوات بسيطة للمشاركة</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {shareSteps.map((step, idx) => (
                <li key={idx}>• {step}</li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {shareLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-sky-600 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>
      </InfoPageShell>
      <BottomNavigation />
    </>
  )
}


