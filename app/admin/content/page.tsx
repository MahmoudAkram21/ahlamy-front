"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-client"
import { buildApiUrl } from "@/lib/api-client"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { PageLoader } from "@/components/ui/preloader"
import { FileText, Edit } from "lucide-react"

interface Page {
    id: string
    pageKey: string
    title: string | null
    isPublished: boolean
    updatedAt: string
}

export default function AdminContentPage() {
    const [pages, setPages] = useState<Page[]>([])
    const [loading, setLoading] = useState(true)
    const [seeding, setSeeding] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const loadPages = async () => {
            try {
                const user = await getCurrentUser()

                if (!user || user.profile.role !== 'super_admin') {
                    router.push('/dashboard')
                    return
                }

                const response = await fetch(buildApiUrl('/admin/pages'), {
                    credentials: 'include',
                })

                if (response.ok) {
                    const data = await response.json()
                    setPages(data.pages || [])
                }
            } catch (error) {
                console.error('[Admin Content] Error loading pages:', error)
            } finally {
                setLoading(false)
            }
        }

        loadPages()
    }, [router])

    const handleSeedPages = async () => {
        try {
            setSeeding(true)
            const response = await fetch(buildApiUrl('/admin/pages/seed'), {
                method: 'POST',
                credentials: 'include',
            })

            if (response.ok) {
                // Reload pages
                const pagesResponse = await fetch(buildApiUrl('/admin/pages'), {
                    credentials: 'include',
                })
                if (pagesResponse.ok) {
                    const data = await pagesResponse.json()
                    setPages(data.pages || [])
                }
            }
        } catch (error) {
            console.error('[Admin Content] Seed error:', error)
        } finally {
            setSeeding(false)
        }
    }

    if (loading) {
        return <PageLoader message="جاري تحميل المحتوى..." />
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
            <DashboardHeader />

            <main className="mx-auto mt-6 w-full max-w-5xl px-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">إدارة محتوى الصفحات</h1>
                        <p className="text-sm text-slate-600">تحرير محتوى الصفحات الثابتة للمنصة</p>
                    </div>

                    {pages.length === 0 && (
                        <Button
                            onClick={handleSeedPages}
                            disabled={seeding}
                            className="rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-2 text-white"
                        >
                            {seeding ? "جاري الإنشاء..." : "إنشاء الصفحات الافتراضية"}
                        </Button>
                    )}
                </div>

                {pages.length === 0 ? (
                    <div className="rounded-3xl border-2 border-dashed border-sky-200 bg-white/80 p-12 text-center">
                        <FileText className="mx-auto mb-4 h-16 w-16 text-sky-400" />
                        <h3 className="mb-2 text-lg font-bold text-slate-900">لا توجد صفحات بعد</h3>
                        <p className="mb-4 text-sm text-slate-600">
                            قم بإنشاء الصفحات الافتراضية للبدء في تحرير المحتوى
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {pages.map((page) => (
                            <div
                                key={page.id}
                                className="group relative overflow-hidden rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="rounded-full bg-sky-50 p-2">
                                        <FileText className="h-5 w-5 text-sky-600" />
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${page.isPublished
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-slate-100 text-slate-600"
                                            }`}
                                    >
                                        {page.isPublished ? "منشور" : "مسودة"}
                                    </span>
                                </div>

                                <h3 className="mb-2 text-lg font-bold text-slate-900">
                                    {page.title || page.pageKey}
                                </h3>

                                <p className="mb-4 text-xs text-slate-500">
                                    المفتاح: {page.pageKey}
                                </p>

                                <button
                                    onClick={() => router.push(`/admin/content/${page.pageKey}`)}
                                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-amber-400 px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg"
                                >
                                    <Edit className="h-4 w-4" />
                                    <span>تحرير</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <BottomNavigation />
        </div>
    )
}
