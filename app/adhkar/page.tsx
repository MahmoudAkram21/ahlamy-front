"use client"

import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { InfoPageShell } from "@/components/info-page-shell"

const adhkarCategories = [
  { title: "أذكار الصباح", description: "بعد الفجر وحتى طلوع الشمس.", link: "https://hisnmuslim.com/section/1" },
  { title: "أذكار المساء", description: "بعد العصر وحتى الغروب.", link: "https://hisnmuslim.com/section/2" },
  { title: "أذكار النوم", description: "تُقال قبل النوم طلباً للحفظ.", link: "https://hisnmuslim.com/section/31" },
]

export default function AdhkarPage() {
  return (
    <>
      <InfoPageShell
        title="الأذكار والأدعية"
        subtitle="ذكّر قلبك وأحيِ يومك بأذكار مستوحاة من السنة الصحيحة."
        ctaLabel="تحميل حصن المسلم PDF"
        ctaHref="https://islamhouse.com/ar/books/209437/"
      >
        <section className="space-y-6 text-right">
          <div className="rounded-2xl bg-emerald-50/70 p-5">
            <h2 className="text-lg font-bold text-slate-900">اذكر الله صباحاً ومساءً</h2>
            <p className="mt-2 text-sm text-slate-600">
              خصص أوقاتاً ثابتة للأذكار مع تنبيه على هاتفك، وابدأ بيومك بقراءة سورة الإخلاص والمعوذات ثلاث مرات.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {adhkarCategories.map((item) => (
              <div key={item.title} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                <Link
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-600 underline"
                >
                  تصفح الأذكار
                </Link>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white/90 p-5">
            <h3 className="text-base font-semibold text-slate-900">أدعية جامعة</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار.</li>
              <li>• اللهم إني أسألك العفو والعافية في الدنيا والآخرة.</li>
              <li>• اللهم صل وسلم على نبينا محمد وعلى آله وصحبه أجمعين.</li>
            </ul>
          </div>
        </section>
      </InfoPageShell>
      <BottomNavigation />
    </>
  )
}

