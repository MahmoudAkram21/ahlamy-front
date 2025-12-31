import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
      <Card className="w-full max-w-md p-8 shadow-lg text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تم إنشاء الحساب بنجاح</h1>
          <p className="text-gray-600">يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-700">تحقق من صندوق البريد الوارد أو مجلد الرسائل غير المرغوبة</p>
        </div>

        <Link href="/auth/login">
          <Button className="w-full bg-orange-600 hover:bg-orange-700">العودة للدخول</Button>
        </Link>
      </Card>
    </div>
  )
}
