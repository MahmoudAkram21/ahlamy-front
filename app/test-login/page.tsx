"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function TestLoginPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const testInterpreterLogin = async () => {
    setLoading(true)
    setMessage("جاري الاختبار...")

    try {
      console.log("[Test Login] Attempting test login...")
      
      // Try to login with test credentials
      const result = await login(
        "interpreter@mubasharat.com",
        "interpreter123"
      )

      if (!result) {
        setMessage("خطأ: البريد الإلكتروني أو كلمة المرور غير صحيحة")
      } else {
        setMessage("تم الدخول بنجاح! جاري الانتقال...")
        console.log("[Test Login] Login successful, redirecting...")
        setTimeout(() => router.push("/dashboard"), 1500)
      }
    } catch (err: any) {
      console.error("[Test Login] Error:", err)
      setMessage(`خطأ: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sky-600 mb-2">احلامي</h1>
          <p className="text-gray-600">اختبار الدخول</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 mb-3">
              <strong>ملاحظة:</strong> يرجى أولاً إنشاء حساب جديد من صفحة التسجيل باستخدام بريدك الإلكتروني الحقيقي
            </p>
            <p className="text-sm text-blue-700">بعد إنشاء الحساب، يمكنك استخدام نفس البريد وكلمة المرور للدخول هنا</p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-700">
              <strong>البريد التجريبي:</strong> interpreter@mubasharat.com
            </p>
            <p className="text-sm text-yellow-700">
              <strong>كلمة المرور:</strong> interpreter123
            </p>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${message.includes("خطأ") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
            >
              {message}
            </div>
          )}

          <Button
            onClick={testInterpreterLogin}
            className="w-full bg-orange-600 hover:bg-orange-700"
            disabled={loading}
          >
            {loading ? "جاري الاختبار..." : "اختبار الدخول"}
          </Button>

          <Button onClick={() => router.push("/auth/sign-up")} variant="outline" className="w-full">
            إنشاء حساب جديد
          </Button>
        </div>
      </Card>
    </div>
  )
}
