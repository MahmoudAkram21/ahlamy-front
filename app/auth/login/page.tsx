"use client"

import type React from "react"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { login } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("[Auth] Attempting login with:", email)

      const result = await login(email, password)

      if (!result) {
        console.log("[Auth] Login failed")
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة")
        return
      }

      console.log("[Auth] Login successful:", result.user.id)
      
      // Redirect immediately - cookie should be set by the API route
      const redirect = searchParams.get('redirect') || '/dashboard'
      window.location.href = redirect
    } catch (err) {
      console.log("[Auth] Login exception:", err)
      setError("حدث خطأ ما. يرجى المحاولة مرة أخرى.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sky-600 mb-2">احلامي</h1>
          <p className="text-gray-600">منصة تفسير الرؤى والأحلام</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
            {loading ? "جاري الدخول..." : "دخول"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            ليس لديك حساب؟{" "}
            <Link href="/auth/sign-up" className="text-orange-600 hover:text-orange-700 font-medium">
              إنشاء حساب
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
