"use client"

import { Mic, Send } from "lucide-react"
import { useState } from "react"

interface ChatInputProps {
  onSend: (message: string) => void
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleSend = () => {
    if (inputValue.trim()) {
      onSend(inputValue)
      setInputValue("")
    }
  }

  return (
    <div className="sticky bottom-20 border-t border-sky-100 bg-white/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 shadow-sm">
        <input
          type="text"
          placeholder="كتابة رسالة"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
        />
        <Mic size={20} className="cursor-pointer text-slate-400 transition hover:text-slate-600" />
        <button
          onClick={handleSend}
          className="text-sky-500 transition hover:text-amber-400"
          aria-label="إرسال"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}
