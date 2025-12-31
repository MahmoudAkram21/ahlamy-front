"use client"

import { useState, useRef } from "react"
import { Mic, Square, Send } from "lucide-react"

interface ChatVoiceRecorderProps {
    onSendAudio: (audioBase64: string) => void
    disabled?: boolean
}

export function ChatVoiceRecorder({ onSendAudio, disabled = false }: ChatVoiceRecorderProps) {
    const [recording, setRecording] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)

            chunksRef.current = []

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            recorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })

                const reader = new FileReader()
                reader.readAsDataURL(blob)
                reader.onload = () => {
                    if (reader.result) {
                        onSendAudio(reader.result as string)
                    }
                }

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop())
            }

            recorder.start()
            mediaRecorderRef.current = recorder
            setRecording(true)
        } catch (error) {
            console.error('Recording error:', error)
            alert('تعذر الوصول إلى الميكروفون')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop()
            setRecording(false)
        }
    }

    if (disabled) {
        return null
    }

    return (
        <div className="flex items-center">
            {!recording ? (
                <button
                    onClick={startRecording}
                    className="rounded-full p-2 text-sky-600 transition hover:bg-sky-50"
                    title="تسجيل رسالة صوتية"
                >
                    <Mic size={24} />
                </button>
            ) : (
                <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 animate-pulse rounded-full bg-red-500 px-3 py-2 text-white text-sm font-semibold"
                >
                    <Square size={16} />
                    إرسال
                </button>
            )}
        </div>
    )
}
