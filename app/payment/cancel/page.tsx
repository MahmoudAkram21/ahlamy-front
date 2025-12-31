"use client"

import { useRouter } from "next/navigation"
import { X } from "lucide-react"

export default function PaymentCancelPage() {
    const router = useRouter()

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-amber-50 p-4">
            <div className="w-full max-w-md text-center">
                {/* Cancel Icon */}
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                    <X className="h-12 w-12 text-white" strokeWidth={3} />
                </div>

                {/* Title */}
                <h1 className="mb-3 text-3xl font-bold text-slate-900">
                    تم إلغاء العملية
                </h1>

                {/* Description */}
                <p className="mb-8 text-slate-600 leading-relaxed">
                    لم يتم إتمام عملية الدفع. لا داعي للقلق، لم يتم خصم أي رسوم من حسابك.
                </p>

                {/* Info Box */}
                <div className="mb-8 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                        💡 يمكنك المحاولة مرة أخرى في أي وقت أو تصفح الخطط المتاحة لاختيار ما يناسبك
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/plans')}
                        className="w-full rounded-full bg-gradient-to-r from-sky-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-md transition hover:shadow-xl"
                    >
                        عرض الخطط المتاحة
                    </button>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full rounded-full border-2 border-slate-200 bg-white px-6 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        العودة إلى لوحة التحكم
                    </button>
                </div>

                {/* Support Note */}
                <p className="mt-8 text-xs text-slate-500">
                    إذا واجهت أي مشكلة، يمكنك التواصل مع فريق الدعم للمساعدة
                </p>
            </div>
        </div>
    )
}
