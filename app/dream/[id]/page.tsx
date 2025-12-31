"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DreamHeader } from "@/components/dream-header"
import { DreamContentCard } from "@/components/dream-content-card"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { DreamActions } from "@/components/dream-actions"
import { getCurrentUser } from "@/lib/auth-client"
import { PageLoader } from "@/components/ui/preloader"
import { buildApiUrl } from "@/lib/api-client"

interface Message {
  id: string
  senderId: string
  content: string
  messageType: string
  createdAt: string
  sender?: {
    id: string
    role: string
    displayName?: string // Anonymous display name (الرائي or المفسر)
    // No fullName, avatarUrl, or email - all hidden for anonymity
  }
}

interface Dream {
  id: string
  title: string
  content: string
  status: string
  dreamerId: string
  interpreterId: string
  createdAt: string
  dreamer?: {
    id: string
    fullName: string
  }
}

export default function DreamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const [dream, setDream] = useState<Dream | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showActionsPanel, setShowActionsPanel] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[Dream Detail] Fetching data for dream:', unwrappedParams.id)

        // Check authentication
        const currentUser = await getCurrentUser()

        if (!currentUser) {
          console.log('[Dream Detail] No user found, redirecting to login')
          router.push("/auth/login")
          return
        }

        setCurrentUserId(currentUser.user.id)
        console.log('[Dream Detail] User authenticated:', currentUser.profile.email)

        // Fetch dream
        const dreamResponse = await fetch(buildApiUrl(`/dreams/${unwrappedParams.id}`), {
          credentials: 'include',
        })

        if (dreamResponse.status === 401) {
          router.push("/auth/login")
          return
        }

        if (!dreamResponse.ok) {
          console.error('[Dream Detail] Failed to fetch dream')
          router.push("/dreams")
          return
        }

        const dreamData = await dreamResponse.json()
        console.log('[Dream Detail] Dream loaded:', dreamData.title)
        setDream(dreamData)

        // Fetch messages
        const messagesResponse = await fetch(buildApiUrl(`/messages?dream_id=${unwrappedParams.id}`), {
          credentials: 'include',
        })

        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json()
          console.log('[Dream Detail] Loaded', messagesData.length, 'messages')
          setMessages(messagesData)
        }
      } catch (error) {
        console.error('[Dream Detail] Error fetching data:', error)
        router.push("/dreams")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [unwrappedParams.id, router])

  const handleSendMessage = async (messageText: string) => {
    if (!dream || !currentUserId) return

    try {
      console.log('[Dream Detail] Sending message...')

      const response = await fetch(buildApiUrl("/messages"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          dream_id: dream.id,
          content: messageText,
          message_type: "text",
        }),
      })

      if (response.ok) {
        const newMessage = await response.json()
        console.log('[Dream Detail] Message sent')
        setMessages([...messages, newMessage])
      } else {
        console.error('[Dream Detail] Failed to send message')
      }
    } catch (error) {
      console.error('[Dream Detail] Error sending message:', error)
    }
  }

  const handleMarkComplete = async () => {
    if (!dream) return
    setShowCompleteConfirm(false)
    setShowActionsPanel(false)

    try {
      const response = await fetch(buildApiUrl(`/dreams/${dream.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ status: "interpreted" }),
      })

      if (response.ok) {
        const updatedDream = await response.json()
        setDream(updatedDream)
      }
    } catch (error) {
      console.error("Error marking complete:", error)
    }
  }

  const handleReject = async () => {
    if (!dream) return
    setShowRejectConfirm(false)
    setShowActionsPanel(false)

    try {
      const response = await fetch(buildApiUrl(`/dreams/${dream.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ status: "returned" }),
      })

      if (response.ok) {
        const updatedDream = await response.json()
        setDream(updatedDream)
      }
    } catch (error) {
      console.error("Error rejecting dream:", error)
    }
  }

  if (loading) {
    return <PageLoader message="جاري تحميل تفاصيل الرؤية..." />
  }

  if (!dream) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-amber-50">
        <div className="rounded-3xl bg-white/90 px-8 py-6 text-slate-600 shadow-lg backdrop-blur">
          الرؤيا غير موجودة
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <DreamHeader dreamId={unwrappedParams.id} />

      <DreamContentCard
        content={dream.content}
        dreamerName="الرائي" // Anonymous - no real name shown
        submittedAt={`تم الإرسال: ${new Date(dream.createdAt).toLocaleDateString("ar-SA")} الساعة ${new Date(dream.createdAt).toLocaleTimeString("ar-SA")}`}
      />

      <div className="flex-1 px-4">
        <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4">
          <div className="flex-1 overflow-y-auto rounded-3xl border border-sky-100 bg-white/95 p-4 shadow-inner backdrop-blur">
            {messages.length === 0 ? (
              <div className="py-10 text-center text-slate-500">لا توجد رسائل بعد</div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    type={message.senderId === currentUserId ? "user" : "interpreter"}
                    text={message.content}
                    senderName={message.sender?.displayName || (message.sender?.role === 'dreamer' ? 'الرائي' : 'المفسر')}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Show disabled state if no interpreter assigned */}
          {!dream.interpreterId ? (
            <div className="rounded-3xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 rounded-full bg-amber-100 p-2">
                  <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-900 mb-1">
                    المحادثة غير متاحة حالياً
                  </h3>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    سيتم تفعيل المحادثة تلقائياً بمجرد أن يقوم المسؤول بتعيين مفسر لهذه الرؤيا. يرجى الانتظار حتى يتم تعيين مفسر متخصص للرد على رؤيتك.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <ChatInput onSend={handleSendMessage} />
          )}
        </div>
      </div>

      {/* Floating action button - only show if interpreter assigned */}
      {dream.interpreterId && (
        <button
          onClick={() => setShowActionsPanel(true)}
          className="fixed left-4 bottom-32 z-30 flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-amber-400 px-4 py-3 text-white shadow-lg transition hover:shadow-xl hover:-translate-y-1"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm font-semibold">خيارات الرؤيا</span>
        </button>
      )}

      {/* Slide-in panel */}
      {showActionsPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setShowActionsPanel(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl animate-slide-in-right">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-sky-600 to-amber-400 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">إجراءات الرؤيا</h2>
                  <button
                    onClick={() => setShowActionsPanel(false)}
                    className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 space-y-4">
                {/* Complete button */}
                <button
                  onClick={() => setShowCompleteConfirm(true)}
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 p-4 text-white shadow-md hover:shadow-lg transition hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">تم التفسير</span>
                  </div>
                </button>

                {/* Reject button */}
                <button
                  onClick={() => setShowRejectConfirm(true)}
                  className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-red-400 p-4 text-white shadow-md hover:shadow-lg transition hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">إرجاع الرؤيا</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Complete confirmation dialog */}
      {showCompleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">تأكيد إتمام التفسير</h3>
                <p className="text-slate-600 mb-6">
                  هل أنت متأكد من أنك قمت بتفسير هذه الرؤيا بالكامل؟
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCompleteConfirm(false)}
                    className="flex-1 rounded-full border-2 border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleMarkComplete}
                    className="flex-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 px-4 py-3 font-semibold text-white shadow-md hover:shadow-lg transition"
                  >
                    نعم، تم التفسير
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reject confirmation dialog */}
      {showRejectConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">تأكيد إرجاع الرؤيا</h3>
                <p className="text-slate-600 mb-6">
                  هل أنت متأكد من إرجاع هذه الرؤيا؟ سيتم إعادتها إلى صاحبها.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRejectConfirm(false)}
                    className="flex-1 rounded-full border-2 border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 rounded-full bg-gradient-to-r from-rose-500 to-red-400 px-4 py-3 font-semibold text-white shadow-md hover:shadow-lg transition"
                  >
                    نعم، إرجاع
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNavigation />
    </div>
  )
}
