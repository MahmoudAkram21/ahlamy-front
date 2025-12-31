"use client"

import { BottomNavigation } from "@/components/bottom-navigation"
import { InfoPageShell } from "@/components/info-page-shell"
import Link from "next/link"

export default function JoinPage() {
  return (
    <>
      <InfoPageShell
        title="انضم لفريق المعبّرين"
        subtitle="نبحث دائماً عن معبرين معتمدين يمتلكون علماً شرعياً وخبرة عملية في تفسير الرؤى."
        ctaLabel="قدّم طلب الانضمام"
        ctaHref="/support"
      >
        <section className="space-y-6 text-right">
          <div className="rounded-2xl border border-sky-100 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-900">متطلبات الانضمام</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• شهادة أو تزكية معتمدة في علوم تفسير الرؤى.</li>
              <li>• التزام بأخلاقيات المهنة واحترام خصوصية المستخدمين.</li>
              <li>• قدرة على الرد المتوازن والسريع عبر المنصة.</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-sky-50/70 p-5">
            <h3 className="text-base font-semibold text-slate-900">ماذا نقدّم لك؟</h3>
            <p className="mt-2 text-sm text-slate-600">
              توفر المنصة لوحة تحكم متقدمة، وإحصائيات لأداءك، مع فريق دعم فني يساندك لحظة بلحظة، إضافة إلى نظام تقييم
              يعزز حضورك وخبرتك.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
            <h3 className="text-base font-semibold text-slate-900">خطوات التقديم</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-slate-600">
              <li>أرسل نبذة عنك وسيرتك عبر نموذج التواصل.</li>
              <li>سنراجع الطلب ونتواصل معك لإجراء مقابلة قصيرة.</li>
              <li>بعد الموافقة، ستتلقى حساباً مخصصاً للوصول إلى لوحة المعبّر.</li>
            </ol>
          </div>

          <p className="text-sm text-slate-500">
            لمزيد من الاستفسارات يمكنك مراسلتنا على{" "}
            <Link href="mailto:support@ahlami.app" className="font-semibold text-sky-600 underline">
              support@ahlami.app
            </Link>
            .
          </p>
        </section>
      </InfoPageShell>
      <BottomNavigation />
    </>
  )
}


