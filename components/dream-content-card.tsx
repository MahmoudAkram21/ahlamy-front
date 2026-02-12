"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"

interface DreamContentCardProps {
  content: string
  dreamerName: string
  submittedAt: string
  canEdit?: boolean
  onSave?: (newContent: string) => Promise<void>
}

export function DreamContentCard({
  content,
  dreamerName,
  submittedAt,
  canEdit,
  onSave,
}: DreamContentCardProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(content)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!onSave || editValue.trim() === content) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      await onSave(editValue.trim())
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(content)
    setEditing(false)
  }

  return (
    <section className="px-4 pt-4">
      <div className="rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-md backdrop-blur">
        <div className="mb-4 flex items-start justify-between gap-2 rounded-2xl bg-sky-50/70 p-4">
          <div>
            <p className="text-xs text-sky-600">الرائي</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{dreamerName}</p>
            <p className="mt-1 text-xs text-slate-500">{submittedAt}</p>
          </div>
          {canEdit && onSave && !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-full p-2 text-sky-600 hover:bg-sky-100 transition"
              aria-label="تعديل محتوى الرؤية"
            >
              <Pencil size={18} />
            </button>
          )}
        </div>
        <h2 className="text-sm font-bold text-slate-800">محتوى الرؤية</h2>
        {editing ? (
          <div className="mt-3 space-y-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full min-h-[120px] rounded-xl border border-sky-200 bg-white px-4 py-3 text-slate-700 leading-7 outline-none focus:ring-2 focus:ring-sky-300"
              dir="rtl"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !editValue.trim()}
                className="rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 transition disabled:opacity-50"
              >
                {saving ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-3 leading-7 text-slate-700">{content}</p>
        )}
      </div>
    </section>
  )
}
