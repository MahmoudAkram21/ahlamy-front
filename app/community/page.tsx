"use client"

import { useEffect } from "react"
import { CalendarDays, ChevronLeft, BookOpen } from "lucide-react"
import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Card } from "@/components/ui/card"

interface CommunityDreamItem {
  id: number
  date: string
  title: string
  content: string
  interpretation: string
}

const communityDreamsWithInterpretations: CommunityDreamItem[] = [
  {
    id: 1,
    date: "٢٣ أبريل ٢٠٢٤",
    title: "رؤيا الدعاء عند الكعبة",
    content:
      "السلام عليكم ورحمة الله وبركاته، رأيت أنني أقف بجوار الكعبة وأدعو لأهلي وأشعر براحة كبيرة، والجو كان صافياً والناس يطوفون. ما تفسير ذلك؟",
    interpretation:
      "رؤيا الدعاء عند الكعبة من الرؤى المبشرة؛ فالكعبة بيت الله الحرام، والدعاء عندها مستجاب. من وقف هناك في المنام ويدعو لأهله فإن ذلك يُؤوّل بخير وبركة عليهم، وراحة نفس وطمأنينة. وصفاء الجو يدل على صفاء النية وصدق التقوى. نسأل الله أن يتحقق الخير للرائي وأهله.",
  },
  {
    id: 2,
    date: "١٥ فبراير ٢٠٢٤",
    title: "رؤيا الدعاء عند ضريح الإمام",
    content:
      "حلمت أني بجوار ضريح الإمام وأردد دعاءً بصوت مسموع، وكان الجو مليئًا بالسكينة والنور يملأ المكان.",
    interpretation:
      "من رأى أنه يدعو عند قبر أو ضريح في منامه مع شعور بالسكينة والنور، فذلك يدل على تعلق القلب بالذكر والدعاء، والسكينة علامة رضا وطمأنينة. والنور في مثل هذه الرؤى يُفسّر بنور الإيمان والهدى. لا يُستدل بالرؤيا على فضل مكان دون آخر، بل على حال الرائي وتعلقه بالخير والذكر.",
  },
  {
    id: 3,
    date: "٢٩ يناير ٢٠٢٤",
    title: "رؤيا الراية البيضاء",
    content:
      "رأيت راية بيضاء ترتفع في بيتنا ومعها كلمات تبشر بالخير، ما تفسير ذلك؟",
    interpretation:
      "الراية البيضاء في المنام تُؤوّل غالباً بالخير والبشارة والنصر على الهموم. وارتفاعها في البيت يدل على علوّ شأن أهله وبركة. والكلمات المبشرة تؤكد أن الرؤيا محمودة وتدل على خير آتٍ إن شاء الله. يُستحسن للرائي أن يكثر من الشكر والذكر.",
  },
  {
    id: 4,
    date: "١٠ يناير ٢٠٢٤",
    title: "رؤيا السفر إلى المسجد النبوي",
    content:
      "رأيت أنني أسافر إلى المدينة المنورة وأصلي في المسجد النبوي، ثم أزور قبر الرسول صلى الله عليه وسلم وأسلم عليه.",
    interpretation:
      "السفر إلى المدينة في المنام والصلوة في المسجد النبوي من الرؤى المحمودة التي تدل على شوق القلب إلى الخير والبركة. والزيارة في المنام تُؤوّل بتعظيم النبي صلى الله عليه وسلم واتباع سنته. وهي بشارة بحسن الخاتمة والثبات على الدين إن شاء الله.",
  },
  {
    id: 5,
    date: "٥ ديسمبر ٢٠٢٣",
    title: "رؤيا الماء العذب",
    content:
      "حلمت أن نهراً من الماء العذب يجري أمام بيتنا، والناس يشربون منه ويغتسلون، وأنا منهم.",
    interpretation:
      "الماء العذب في المنام يدل على الرزق الحلال والعلم النافع والحياة الطيبة. وجريان النهر أمام البيت يُؤوّل بوفور الخير وبركة في الدار. والشرب والاغتسال منه يدل على تطهير من الهموم أو الذنوب وتجديد النشاط. الرؤيا محمودة بشكل عام.",
  },
]

export default function CommunityPage() {
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : ""
    if (hash) {
      const el = document.getElementById(hash)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <header className="rounded-b-[2rem] bg-gradient-to-br from-sky-600 via-sky-500 to-amber-300 px-4 py-8 text-center text-white shadow-xl">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-2 text-sm font-medium backdrop-blur-sm transition hover:bg-white/30"
          >
            <ChevronLeft size={18} />
            رجوع
          </Link>
          <h1 className="text-xl font-bold">مجتمع احلامي</h1>
          <div className="w-20" />
        </div>
        <p className="mt-4 text-sm text-white/90">
          رؤى وتفسيرات من مجتمع احلامي
        </p>
      </header>

      <main className="mx-auto mt-6 max-w-3xl space-y-6 px-4">
        <section className="rounded-3xl border border-sky-100 bg-white/95 p-4 shadow-lg backdrop-blur">
          <p className="text-center text-sm text-slate-600">
            نشارك هنا نماذج من الرؤى والتفسيرات (بدون ذكر أسماء) لتعم الفائدة وتطمئن القلوب.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <BookOpen size={20} className="text-sky-500" />
            الرؤى والتفسيرات
          </h2>

          <div className="space-y-6">
            {communityDreamsWithInterpretations.map((dream) => (
              <Card
                key={dream.id}
                id={`dream-${dream.id}`}
                className="overflow-hidden rounded-3xl border border-sky-100 bg-white/95 shadow-md scroll-mt-24"
              >
                <div className="border-b border-sky-100 bg-sky-50/50 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays size={14} />
                    <span>{dream.date}</span>
                  </div>
                  <h3 className="mt-2 font-semibold text-slate-900">{dream.title}</h3>
                </div>

                <div className="space-y-4 p-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-sky-600">
                      الرؤيا
                    </p>
                    <p className="mt-2 leading-7 text-slate-700">{dream.content}</p>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                      التفسير
                    </p>
                    <p className="mt-2 leading-7 text-slate-700">{dream.interpretation}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-sky-100 bg-white/95 p-6 text-center shadow-md">
          <p className="text-sm text-slate-600">
            هل تريد مشاركة رؤياك وتفسيرها من معبّرين معتمدين؟
          </p>
          <Link
            href="/dreams/new"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            شارك رؤياك الآن
            <ChevronLeft size={18} />
          </Link>
        </section>
      </main>

      <BottomNavigation />
    </div>
  )
}
