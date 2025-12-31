"use client"

import Link from "next/link"

interface InfoPageShellProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  ctaLabel?: string
  ctaHref?: string
}

export function InfoPageShell({ title, subtitle, children, ctaHref, ctaLabel }: InfoPageShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <header className="bg-gradient-to-br from-sky-600 via-sky-500 to-amber-300 text-white shadow-xl">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h1 className="text-3xl font-bold tracking-wide">{title}</h1>
          {subtitle ? <p className="mt-3 text-sm text-white/80">{subtitle}</p> : null}
          {ctaHref && ctaLabel ? (
            <Link
              href={ctaHref}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-white/90 px-6 py-2 text-sm font-semibold text-sky-600 shadow-md transition hover:bg-white"
            >
              {ctaLabel}
            </Link>
          ) : null}
        </div>
      </header>

      <main className="mx-auto mt-6 w-full max-w-4xl px-4">
        <div className="rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-lg backdrop-blur">
          {children}
        </div>
      </main>
    </div>
  )
}


