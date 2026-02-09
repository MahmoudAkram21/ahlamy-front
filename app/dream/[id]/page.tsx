"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/bottom-navigation";
import { DreamHeader } from "@/components/dream-header";
import { DreamContentCard } from "@/components/dream-content-card";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCurrentUser,
  buildApiUrl,
  getAuthTokenFromCookie,
  getSocketServerUrl,
} from "@/lib/api-client";
import { PageLoader } from "@/components/ui/preloader";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  senderId: string;
  content: string;
  messageType?: string;
  createdAt: string;
  editedAt?: string | null;
  sender?: {
    id: string;
    role?: string;
    fullName?: string;
    displayName?: string;
  };
}

interface Dream {
  id: string;
  title: string;
  content: string;
  status: string;
  dreamerId: string;
  interpreterId: string | null;
  createdAt: string;
  dreamer?: {
    id: string;
    fullName: string;
  };
  interpreter?: {
    id: string;
    fullName: string;
  } | null;
  interpreterRating?: { rating: number } | null;
}

interface InterpreterOption {
  id: string;
  fullName: string | null;
  email: string;
  isAvailable: boolean;
}

export default function DreamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const [dream, setDream] = useState<Dream | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showActionsPanel, setShowActionsPanel] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [visionReopenedForChat, setVisionReopenedForChat] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [requestIdForChat, setRequestIdForChat] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [interpreters, setInterpreters] = useState<InterpreterOption[]>([]);
  const [selectedInterpreterId, setSelectedInterpreterId] = useState<string>("");
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(
          "[Dream Detail] Fetching data for dream:",
          unwrappedParams.id,
        );

        // Check authentication
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          console.log("[Dream Detail] No user found, redirecting to login");
          router.push("/auth/login");
          return;
        }

        setCurrentUserId(currentUser.user.id);
        setUserRole(currentUser.profile?.role ?? null);
        console.log(
          "[Dream Detail] User authenticated:",
          currentUser.profile.email,
        );

        const isAdmin =
          currentUser.profile?.role === "admin" ||
          currentUser.profile?.role === "super_admin";
        if (isAdmin) {
          const interpretersRes = await fetch(
            buildApiUrl("/admin/interpreters"),
            { credentials: "include" },
          );
          if (interpretersRes.ok) {
            const { interpreters: list } = await interpretersRes.json();
            setInterpreters(list ?? []);
          }
        }

        // Fetch dream
        const dreamResponse = await fetch(
          buildApiUrl(`/dreams/${unwrappedParams.id}`),
          {
            credentials: "include",
          },
        );

        if (dreamResponse.status === 401) {
          router.push("/auth/login");
          return;
        }

        if (!dreamResponse.ok) {
          console.error("[Dream Detail] Failed to fetch dream");
          router.push("/dreams");
          return;
        }

        const dreamData = await dreamResponse.json();
        console.log("[Dream Detail] Dream loaded:", dreamData.title);
        setDream(dreamData);
        if (dreamData.interpreterId) {
          setSelectedInterpreterId(dreamData.interpreterId);
        } else {
          setSelectedInterpreterId("");
        }

        let requestId: string | null = null;
        if (dreamData.interpreterId) {
          const requestsRes = await fetch(buildApiUrl("/requests"), {
            credentials: "include",
          });
          if (requestsRes.ok) {
            const requestsList = await requestsRes.json();
            const reqForDream = Array.isArray(requestsList)
              ? requestsList.find((r: { dream?: { id: string } }) => r.dream?.id === dreamData.id)
              : null;
            if (reqForDream?.id) {
              requestId = reqForDream.id;
              setRequestIdForChat(reqForDream.id);
            }
          }
        }

        // Always load messages by dream_id so they persist (same source as POST /messages)
        const messagesResponse = await fetch(
          buildApiUrl(`/messages?dream_id=${unwrappedParams.id}`),
          { credentials: "include" },
        );
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setMessages(messagesData || []);
        }
      } catch (error) {
        console.error("[Dream Detail] Error fetching data:", error);
        router.push("/dreams");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [unwrappedParams.id, router]);

  // WebSocket: connect and join dream room for real-time messages
  useEffect(() => {
    if (!dream?.id || !dream.interpreterId) return;
    const token = getAuthTokenFromCookie();
    const socketUrl = getSocketServerUrl();
    if (!socketUrl || !token) return;

    const s = io(socketUrl, {
      path: "/socket.io",
      withCredentials: true,
      auth: { token },
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => {
      s.emit("join_dream", { dreamId: dream.id });
    });

    s.on("message:new", (newMessage: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    setSocket(s);
    return () => {
      s.emit("leave_dream", { dreamId: dream.id });
      s.disconnect();
      setSocket(null);
    };
  }, [dream?.id, dream?.interpreterId]);

  const handleSendMessage = async (messageText: string) => {
    if (!dream || !currentUserId) return;

    try {
      console.log("[Dream Detail] Sending message...");

      const response = await fetch(buildApiUrl("/messages"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          dream_id: dream.id,
          content: messageText,
          message_type: "text",
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        console.log("[Dream Detail] Message sent");
        setMessages([...messages, newMessage]);
      } else {
        console.error("[Dream Detail] Failed to send message");
      }
    } catch (error) {
      console.error("[Dream Detail] Error sending message:", error);
    }
  };

  const handleMarkComplete = async () => {
    if (!dream) return;
    setShowCompleteConfirm(false);
    setShowActionsPanel(false);

    try {
      const response = await fetch(buildApiUrl(`/dreams/${dream.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "interpreted" }),
      });

      if (response.ok) {
        const updatedDream = await response.json();
        setDream(updatedDream);
      }
    } catch (error) {
      console.error("Error marking complete:", error);
    }
  };

  const handleReject = async () => {
    if (!dream) return;
    setShowRejectConfirm(false);
    setShowActionsPanel(false);

    try {
      const response = await fetch(buildApiUrl(`/dreams/${dream.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "returned" }),
      });

      if (response.ok) {
        const updatedDream = await response.json();
        setDream(updatedDream);
      }
    } catch (error) {
      console.error("Error rejecting dream:", error);
    }
  };

  const handleRateInterpreter = async (stars: number) => {
    if (!dream) return;
    setRatingSubmitting(true);
    try {
      const response = await fetch(buildApiUrl(`/dreams/${dream.id}/rate`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating: stars }),
      });
      if (response.ok) {
        setDream((prev) =>
          prev ? { ...prev, interpreterRating: { rating: stars } } : prev
        );
      }
    } catch (error) {
      console.error("Error rating interpreter:", error);
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleAssignInterpreter = async () => {
    if (!dream || !selectedInterpreterId) return;
    setAssignSubmitting(true);
    try {
      const response = await fetch(buildApiUrl(`/dreams/${dream.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ interpreter_id: selectedInterpreterId }),
      });
      if (response.ok) {
        const updatedDream = await response.json();
        setDream(updatedDream);
      }
    } catch (error) {
      console.error("Error assigning interpreter:", error);
    } finally {
      setAssignSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader message="جاري تحميل تفاصيل الرؤية..." />;
  }

  if (!dream) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-amber-50">
        <div className="rounded-3xl bg-white/90 px-8 py-6 text-slate-600 shadow-lg backdrop-blur">
          الرؤيا غير موجودة
        </div>
      </div>
    );
  }

  const isAssigningAdmin =
    userRole === "admin" || userRole === "super_admin";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <DreamHeader dreamId={unwrappedParams.id} />

      {isAssigningAdmin && (
        <div className="mx-auto mt-4 w-full max-w-3xl px-4">
          <div className="rounded-3xl border border-sky-200 bg-white/95 p-4 shadow-md backdrop-blur">
            <h3 className="text-sm font-bold text-slate-800 mb-3">
              تعيين المفسر
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <Select
                value={selectedInterpreterId || undefined}
                onValueChange={(value) => setSelectedInterpreterId(value)}
              >
                <SelectTrigger className="flex-1 min-w-0 border-sky-200">
                  <SelectValue placeholder="اختر المفسر" />
                </SelectTrigger>
                <SelectContent>
                  {interpreters.map((interpreter) => (
                    <SelectItem
                      key={interpreter.id}
                      value={interpreter.id}
                    >
                      {interpreter.fullName || interpreter.email}
                      {interpreter.isAvailable && (
                        <span className="text-emerald-600 text-xs mr-1">
                          (متاح)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAssignInterpreter}
                disabled={!selectedInterpreterId || assignSubmitting}
                className="rounded-full bg-gradient-to-r from-sky-500 to-amber-400 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition shrink-0"
              >
                {assignSubmitting ? "جاري التعيين..." : "تعيين"}
              </Button>
            </div>
            {dream.interpreter && (
              <p className="text-xs text-slate-500 mt-2">
                المفسر الحالي: {dream.interpreter.fullName || dream.interpreter.id}
              </p>
            )}
          </div>
        </div>
      )}

      <DreamContentCard
        content={dream.content}
        dreamerName="الرائي" // Anonymous - no real name shown
        submittedAt={`تم الإرسال: ${new Date(dream.createdAt).toLocaleDateString("ar-SA")} الساعة ${new Date(dream.createdAt).toLocaleTimeString("ar-SA")}`}
      />

      <div className="flex-1 px-4">
        <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4">
          <div className="rounded-3xl border border-sky-100 bg-white/95 shadow-inner backdrop-blur overflow-hidden">
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
              <div className="flex-1 overflow-y-auto max-h-[320px] p-4 pt-0 border-t border-sky-100">
                {messages.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-sm">
                    لا توجد رسائل بعد
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        type={
                          message.senderId === currentUserId
                            ? "user"
                            : "interpreter"
                        }
                        text={message.content}
                        senderName={
                          message.sender?.displayName ||
                          (message.sender?.role === "dreamer" ? "الرائي" : "المفسر")
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Show payment required banner if unpaid */}
          {dream.status === "pending_payment" ? (
            <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-lg text-center">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">
                هذه الرؤيا بانتظار الدفع
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                يرجى اختيار باقة مناسبة لتفعيل الرؤيا وجعلها متاحة للمفسرين. بعد
                الدفع، ستتمكن من التواصل مع المفسر مباشرة.
              </p>
              <Button
                onClick={() =>
                  router.push(
                    `/plans?dreamId=${dream.id}&letterCount=${Array.from(dream.content).length}`,
                  )
                }
                className="rounded-full bg-gradient-to-r from-amber-500 to-orange-400 px-8 py-4 text-lg font-bold text-white shadow-xl transition hover:-translate-y-1"
              >
                اختر خطة وادفع الآن
              </Button>
            </div>
          ) : !dream.interpreterId ? (
            <div className="rounded-3xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 rounded-full bg-amber-100 p-2">
                  <svg
                    className="h-6 w-6 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-900 mb-1">
                    المحادثة غير متاحة حالياً
                  </h3>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    سيتم تفعيل المحادثة تلقائياً بمجرد أن يقوم المسؤول بتعيين
                    مفسر لهذه الرؤيا. يرجى الانتظار حتى يتم تعيين مفسر متخصص
                    للرد على رؤيتك.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* تقييم المفسر — للرائي فقط بعد اكتمال التفسير */}
              {String(dream.status || "").toLowerCase() === "interpreted" &&
                dream.dreamerId === currentUserId && (
                  <div className="rounded-3xl border border-sky-100 bg-white/95 p-4 shadow-md mb-4">
                    <p className="text-sm font-semibold text-slate-700 text-center mb-2">
                      قيّم المفسر
                    </p>
                    {dream.interpreterRating ? (
                      <p className="text-sm text-amber-600 text-center">
                        شكراً، قيّمت المفسر بـ {dream.interpreterRating.rating} نجوم
                      </p>
                    ) : (
                      <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            disabled={ratingSubmitting}
                            onClick={() => handleRateInterpreter(star)}
                            className="p-1 rounded transition hover:scale-110 disabled:opacity-50"
                            aria-label={`${star} نجوم`}
                          >
                            <svg
                              className="h-8 w-8 text-amber-400 hover:text-amber-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              {(() => {
                const isInterpreted =
                  String(dream.status || "").toLowerCase() === "interpreted"
                if (isInterpreted && !visionReopenedForChat) {
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
                return <ChatInput onSend={handleSendMessage} />
              })()}
            </>
          )}
        </div>
      </div>

      {/* Floating action button - only show if interpreter assigned */}
      {dream.interpreterId && userRole !== "interpreter" && (
        <button
          onClick={() => setShowActionsPanel(true)}
          className="fixed left-4 bottom-32 z-30 flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-amber-400 px-4 py-3 text-white shadow-lg transition hover:shadow-xl hover:-translate-y-1"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
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
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content: تم التفسير for interpreter only; إرجاع الرؤيا for both when interpreted */}
              <div className="flex-1 p-6 space-y-4">
                {(() => {
                  const isInterpreted =
                    String(dream?.status || "").toLowerCase() === "interpreted"
                  const isInterpreter =
                    dream != null && currentUserId != null && dream.interpreterId === currentUserId
                  if (!isInterpreted) {
                    if (isInterpreter) {
                      return (
                        <button
                          onClick={() => setShowCompleteConfirm(true)}
                          className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 p-4 text-white shadow-md hover:shadow-lg transition hover:-translate-y-0.5"
                        >
                          <div className="flex items-center gap-3">
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="font-semibold">تم التفسير</span>
                          </div>
                        </button>
                      )
                    }
                    return (
                      <p className="text-center text-slate-500 text-sm py-2">
                        فقط المفسر يمكنه إتمام التفسير
                      </p>
                    )
                  }
                  return (
                    <button
                      onClick={() => setShowRejectConfirm(true)}
                      className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-red-400 p-4 text-white shadow-md hover:shadow-lg transition hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="font-semibold">إرجاع الرؤيا</span>
                      </div>
                    </button>
                  )
                })()}
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
                  <svg
                    className="h-8 w-8 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  تأكيد إتمام التفسير
                </h3>
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
                  <svg
                    className="h-8 w-8 text-rose-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  تأكيد إرجاع الرؤيا
                </h3>
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
  );
}
