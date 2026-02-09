'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function LocationPage() {
  const router = useRouter()

  const handleEnableLocation = () => {
    // Request geolocation permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          router.push('/onboarding/signup')
        },
        () => {
          router.push('/onboarding/signup')
        }
      )
    } else {
      router.push('/onboarding/signup')
    }
  }

  return (
    <div className="h-dvh overflow-hidden bg-neutral-950 flex flex-col items-center justify-between p-6">
      {/* Illustration */}
      <div className="flex-1 flex items-center justify-center">
        <svg viewBox="0 0 400 400" className="w-72 h-72">
          {/* Map tiles background with blue accent */}
          <rect x="50" y="80" width="120" height="140" fill="#0066FF" opacity="0.9" transform="rotate(-15 110 150)" />
          <rect x="140" y="60" width="120" height="140" fill="#0066FF" opacity="0.9" transform="rotate(-8 200 130)" />
          <rect x="200" y="100" width="120" height="140" fill="#0066FF" opacity="0.9" transform="rotate(5 260 170)" />
          
          {/* Grid lines */}
          <line x1="60" y1="100" x2="160" y2="100" stroke="#1a1a1a" strokeWidth="2" transform="rotate(-15 110 150)" />
          <line x1="60" y1="140" x2="160" y2="140" stroke="#1a1a1a" strokeWidth="2" transform="rotate(-15 110 150)" />
          <line x1="60" y1="180" x2="160" y2="180" stroke="#1a1a1a" strokeWidth="2" transform="rotate(-15 110 150)" />
          
          <line x1="150" y1="80" x2="250" y2="80" stroke="#1a1a1a" strokeWidth="2" transform="rotate(-8 200 130)" />
          <line x1="150" y1="120" x2="250" y2="120" stroke="#1a1a1a" strokeWidth="2" transform="rotate(-8 200 130)" />
          <line x1="150" y1="160" x2="250" y2="160" stroke="#1a1a1a" strokeWidth="2" transform="rotate(-8 200 130)" />
          
          {/* Person with phone */}
          <g transform="translate(180, 180)">
            {/* Body */}
            <ellipse cx="0" cy="50" rx="30" ry="45" fill="#ffffff" />
            <rect x="-35" y="30" width="15" height="50" fill="#ffffff" rx="8" transform="rotate(-20 -27 55)" />
            
            {/* Head */}
            <circle cx="0" cy="0" r="25" fill="#ffffff" />
            <path d="M -15,-5 Q -15,-15 -5,-18 Q 0,-20 5,-18 Q 15,-15 15,-5" fill="#1a1a1a" />
            
            {/* Phone */}
            <rect x="15" y="20" width="20" height="32" fill="#ffffff" rx="3" stroke="#1a1a1a" strokeWidth="2" />
            <rect x="18" y="23" width="14" height="22" fill="#0066FF" rx="1" />
            
            {/* Arm holding phone */}
            <rect x="5" y="25" width="15" height="50" fill="#ffffff" rx="8" transform="rotate(35 12 50)" />
          </g>
          
          {/* Car icons */}
          <g transform="translate(90, 120)">
            <circle cx="0" cy="0" r="18" fill="#262626" />
            <circle cx="0" cy="0" r="14" fill="#0066FF" />
            <path d="M -6,-3 L -8,0 L -6,3 L 0,3 L 0,6 L 6,6 L 6,-6 L 0,-6 L 0,-3 Z" fill="#ffffff" />
          </g>
          
          <g transform="translate(280, 160)">
            <circle cx="0" cy="0" r="18" fill="#262626" />
            <circle cx="0" cy="0" r="14" fill="#0066FF" />
            <path d="M -6,-3 L -8,0 L -6,3 L 0,3 L 0,6 L 6,6 L 6,-6 L 0,-6 L 0,-3 Z" fill="#ffffff" />
          </g>
          
          {/* Location pin */}
          <g transform="translate(200, 100)">
            <path d="M 0,-30 C -12,-30 -22,-20 -22,-8 C -22,10 0,35 0,35 C 0,35 22,10 22,-8 C 22,-20 12,-30 0,-30 Z" fill="#0066FF" />
            <circle cx="0" cy="-8" r="8" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* Content */}
      <div className="w-full max-w-md space-y-6 mb-8">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-white text-balance">
            Permitir que o aplicativo acesse sua localização
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Precisamos da sua localização para encontrar motoristas próximos, localizar pontos de embarque e destino, estimar o tempo de viagem e mantê-lo seguro
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleEnableLocation}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-base font-semibold rounded-xl"
          >
            Ativar localização
          </Button>
          
          <Button 
            onClick={() => router.push('/onboarding/signup')}
            variant="ghost" 
            className="w-full text-gray-400 hover:text-white hover:bg-neutral-800 h-14 text-base rounded-xl"
          >
            Escolha a localização manualmente
          </Button>
        </div>
      </div>
    </div>
  )
}
