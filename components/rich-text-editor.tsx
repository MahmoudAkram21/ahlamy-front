"use client"

import { useRef, useEffect, useCallback } from "react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "اكتب المحتوى هنا...",
  className = "",
  minHeight = "280px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternalChange = useRef(false)

  // Sync value from props into the editor (e.g. initial load or external reset)
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (isInternalChange.current) {
      isInternalChange.current = false
      return
    }
    const next = value || ""
    if (el.innerHTML !== next) {
      el.innerHTML = next
    }
  }, [value])


  const handleInput = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    isInternalChange.current = true
    onChange(el.innerHTML)
  }, [onChange])

  const exec = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value)
    editorRef.current?.focus()
    handleInput()
  }, [handleInput])

  const addLink = useCallback(() => {
    const url = window.prompt("أدخل الرابط (URL):", "https://")
    if (url) exec("createLink", url)
  }, [exec])

  return (
    <div className={`rich-text-editor-wrap ${className}`} dir="rtl">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-t-2xl border border-sky-100 border-b-0 bg-slate-50 p-2">
        <button
          type="button"
          onClick={() => exec("formatBlock", "h1")}
          className="rounded-lg px-2 py-1.5 text-sm font-bold text-slate-700 hover:bg-sky-100"
          title="عنوان 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => exec("formatBlock", "h2")}
          className="rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-sky-100"
          title="عنوان 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => exec("formatBlock", "h3")}
          className="rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-sky-100"
          title="عنوان 3"
        >
          H3
        </button>
        <span className="mx-1 h-4 w-px bg-slate-200" />
        <button
          type="button"
          onClick={() => exec("bold")}
          className="rounded-lg px-2 py-1.5 text-sm font-bold text-slate-700 hover:bg-sky-100"
          title="عريض"
        >
          ب
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          className="rounded-lg px-2 py-1.5 text-sm italic text-slate-700 hover:bg-sky-100"
          title="مائل"
        >
          م
        </button>
        <button
          type="button"
          onClick={() => exec("underline")}
          className="rounded-lg px-2 py-1.5 text-sm underline text-slate-700 hover:bg-sky-100"
          title="تحته خط"
        >
          ت
        </button>
        <span className="mx-1 h-4 w-px bg-slate-200" />
        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          className="rounded-lg px-2 py-1.5 text-slate-600 hover:bg-sky-100"
          title="قائمة نقطية"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => exec("insertOrderedList")}
          className="rounded-lg px-2 py-1.5 text-slate-600 hover:bg-sky-100"
          title="قائمة مرقمة"
        >
          1.
        </button>
        <button
          type="button"
          onClick={addLink}
          className="rounded-lg px-2 py-1.5 text-sm text-sky-600 hover:bg-sky-100"
          title="رابط"
        >
          رابط
        </button>
      </div>

      {/* Editable area - content styled like the preview (heading + paragraph) */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        onPaste={(e) => {
          e.preventDefault()
          const text = e.clipboardData.getData("text/html") || e.clipboardData.getData("text/plain")
          document.execCommand("insertHTML", false, text)
          handleInput()
        }}
        className="rich-text-editor-content min-h-[280px] rounded-b-2xl border border-sky-100 bg-white px-4 py-3 text-right text-slate-800 outline-none focus:ring-2 focus:ring-sky-200 [&:empty::before]:content-[attr(data-placeholder)] [&:empty::before]:text-slate-400 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:text-sm [&_p]:text-slate-600 [&_p]:leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:mr-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:mr-6 [&_ol]:my-2 [&_li]:text-sm [&_li]:text-slate-600 [&_a]:text-sky-600 [&_a]:underline [&_a]:font-semibold"
        style={{ minHeight }}
      />
    </div>
  )
}
