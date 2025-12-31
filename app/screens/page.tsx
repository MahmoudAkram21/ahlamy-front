"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function SplashScreen() {
  const [fadeIn, setFadeIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setFadeIn(true), 100)

    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push("/")
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-b from-cyan-400 via-sky-400 to-amber-300">
      {/* Animated Stars Background */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-white opacity-60">
              <path
                d="M8 0l1.545 6.455L16 8l-6.455 1.545L8 16l-1.545-6.455L0 8l6.455-1.545L8 0z"
                fill="currentColor"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div
        className={`relative z-10 flex flex-col items-center transition-all duration-1000 ${fadeIn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
      >
        {/* Moon and Clouds Illustration */}
        <div className="relative mb-8">
          {/* Crescent Moon */}
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            className="absolute left-1/2 top-0 -translate-x-1/2 drop-shadow-2xl"
          >
            <path
              d="M60 10 C 40 10, 25 25, 25 45 C 25 65, 40 80, 60 80 C 50 80, 40 70, 40 55 C 40 40, 50 30, 60 30 C 70 30, 80 40, 80 55 C 80 65, 75 72, 68 76 C 75 70, 80 60, 80 50 C 80 30, 70 15, 60 10 Z"
              fill="white"
            />
          </svg>

          {/* Cloud with Face Silhouette */}
          <Image src="/ahlamy 1.png" alt="Cloud" width={280} height={160} />
        </div>


        {/* Tagline - Arabic */}
        <p
          className="text-center text-xl text-white/90 drop-shadow-lg"
          style={{ fontFamily: "Cairo, sans-serif" }}
        >
          منصتك الهادئة لتفسير الرؤى
        </p>

        {/* Loading Dots */}
        <div className="mt-8 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-3 w-3 animate-pulse rounded-full bg-white"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
