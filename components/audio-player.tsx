"use client"

import { Volume2 } from "lucide-react"

interface AudioPlayerProps {
    audioUrl: string
    className?: string
}

export function AudioPlayer({ audioUrl, className = "" }: AudioPlayerProps) {
    const fullUrl = audioUrl.startsWith('http')
        ? audioUrl
        : `http://localhost:5000${audioUrl}`

    return (
        <div className={`flex items-center gap-3 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-purple-50 p-4 ${className}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                <Volume2 size={20} className="text-sky-600" />
            </div>

            <audio
                controls
                className="flex-1"
                style={{
                    height: '40px',
                    filter: 'hue-rotate(180deg)',
                }}
            >
                <source src={fullUrl} type="audio/webm" />
                <source src={fullUrl} type="audio/mpeg" />
                <source src={fullUrl} type="audio/mp4" />
                متصفحك لا يدعم تشغيل الملفات الصوتية
            </audio>
        </div>
    )
}
