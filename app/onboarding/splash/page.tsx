'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/onboarding/signup')
    }, 2500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="h-dvh bg-neutral-900 flex flex-col items-center justify-center px-8 overflow-hidden">
      {/* Fair Deal Logo */}
      <div className="mb-12">
        <svg viewBox="0 0 300 120" className="w-64 h-auto">
          <defs>
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
              .fair-deal-text {
                font-family: 'Permanent Marker', cursive;
                font-size: 52px;
                fill: #0066FF;
                font-weight: 400;
              }
            `}</style>
          </defs>
          <text x="10" y="50" className="fair-deal-text" transform="rotate(-5 150 50)">
            FAIR
          </text>
          <text x="10" y="100" className="fair-deal-text" transform="rotate(-5 150 100)">
            DEAL
          </text>
        </svg>
      </div>

      {/* Loading spinner */}
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />

      {/* Logo Uppi */}
      <div className="absolute bottom-20 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-white">Uppi</span>
        </div>
      </div>
    </div>
  )
}
