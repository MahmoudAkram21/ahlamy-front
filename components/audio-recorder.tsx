"use client"

import { useState, useRef } from "react"
import { Mic, Square } from "lucide-react"

interface AudioRecorderProps {
    dreamId: string
    onUploadSuccess: (audioUrl: string) => void
}

export function AudioRecorder({ dreamId, onUploadSuccess }: AudioRecorderProps) {
    const [recording, setRecording] = useState(false)
    const [uploading, setUploading] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const startTimeRef = useRef<number>(0)

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)

            chunksRef.current = []
            startTimeRef.current = Date.now()

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            recorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
                await uploadAudio(blob, duration)

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop())
            }

            recorder.start()
            mediaRecorderRef.current = recorder
            setRecording(true)
        } catch (error) {
            console.error('Recording error:', error)
            alert('تعذر الوصول إلى الميكروفون. الرجاء السماح بالوصول للميكروفون.')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop()
            setRecording(false)
        }
    }

    const uploadAudio = async (blob: Blob, duration: number) => {
        try {
            setUploading(true)

            const reader = new FileReader()
            reader.readAsDataURL(blob)

            reader.onload = async () => {
                const base64 = reader.result as string

                const response = await fetch(`http://localhost:5000/api/dreams/${dreamId}/audio`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        audio: base64,
                        duration: duration,
                    }),
                })

                if (response.ok) {
                    const { audioUrl } = await response.json()
                    onUploadSuccess(audioUrl)
                } else {
                    alert('فشل تحميل التسجيل الصوتي')
                }
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('حدث خطأ أثناء تحميل التسجيل')
        } finally {
            setUploading(false)
        }
    }

    if (uploading) {
        return (
            <div className="flex items-center gap-2 rounded-2xl bg-sky-50 px-4 py-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
                <span className="text-sm text-sky-700">جاري رفع التسجيل...</span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            {!recording ? (
                <button
                    onClick={startRecording}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-4 py-2 text-white shadow-lg transition hover:shadow-xl"
                >
                    <Mic size={20} />
                    <span className="text-sm font-semibold">تسجيل صوتي</span>
                </button>
            ) : (
                <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 animate-pulse rounded-full bg-gradient-to-r from-gray-600 to-gray-700 px-4 py-2 text-white shadow-lg"
                >
                    <Square size={20} />
                    <span className="text-sm font-semibold">إيقاف التسجيل</span>
                </button>
            )}
        </div>
    )
}
