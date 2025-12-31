"use client"

import { BottomNavigation } from "@/components/bottom-navigation"
import { InfoPageShell } from "@/components/info-page-shell"

const stories = [
  {
    title: "قصة يوسف عليه السلام",
    lesson: "الصبر على البلاء، والعفو عند المقدرة، وحسن الظن بالله.",
  },
  {
    title: "أهل الكهف",
    lesson: "الثبات على الإيمان وحفظ الصحبة الصالحة.",
  },
  {
    title: "أم موسى",
    lesson: "اليقين بوعد الله والتوكل عليه في أحلك الظروف.",
  },
]

export default function StoriesPage() {
  return (
    <>
      <InfoPageShell
        title="قصص وعبر"
        subtitle="قصص مختارة تبث الأمل في النفوس وتربطك بالدروس القرآنية العظيمة."
      >
        <section className="space-y-6 text-right">
          <div className="rounded-2xl bg-rose-50/70 p-5">
            <h2 className="text-lg font-bold text-slate-900">دروس مستفادة</h2>
            <p className="mt-2 text-sm text-slate-600">
              تأمل القصص وأعد سردها لأطفالك أو أصدقائك. مشاركة المعاني تعمّق أثرها في القلب.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {stories.map((story) => (
              <div key={story.title} className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">{story.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-7">{story.lesson}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white/90 p-5">
            <h3 className="text-base font-semibold text-slate-900">كيف تستفيد؟</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• دوّن الدروس المستفادة في دفتر شخصي.</li>
              <li>• اربط القصة بمواقفك اليومية وذكر نفسك بها عند الحاجة.</li>
              <li>• شارك قصة واحدة أسبوعياً مع من تحب.</li>
            </ul>
          </div>
        </section>
      </InfoPageShell>
      <BottomNavigation />
    </>
  )
}

