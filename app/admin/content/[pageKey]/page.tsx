"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-client"
import { buildApiUrl } from "@/lib/api-client"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { PageLoader } from "@/components/ui/preloader"
import { ArrowRight, Save, Eye } from "lucide-react"

interface PageContent {
    id: string
    pageKey: string
    title: string | null
    content: string
    metadata: any
    isPublished: boolean
}

export default function EditContentPage({ params }: { params: Promise<{ pageKey: string }> }) {
    const unwrappedParams = use(params)
    const [page, setPage] = useState<PageContent | null>(null)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [isPublished, setIsPublished] = useState(true)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const loadPage = async () => {
            try {
                const user = await getCurrentUser()

                if (!user || user.profile.role !== 'super_admin') {
                    router.push('/dashboard')
                    return
                }

                const response = await fetch(buildApiUrl(`/admin/pages/${unwrappedParams.pageKey}`), {
                    credentials: 'include',
                })

                if (response.ok) {
                    const data = await response.json()
                    setPage(data.page)
                    setTitle(data.page.title || '')
                    setContent(data.page.content || '')
                    setIsPublished(data.page.isPublished)
                } else {
                    router.push('/admin/content')
                }
            } catch (error) {
                console.error('[Edit Content] Error loading page:', error)
                router.push('/admin/content')
            } finally {
                setLoading(false)
            }
        }

        loadPage()
    }, [unwrappedParams.pageKey, router])

    const handleSave = async () => {
        try {
            setSaving(true)

            const response = await fetch(buildApiUrl(`/admin/pages/${unwrappedParams.pageKey}`), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    title,
                    content,
                    isPublished,
                }),
            })

            if (response.ok) {
                alert('تم حفظ التغييرات بنجاح ✓')
            } else {
                alert('حدث خطأ أثناء الحفظ')
            }
        } catch (error) {
            console.error('[Edit Content] Save error:', error)
            alert('حدث خطأ أثناء الحفظ')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <PageLoader message="جاري تحميل الصفحة..." />
    }

    if (!page) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
            <DashboardHeader />

            <main className="mx-auto mt-6 w-full max-w-6xl px-4">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="rounded-full bg-white/70 p-2 text-slate-600 shadow-sm transition hover:text-sky-600"
                        >
                            <ArrowRight size={22} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">تحرير: {page.pageKey}</h1>
                            <p className="text-sm text-slate-600">تعديل محتوى الصفحة</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={() => window.open(`/${page.pageKey}`, '_blank')}
                            className="rounded-full border-2 border-sky-200 bg-white px-4 py-2 text-sky-600 hover:bg-sky-50"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            <span>معاينة</span>
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-full bg-gradient-to-r from-sky-500 to-green-500 px-6 py-2 text-white"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Title */}
                    <div className="rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-lg">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            عنوان الصفحة
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 text-lg outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
                            placeholder="أدخل عنوان الصفحة"
                        />
                    </div>

                    {/* Content */}
                    <div className="rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-lg">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            محتوى الصفحة (HTML)
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={20}
                            className="w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 font-mono text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
                            placeholder="أدخل محتوى الصفحة بصيغة HTML"
                        />
                        <p className="mt-2 text-xs text-slate-500">
                            يمكنك استخدام HTML لتنسيق المحتوى (h1, h2, p, ul, li, etc.)
                        </p>
                    </div>

                    {/* Publish Toggle */}
                    <div className="rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-semibold text-slate-700">
                                    حالة النشر
                                </label>
                                <p className="text-xs text-slate-500">
                                    عند الإيقاف، لن تظهر الصفحة للمستخدمين
                                </p>
                            </div>
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={isPublished}
                                    onChange={(e) => setIsPublished(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:right-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300"></div>
                                <span className="mr-3 text-sm font-medium text-slate-700">
                                    {isPublished ? 'منشور' : 'مسودة'}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </main>

            <BottomNavigation />
        </div>
    )
}
