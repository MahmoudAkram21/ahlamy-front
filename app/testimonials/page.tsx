"use client"

import { ChevronLeft, Heart, Quote, Star } from "lucide-react"
import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Card } from "@/components/ui/card"

interface Testimonial {
  id: number
  name: string
  quote: string
  rating: number
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "مريم.س",
    quote: "جزاكم الله خيرا على المنصة، التفسير كان دقيقًا ومطمئنًا جدًا.",
    rating: 5,
  },
  {
    id: 2,
    name: "عبدالله.م",
    quote: "سرعة الرد وجودة التفسير كانت رائعة، شكرا لفريق احلامي.",
    rating: 5,
  },
  {
    id: 3,
    name: "فاطمة.أ",
    quote: "تعامل محترم وسرعة في الرد، التفسير كان واضحاً ومرتباً وساعدني أفهم رؤياي بشكل أفضل.",
    rating: 5,
  },
  {
    id: 4,
    name: "أحمد.م",
    quote: "منصة موثوقة ومفيدة، أنصح بها كل من يبحث عن تفسير رؤى وفق المنهج الإسلامي.",
    rating: 5,
  },
  {
    id: 5,
    name: "نورة.خ",
    quote: "تجربة ممتازة، المفسرون متعاونون والشرح كان يسيراً على الفهم.",
    rating: 5,
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={18} fill="currentColor" />
      ))}
    </div>
  )
}

export default function TestimonialsPage() {
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
          <h1 className="text-xl font-bold">آراء المستخدمين</h1>
          <div className="w-20" />
        </div>
        <p className="mt-4 text-sm text-white/90">
          ما يقوله مستخدمو احلامي عن تجربتهم
        </p>
      </header>

      <main className="mx-auto mt-6 max-w-3xl space-y-6 px-4">
        <div className="grid gap-4 md:grid-cols-2">
          {testimonials.map((item) => (
            <Card
              key={item.id}
              className="rounded-2xl border border-sky-100 bg-white/95 p-5 shadow-md"
            >
              <div className="flex items-center justify-between">
                <Stars count={item.rating} />
                <Quote size={20} className="text-sky-400" />
              </div>
              <p className="mt-4 leading-7 text-slate-600">{item.quote}</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Heart size={14} className="text-rose-400" />
                <span>{item.name}</span>
              </div>
            </Card>
          ))}
        </div>

        <section className="rounded-3xl border border-sky-100 bg-white/95 p-6 text-center shadow-md">
          <p className="text-sm text-slate-600">
            شاركنا تجربتك وساعد الآخرين في التعرف على احلامي
          </p>
          <Link
            href="/rate"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            قيّم التطبيق
            <ChevronLeft size={18} />
          </Link>
        </section>
      </main>

      <BottomNavigation />
    </div>
  )
}
