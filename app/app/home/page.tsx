'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types/database'
import { SidebarMenu } from '@/components/sidebar-menu'
import { GoogleMap } from '@/components/google-map'
import type { GoogleMapHandle } from '@/components/google-map'

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const mapRef = useRef<GoogleMapHandle>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLocationFound = useCallback((lat: number, lng: number) => {
    sessionStorage.setItem('userLocation', JSON.stringify({ lat, lng }))
  }, [])

  const handleCenterOnUser = useCallback(() => {
    mapRef.current?.centerOnUser()
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
          if (data) {
            setProfile(data)
            setLoading(false)
            return
          }
        }
      } catch {
        // usar dados locais
      }

      // Tentar sessionStorage primeiro, depois localStorage
      const localProfile = sessionStorage.getItem('userProfile') || localStorage.getItem('uppi_profile')
      if (localProfile) {
        const data = JSON.parse(localProfile)
        setProfile({
          id: 'local',
          full_name: data.name,
          phone: data.phone || '',
          user_type: data.user_type || 'passenger',
          avatar_url: '/images/default-avatar.jpg',
          rating: 5.0,
          total_rides: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
      setLoading(false)
    }
    loadProfile()
  }, [supabase])

  if (loading) {
    return (
      <div className="h-dvh bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-[2.5px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-dvh flex flex-col relative overflow-hidden">
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} profile={profile} />

      {/* Map Area - fullscreen */}
      <div className="flex-1 relative">
        <GoogleMap
          ref={mapRef}
          onLocationFound={handleLocationFound}
          className="w-full h-full"
        />

        {/* Menu button - iOS style */}
        <button
          type="button"
          className="absolute top-safe-offset-4 left-4 z-10 w-11 h-11 bg-white/95 ios-blur rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.1)] ios-press"
          onClick={() => setSidebarOpen(true)}
        >
          <svg className="w-[22px] h-[22px] text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* GPS / center on user - iOS style */}
        <button
          type="button"
          className="absolute bottom-6 right-4 z-10 w-11 h-11 bg-white/95 ios-blur rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.1)] ios-press"
          onClick={handleCenterOnUser}
        >
          <svg className="w-[20px] h-[20px] text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
          </svg>
        </button>
      </div>

      {/* Bottom Sheet - iOS frosted glass */}
      <div className="bg-white/98 ios-blur rounded-t-[28px] -mt-6 relative z-20 shadow-[0_-8px_32px_rgba(0,0,0,0.1)]">
        {/* Handle */}
        <div className="flex justify-center pt-2.5 pb-1.5">
          <div className="w-9 h-[5px] bg-neutral-300/70 rounded-full" />
        </div>

        {/* Title */}
        <div className="px-5 pb-3 pt-1">
          <h2 className="text-[28px] font-bold text-neutral-900 tracking-tight">{'Onde voce esta indo?'}</h2>
        </div>

        {/* Search Input - iOS style */}
        <div className="px-5 pb-5">
          <button
            type="button"
            className="w-full flex items-center gap-3.5 bg-neutral-100/80 rounded-2xl px-4 py-3.5 ios-press"
            onClick={() => router.push('/app/ride/route-input')}
          >
            {/* Taxi icon */}
            <div className="w-10 h-8 flex-shrink-0">
              <svg viewBox="0 0 40 32" className="w-10 h-8" fill="none">
                <rect x="4" y="14" width="32" height="12" rx="3" fill="#F5C518" />
                <rect x="8" y="8" width="24" height="8" rx="2" fill="#F5C518" />
                <rect x="10" y="16" width="8" height="6" rx="1" fill="#B8E8F5" />
                <rect x="22" y="16" width="8" height="6" rx="1" fill="#B8E8F5" />
                <circle cx="12" cy="28" r="3" fill="#333" />
                <circle cx="28" cy="28" r="3" fill="#333" />
              </svg>
            </div>
            <span className="flex-1 text-neutral-400 text-[17px] text-left font-medium">{'Onde voce esta indo?'}</span>
            {/* Arrow button */}
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </button>
        </div>

        <div className="pb-safe-offset-4" />
      </div>
    </div>
  )
}
