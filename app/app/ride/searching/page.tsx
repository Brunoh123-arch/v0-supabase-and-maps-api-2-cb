'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Car } from 'lucide-react'
import { RouteMap } from '@/components/route-map'

interface RouteData {
  pickup: string
  pickupCoords: { lat: number; lng: number } | null
  destination: string
  destinationCoords: { lat: number; lng: number } | null
}

export default function SearchingDriverPage() {
  const router = useRouter()
  const [route, setRoute] = useState<RouteData>({
    pickup: '',
    pickupCoords: null,
    destination: '',
    destinationCoords: null,
  })

  useEffect(() => {
    const saved = sessionStorage.getItem('rideRoute')
    if (saved) setRoute(JSON.parse(saved))
  }, [])

  return (
    <div className="h-dvh overflow-hidden bg-neutral-50 flex flex-col relative">
      {/* Map section - full screen behind */}
      <div className="absolute inset-0 bg-neutral-200">
        {route.pickupCoords && route.destinationCoords ? (
          <RouteMap
            origin={route.pickupCoords}
            destination={route.destinationCoords}
            originLabel={route.pickup}
            destinationLabel={route.destination}
            showInfoWindows
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-200">
            <div className="w-8 h-8 border-[2.5px] border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Bottom sheet - iOS frosted glass */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/98 ios-blur rounded-t-[32px] flex flex-col items-center px-6 pt-7 pb-safe-offset-4 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
        {/* Handle */}
        <div className="w-9 h-[5px] bg-neutral-300/70 rounded-full mb-6" />

        {/* Car icon - iOS style */}
        <div className="w-16 h-16 bg-blue-50 rounded-[22px] flex items-center justify-center mb-5">
          <Car className="w-8 h-8 text-blue-500" strokeWidth={2} />
        </div>

        <h2 className="text-[24px] font-bold text-neutral-900 tracking-tight mb-1.5">Viagem solicitada</h2>
        <p className="text-[17px] text-neutral-500 mb-6">Procurando motorista...</p>

        {/* Searching animation - iOS style */}
        <div className="flex items-center justify-center gap-6 mb-8 w-full">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* Cancel button - iOS destructive style */}
        <button
          type="button"
          onClick={() => router.push('/app/home')}
          className="w-full h-[52px] rounded-[16px] bg-neutral-100 text-red-500 font-semibold text-[17px] ios-press"
        >
          Cancelar viagem
        </button>
      </div>
    </div>
  )
}
