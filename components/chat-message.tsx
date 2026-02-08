"use client"

import { useState } from "react"
import { Pencil, Check, X } from "lucide-react"

interface ChatMessageProps {
  type: "interpreter" | "user"
  text: string
  senderName?: string
  messageId?: string
  createdAt?: string
  editedAt?: string | null
  isEditable?: boolean
  onEdit?: (messageId: string, newContent: string) => Promise<void>
}

export function ChatMessage({
  type,
  text,
  senderName,
  messageId,
  createdAt,
  editedAt,
  isEditable,
  onEdit,
}: ChatMessageProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(text)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!messageId || !onEdit || editValue.trim() === text) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      await onEdit(messageId, editValue.trim())
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(text)
    setEditing(false)
  }

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
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full min-h-[80px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-300"
              dir="rtl"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200 transition"
                aria-label="إلغاء"
              >
                <X size={18} />
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editValue.trim()}
                className="rounded-full p-1.5 text-sky-600 hover:bg-sky-100 transition disabled:opacity-50"
                aria-label="حفظ"
              >
                <Check size={18} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed">{text}</p>
            <div className="mt-1 flex items-center justify-end gap-1">
              {editedAt && (
                <span className="text-xs opacity-75">(تم التعديل)</span>
              )}
              {isEditable && messageId && onEdit && (
                <button
                  onClick={() => setEditing(true)}
                  className="p-1 rounded hover:bg-white/20 transition opacity-80"
                  aria-label="تعديل"
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
