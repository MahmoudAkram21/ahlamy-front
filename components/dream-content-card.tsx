"use client"

interface DreamContentCardProps {
  content: string
  dreamerName: string
  submittedAt: string
}

export function DreamContentCard({ content, dreamerName, submittedAt }: DreamContentCardProps) {
  return (
    <section className="px-4 pt-4">
      <div className="rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-md backdrop-blur">
        <div className="mb-4 rounded-2xl bg-sky-50/70 p-4">
          <p className="text-xs text-sky-600">الرائي</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{dreamerName}</p>
          <p className="mt-1 text-xs text-slate-500">{submittedAt}</p>
        </div>
        <h2 className="text-sm font-bold text-slate-800">محتوى الرؤية</h2>
        <p className="mt-3 leading-7 text-slate-700">{content}</p>
      </div>
    </section>
  )
}
