"use client"

import type React from "react"
import { useState } from "react"
import { register } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<"dreamer" | "interpreter">("dreamer")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("[Auth] Attempting registration:", email)

      const result = await register(email, password, fullName, role)

      if (!result) {
        console.log("[Auth] Registration failed")
        setError("فشل إنشاء الحساب. قد يكون البريد الإلكتروني مستخدماً بالفعل.")
        return
      }

      console.log("[Auth] Registration successful:", result.user.id)
      setSuccess(true)
      
      // Redirect to dashboard after 1 second
      // Use window.location for auth redirects to ensure cookies are recognized
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1000)
    } catch (err) {
      console.log("[Auth] Signup error:", err)
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
          <p className="text-gray-600">إنشاء حساب جديد</p>
        </div>

        {success ? (
          <div className="p-4 bg-green-50 text-green-700 rounded-lg text-center">
            <p className="font-medium mb-2">✓ تم إنشاء الحساب بنجاح!</p>
            <p className="text-sm">جاري التوجيه إلى لوحة التحكم...</p>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أحمد محمد"
                required
                disabled={loading}
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع الحساب</label>
              <Select value={role} onValueChange={(value: any) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dreamer">رائي (صاحب الرؤيا)</SelectItem>
                  <SelectItem value="interpreter">مفسر أحلام</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
              {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            هل لديك حساب بالفعل؟{" "}
            <Link href="/auth/login" className="text-orange-600 hover:text-orange-700 font-medium">
              دخول
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
