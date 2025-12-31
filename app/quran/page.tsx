"use client"

import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { InfoPageShell } from "@/components/info-page-shell"

const suraHighlights = [
  { title: "سورة الكهف", description: "اقرأها كل جمعة لنور ما بين الجمعتين.", link: "https://quran.com/18" },
  { title: "سورة يس", description: "تسعد القلوب وتذكر بالبعث والآخرة.", link: "https://quran.com/36" },
  { title: "سورة الملك", description: "من قرأها كل ليلة وُقي من عذاب القبر.", link: "https://quran.com/67" },
]

export default function QuranPage() {
  return (
    <>
      <InfoPageShell
        title="القرآن الكريم"
        subtitle="اقرأ واستمع لتلاوات مختارة، وتعرّف على فضائل السور والأذكار اليومية."
        ctaLabel="قراءة القرآن عبر Quran.com"
        ctaHref="https://quran.com"
      >
        <section className="space-y-6 text-right">
          <div className="rounded-2xl bg-sky-50/70 p-5">
            <h2 className="text-lg font-bold text-slate-900">قراءة يومية مقترحة</h2>
            <p className="mt-2 text-sm text-slate-600">
              خصص 15 دقيقة يومياً لتلاوة ما تيسر من القرآن، وابدأ بسورة قصيرة مع التأمل في المعاني.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {suraHighlights.map((sura) => (
              <div key={sura.title} className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">{sura.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{sura.description}</p>
                <Link
                  href={sura.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center text-sm font-semibold text-sky-600 underline"
                >
                  اقرأ الآن
                </Link>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
            <h3 className="text-base font-semibold text-slate-900">استمع لأجمل التلاوات</h3>
            <p className="mt-2 text-sm text-slate-600">
              يمكنك الاستماع إلى تلاوات الشيخ ماهر المعيقلي، سعد الغامدي، ومشاري العفاسي عبر{" "}
              <Link href="https://quranicaudio.com" className="font-semibold text-sky-600 underline" target="_blank">
                QuranicAudio.com
              </Link>
              .
            </p>
          </div>
        </section>
      </InfoPageShell>
      <BottomNavigation />
    </>
  )
}

