```typescript
"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-client"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { ArrowRight } from "lucide-react"
import { buildApiUrl } from "@/lib/api-client"
import { PageLoader } from "@/components/ui/preloader"

interface ChatMsg {
  id: string
  senderId: string
  content: string
  createdAt: string
  sender?: { fullName: string }
}

interface Request {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
}

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const [request, setRequest] = useState<Request | null>(null)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[Request Detail] Fetching data for request:', unwrappedParams.id)
        
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          console.log('[Request Detail] No user found, redirecting to login')
          router.push("/auth/login")
          return
        }
        
        setCurrentUserId(currentUser.user.id)

        // Fetch request
        const requestResponse = await fetch(buildApiUrl(`/ requests / ${ unwrappedParams.id } `), {
          credentials: 'include',
        })

        if (!requestResponse.ok) {
          router.push("/interpreter/dashboard")
          return
        }

        const requestData = await requestResponse.json()
        setRequest(requestData)

        // Fetch chat messages
        const messagesResponse = await fetch(buildApiUrl(`/ chat ? request_id = ${ unwrappedParams.id } `), {
          credentials: 'include',
        })

        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json()
          setMessages(messagesData || [])
        }
      } catch (error) {
        console.error('[Request Detail] Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [unwrappedParams.id, router])

  const handleSendMessage = async (content: string) => {
    if (!request || !currentUserId) return

    try {
      const response = await fetch(buildApiUrl('/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          request_id: request.id,
          content,
          message_type: 'text',
        }),
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages([...messages, newMessage])
      }
    } catch (error) {
      console.error('[Request Detail] Error sending message:', error)
    }
  }

  const handleCompleteRequest = async () => {
    if (!request) return

    try {
      const response = await fetch(buildApiUrl(`/ requests / ${ request.id } `), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'completed' }),
      })

      if (response.ok) {
        setRequest({ ...request, status: 'completed' })
      }
    } catch (error) {
      console.error('[Request Detail] Error completing request:', error)
    }
  }

  if (loading) {
    return <PageLoader message="جاري تحميل تفاصيل الطلب..." />
  }

  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-amber-50">
        <div className="rounded-3xl bg-white/90 px-8 py-6 text-slate-600 shadow-lg backdrop-blur">
          الطلب غير موجود
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-sky-600 via-sky-500 to-amber-300 px-4 py-4 text-white shadow-md">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-full bg-white/15 p-2 transition hover:bg-white/25"
            aria-label="عودة"
          >
            <ArrowRight size={22} />
          </button>
          <div className="flex-1 text-right">
            <h1 className="text-lg font-semibold leading-snug">{request.title}</h1>
            <p className="text-xs text-white/80">{request.description}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-4">
        <section className="rounded-3xl border border-sky-100 bg-white/95 p-4 shadow-inner backdrop-blur">
          {messages.length === 0 ? (
            <div className="py-10 text-center text-slate-500">لا توجد رسائل بعد</div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  type={msg.senderId === currentUserId ? "user" : "interpreter"}
                  text={msg.content}
                  senderName={msg.sender?.fullName}
                />
              ))}
            </div>
          )}
        </section>

        <ChatInput onSend={handleSendMessage} />

        {request.status !== "completed" && (
          <div className="rounded-3xl border border-sky-100 bg-white/95 p-4 shadow-md backdrop-blur">
            <button
              onClick={handleCompleteRequest}
              className="w-full rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-amber-300 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              إكمال الطلب
            </button>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
