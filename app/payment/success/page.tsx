"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check } from "lucide-react"
import { buildApiUrl } from "@/lib/api-client"

export default function PaymentSuccessPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [dreamId, setDreamId] = useState<string | null>(null)
    const [verifying, setVerifying] = useState(true)
    const [verificationError, setVerificationError] = useState<string | null>(null)

    useEffect(() => {
        const session_id = searchParams.get('session_id')
        const dream_id = searchParams.get('dreamId')
        setSessionId(session_id)
        setDreamId(dream_id)

        // Verify payment and update dream status
        const verifyPayment = async () => {
            if (!session_id) {
                setVerifying(false)
                return
            }

            try {
                const response = await fetch(buildApiUrl('/payments/verify-payment'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        sessionId: session_id,
                        dreamId: dream_id,
                    }),
                })

                if (!response.ok) {
                    const data = await response.json().catch(() => ({}))
                    console.error('[Payment Success] Verification failed:', data.error)
                    setVerificationError(data.error || 'فشل التحقق من الدفع')
                } else {
                    const data = await response.json()
                    console.log('[Payment Success] Verification succeeded:', data)
                }
            } catch (error) {
                console.error('[Payment Success] Verification error:', error)
                setVerificationError('حدث خطأ أثناء التحقق من الدفع')
            } finally {
                setVerifying(false)
            }
        }

        verifyPayment()
    }, [searchParams])

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-emerald-50 p-4">
            <div className="w-full max-w-md text-center">
                {/* Success Icon */}
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg">
                    <Check className="h-12 w-12 text-white" strokeWidth={3} />
                </div>

                {/* Title */}
                <h1 className="mb-3 text-3xl font-bold text-slate-900">
                    تم الدفع بنجاح! 🎉
                </h1>

                {/* Description */}
                <p className="mb-8 text-slate-600 leading-relaxed">
                    {dreamId 
                        ? "تم شراء الخطة لرؤيتك بنجاح! يمكنك الآن متابعة حالة الرؤيا."
                        : "تم تفعيل اشتراكك بنجاح. يمكنك الآن الاستمتاع بجميع مزايا الخطة التي اخترتها."
                    }
                </p>

                {/* Verification Status */}
                {verifying && (
                    <div className="mb-6 rounded-2xl bg-blue-50 border border-blue-200 p-4">
                        <p className="text-sm text-blue-700">جارٍ التحقق من الدفع وتحديث الحالة...</p>
                    </div>
                )}

                {verificationError && (
                    <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4">
                        <p className="text-sm text-amber-800">{verificationError}</p>
                        <p className="text-xs text-amber-600 mt-1">سيتم تحديث الحالة تلقائياً خلال دقائق</p>
                    </div>
                )}

                {/* Session ID (if available) */}
                {sessionId && (
                    <div className="mb-6 rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500 mb-1">رقم العملية</p>
                        <p className="text-sm font-mono text-slate-700">{sessionId}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    {dreamId ? (
                        <button
                            onClick={() => router.push(`/dream/${dreamId}`)}
                            className="w-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 px-6 py-3 font-semibold text-white shadow-md transition hover:shadow-xl"
                        >
                            عرض الرؤيا
                        </button>
                    ) : (
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 px-6 py-3 font-semibold text-white shadow-md transition hover:shadow-xl"
                        >
                            العودة إلى لوحة التحكم
                        </button>
                    )}

                    <button
                        onClick={() => router.push(dreamId ? '/dreams/new' : '/dashboard')}
                        className="w-full rounded-full border-2 border-sky-200 bg-white px-6 py-3 font-semibold text-sky-600 transition hover:bg-sky-50"
                    >
                        {dreamId ? 'إرسال رؤيا جديدة' : 'إرسال رؤيا جديدة'}
                    </button>
                </div>

                {/* Support Note */}
                <p className="mt-8 text-xs text-slate-500">
                    إذا كانت لديك أي استفسارات، يمكنك التواصل مع فريق الدعم
                </p>
            </div>
        </div>
    )
}
