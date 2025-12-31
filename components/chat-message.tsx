"use client"

interface ChatMessageProps {
  type: "interpreter" | "user"
  text: string
  senderName?: string
}

export function ChatMessage({ type, text, senderName }: ChatMessageProps) {
  return (
    <div className={`flex ${type === "user" ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-xs px-4 py-3 rounded-2xl ${
          type === "interpreter"
            ? "rounded-br-none bg-gradient-to-br from-sky-500 to-amber-300 text-white shadow-md"
            : "rounded-bl-none bg-slate-100 text-slate-900 shadow-sm"
        }`}
      >
        {senderName && <p className="text-xs font-semibold mb-1 opacity-90">{senderName}</p>}
        <p className="text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
