"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/api-client"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { ArrowRight, Eye, X, RotateCcw } from "lucide-react"
import { buildApiUrl } from "@/lib/api-client"
import { PageLoader } from "@/components/ui/preloader"

interface ChatMsg {
  id: string
  senderId: string
  content: string
  createdAt: string
  editedAt?: string | null
  sender?: { fullName: string }
}

interface Request {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  dream?: { id: string; title: string; content: string }
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [request, setRequest] = useState<Request | null>(null)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [visionReopened, setVisionReopened] = useState(false)
  const [returning, setReturning] = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)
  const [visionReopenedForChat, setVisionReopenedForChat] = useState(false)
  const router = useRouter()
  const { id } = use(params)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[Request Detail] Fetching data for request:', id)
        
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          console.log('[Request Detail] No user found, redirecting to login')
          router.push("/auth/login")
          return
        }
        
        setCurrentUserId(currentUser.user.id)

        // Fetch request
        const requestResponse = await fetch(buildApiUrl(`/requests/${id}`), {
          credentials: 'include',
        })

        if (!requestResponse.ok) {
          router.push("/interpreter/dashboard")
          return
        }

        const requestData = await requestResponse.json()
        setRequest(requestData)

        // Fetch chat messages
        const messagesResponse = await fetch(buildApiUrl(`/chat?request_id=${id}`), {
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
  }, [id, router])

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
      const response = await fetch(buildApiUrl(`/requests/${request.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'completed' }),
      })

      if (response.ok) {
        const updated = await response.json()
        setRequest((prev) => (prev ? { ...prev, ...updated, status: updated.status ?? "completed" } : prev))
      }
    } catch (error) {
      console.error('[Request Detail] Error completing request:', error)
    }
  }

  const handleReturnVision = async () => {
    if (!request) return
    try {
      setReturning(true)
      const response = await fetch(buildApiUrl(`/requests/${request.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'returned' }),
      })
      if (response.ok) {
        router.push("/interpreter/dashboard")
      }
    } catch (error) {
      console.error('[Request Detail] Error returning vision:', error)
    } finally {
      setReturning(false)
    }
  }

  const visionTitle = request?.dream?.title ?? request?.title ?? ""
  const visionContent = request?.dream?.content ?? request?.description ?? ""

  const EDIT_WINDOW_MS = 10 * 60 * 1000
  const isMessageEditable = (msg: ChatMsg) => {
    if (!currentUserId || msg.senderId !== currentUserId) return false
    const created = new Date(msg.createdAt).getTime()
    return Date.now() - created < EDIT_WINDOW_MS
  }

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      const response = await fetch(buildApiUrl(`/chat/messages/${messageId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newContent }),
      })
      if (response.ok) {
        const updated = await response.json()
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, content: updated.content, editedAt: updated.editedAt } : m))
        )
      }
    } catch (error) {
      console.error("[Request Detail] Error editing message:", error)
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
        <section className="rounded-3xl border border-sky-100 bg-white/95 shadow-inner backdrop-blur overflow-hidden">
          <button
            type="button"
            onClick={() => setMessagesOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-right hover:bg-sky-50/50 transition"
          >
            <span className="text-sm font-semibold text-slate-700">
              الرسائل {messages.length > 0 && `(${messages.length})`}
            </span>
            <svg
              className={`h-5 w-5 text-slate-500 transition-transform ${messagesOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {messagesOpen && (
            <div className="overflow-y-auto max-h-[320px] p-4 pt-0 border-t border-sky-100">
              {messages.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">لا توجد رسائل بعد</div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      type={msg.senderId === currentUserId ? "user" : "interpreter"}
                      text={msg.content}
                      senderName={msg.sender?.fullName}
                      messageId={msg.id}
                      createdAt={msg.createdAt}
                      editedAt={msg.editedAt}
                      isEditable={isMessageEditable(msg)}
                      onEdit={handleEditMessage}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {(() => {
          const isCompleted = String(request.status || "").toLowerCase() === "completed"
          if (isCompleted && !visionReopenedForChat) {
            return (
              <div className="rounded-3xl border border-sky-100 bg-white/95 p-4 shadow-md">
                <p className="text-sm text-slate-600 text-center mb-3">
                  تم تفسير هذه الرؤيا. لكتابة رسالة جديدة يمكنك إعادة فتح الرؤية للمحادثة.
                </p>
                <button
                  type="button"
                  onClick={() => setVisionReopenedForChat(true)}
                  className="w-full rounded-full bg-gradient-to-r from-sky-500 to-amber-400 px-4 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition"
                >
                  إعادة فتح الرؤية للمحادثة
                </button>
              </div>
            )
          }
          if (!isCompleted || visionReopenedForChat) {
            return <ChatInput onSend={handleSendMessage} />
          }
          return null
        })()}

        {(() => {
          const isCompleted = String(request.status || "").toLowerCase() === "completed"
          if (!isCompleted) {
            return (
              <div className="rounded-3xl border border-sky-100 bg-white/95 p-4 shadow-md backdrop-blur">
                <button
                  onClick={handleCompleteRequest}
                  className="w-full rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-amber-300 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  إكمال الطلب
                </button>
              </div>
            )
          }
          return (
          <div className="rounded-3xl border border-sky-100 bg-white/95 p-4 shadow-md backdrop-blur space-y-3">
            {!visionReopened ? (
              <button
                onClick={() => setVisionReopened(true)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-6 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                <Eye size={18} />
                إعادة فتح الرؤية
              </button>
            ) : (
              <>
                <div className="rounded-2xl border border-sky-100 bg-slate-50/80 p-4 text-right">
                  <h3 className="text-sm font-semibold text-slate-900">{visionTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{visionContent}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVisionReopened(false)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <X size={18} />
                    غلق الرؤيه
                  </button>
                  <button
                    onClick={handleReturnVision}
                    disabled={returning}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-200 disabled:opacity-70"
                  >
                    <RotateCcw size={18} />
                    {returning ? "جاري الإرجاع..." : "إرجاعها"}
                  </button>
                </div>
              </>
            )}
          </div>
          )
        })()}
      </main>

      <BottomNavigation />
    </div>
  )
}
