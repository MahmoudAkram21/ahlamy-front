"use client"

import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { InfoPageShell } from "@/components/info-page-shell"

const articles = [
  {
    title: "كيف تفرق بين الحلم وحديث النفس؟",
    excerpt: "تعرف على العلامات التي تميز الرؤى الصادقة عن الأفكار اليومية.",
    href: "#",
  },
  {
    title: "أخلاقيات المعبر في المنهج الإسلامي",
    excerpt: "قواعد شرعية تحفظ كرامة الرائي وتضمن سلامة التفسير.",
    href: "#",
  },
  {
    title: "نصائح لكتابة رؤياك بدقة",
    excerpt: "دليل سريع يساعدك على تدوين رؤيتك بوضوح للمفسر.",
    href: "#",
  },
]

export default function ArticlesPage() {
  return (
    <>
      <InfoPageShell
        title="مقالات وفوائد"
        subtitle="قراءات خفيفة ترفع وعيك حول الرؤى والأحلام والسلوك الروحي."
      >
        <section className="space-y-6 text-right">
          <div className="rounded-2xl bg-violet-50/70 p-5">
            <h2 className="text-lg font-bold text-slate-900">آخر المقالات</h2>
            <p className="mt-2 text-sm text-slate-600">
              نضيف مقالات أسبوعية قصيرة بإشراف مختصين في التفسير والتربية الإيمانية. قريباً ستتوفر خاصية الإشعارات للمقالات
              الجديدة.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {articles.map((article) => (
              <div key={article.title} className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">{article.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{article.excerpt}</p>
                <Link href={article.href} className="mt-4 inline-flex items-center text-sm font-semibold text-violet-600 underline">
                  قراءة المقال
                </Link>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white/90 p-5">
            <h3 className="text-base font-semibold text-slate-900">شاركنا مقالك</h3>
            <p className="mt-2 text-sm text-slate-600">
              إن كانت لديك خبرة في التفسير أو التربية الإيمانية، راسلنا على{" "}
              <Link href="mailto:editor@ahlami.app" className="font-semibold text-sky-600 underline">
                editor@ahlami.app
              </Link>{" "}
              لنراجع مقالك وننشره باسمك.
            </p>
          </div>
        </section>
      </InfoPageShell>
      <BottomNavigation />
    </>
  )
}

