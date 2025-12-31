"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { buildApiUrl } from "@/lib/api-client"

export default function AdminSetupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("[Admin Setup] Creating admin account with:", email)

      const response = await fetch(buildApiUrl('/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          fullName,
          role: 'admin',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "فشل إنشاء الحساب")
        return
      }

      const data = await response.json()
      
      // Now update to make them super admin
      const updateResponse = await fetch(buildApiUrl('/admin/make-super-admin'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: data.user.id,
        }),
      })

      if (!updateResponse.ok) {
        console.log("[Admin Setup] Warning: Could not set super admin flag")
      }

      console.log("[Admin Setup] Admin account created successfully")
      setSuccess(true)

      // Redirect to admin page after 2 seconds
      setTimeout(() => {
        router.push("/admin")
      }, 2000)
    } catch (err) {
      console.log("[Admin Setup] Admin setup exception:", err)
      setError("حدث خطأ ما. يرجى المحاولة مرة أخرى.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
        <Card className="w-full max-w-md p-8 shadow-lg text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">تم إنشاء حساب المسؤول بنجاح</h2>
          <p className="text-gray-600 mb-4">جاري إعادة التوجيه إلى صفحة دخول المسؤول...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sky-600 mb-2">احلامي</h1>
          <p className="text-gray-600">إعداد حساب المسؤول</p>
        </div>

        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="اسم المسؤول"
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
              placeholder="admin@mubasharat.com"
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
            {loading ? "جاري الإنشاء..." : "إنشاء حساب المسؤول"}
          </Button>
        </form>

        <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
          <p className="font-medium">ملاحظة:</p>
          <p>هذه الصفحة لإنشاء حساب المسؤول الأول فقط. بعد الإنشاء، استخدم صفحة دخول المسؤول.</p>
        </div>
      </Card>
    </div>
  )
}
