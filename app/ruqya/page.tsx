"use client"

import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { InfoPageShell } from "@/components/info-page-shell"

const ruqyaSteps = [
  "استحضر نية الشفاء وابدأ بالوضوء إن أمكن.",
  "اقرأ الفاتحة سبع مرات ثم آية الكرسي مرة واحدة.",
  "اقرأ سورة الفلق والناس والإخلاص ثلاث مرات.",
  "انفث في كفيك وامسح بهما على جسدك أو على موضع الألم.",
]

export default function RuqyaPage() {
  return (
    <>
      <InfoPageShell
        title="الرقية الشرعية"
        subtitle="إرشادات موثوقة للرقية الشرعية من القرآن والسنة."
      >
        <section className="space-y-6 text-right">
          <div className="rounded-2xl bg-teal-50/70 p-5">
            <h2 className="text-lg font-bold text-slate-900">قبل الرقية</h2>
            <p className="mt-2 text-sm text-slate-600">
              احرص على طهارة المكان، والاستعانة بالله وحده دون التعلق بالماديات. تجنب التعامل مع مدّعين أو أساليب غير
              شرعية.
            </p>
          </div>

          <div className="rounded-2xl border border-teal-100 bg-white/90 p-5">
            <h3 className="text-base font-semibold text-slate-900">خطوات الرقية الذاتية</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {ruqyaSteps.map((step, idx) => (
                <li key={idx}>• {step}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">رُقاة موثوقون</h3>
            <p className="mt-2 text-sm text-slate-600">
              ننصح بالتواصل مع المراكز الرسمية في مدينتك، ويمكنك البدء من خلال{" "}
              <Link href="/support" className="font-semibold text-sky-600 underline">
                خدمة العملاء
              </Link>{" "}
              لتزويدك بقائمة معتمدة.
            </p>
          </div>
        </section>
      </InfoPageShell>
      <BottomNavigation />
    </>
  )
}

