'use client'

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'

declare global {
  interface Window {
    initGoogleMap?: () => void
    google: any
  }
}

export interface GoogleMapHandle {
  centerOnUser: () => void
}

interface GoogleMapProps {
  onLocationFound?: (lat: number, lng: number) => void
  className?: string
}

const DEFAULT_CENTER = { lat: -1.293, lng: -47.926 }
const DEFAULT_ZOOM = 16

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve()
      return
    }

    const existingScript = document.getElementById('google-maps-script')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      return
    }

    window.initGoogleMap = () => {
      resolve()
    }

    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMap&libraries=places`
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
}

export const GoogleMap = forwardRef<GoogleMapHandle, GoogleMapProps>(
  function GoogleMapInner({ onLocationFound, className }, ref) {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)
    const markerRef = useRef<any>(null)
    const circleRef = useRef<any>(null)
    const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'loading'>('loading')
    const [mapLoaded, setMapLoaded] = useState(false)
    const onLocationFoundRef = useRef(onLocationFound)

    useEffect(() => {
      onLocationFoundRef.current = onLocationFound
    }, [onLocationFound])

    const updateUserPosition = useCallback((lat: number, lng: number) => {
      const pos = { lat, lng }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo(pos)
        mapInstanceRef.current.setZoom(DEFAULT_ZOOM)
      }

      if (markerRef.current) {
        markerRef.current.setPosition(pos)
      }

      if (circleRef.current) {
        circleRef.current.setCenter(pos)
      }
    }, [])

    const centerOnUser = useCallback(() => {
      if (!navigator.geolocation) return

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          updateUserPosition(latitude, longitude)
          onLocationFoundRef.current?.(latitude, longitude)
          setPermissionState('granted')
        },
        () => {
          setPermissionState('denied')
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      )
    }, [updateUserPosition])

    useImperativeHandle(ref, () => ({
      centerOnUser,
    }), [centerOnUser])

    const initMap = useCallback(
      (center: { lat: number; lng: number }) => {
        if (!mapContainerRef.current || mapInstanceRef.current) return

        const map = new window.google.maps.Map(mapContainerRef.current, {
          center,
          zoom: DEFAULT_ZOOM,
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'transit',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        })

        mapInstanceRef.current = map

        const marker = new window.google.maps.Marker({
          position: center,
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#2563EB',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
          },
          title: 'Sua localização',
        })

        const circle = new window.google.maps.Circle({
          map,
          center,
          radius: 80,
          fillColor: '#2563EB',
          fillOpacity: 0.1,
          strokeColor: '#2563EB',
          strokeOpacity: 0.3,
          strokeWeight: 1,
        })

        markerRef.current = marker
        circleRef.current = circle
        setMapLoaded(true)
      },
      []
    )

    useEffect(() => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) return

      let cancelled = false

      async function init() {
        try {
          await loadGoogleMapsScript(apiKey as string)
          if (cancelled) return

          // Check geolocation permission
          if (navigator.permissions) {
            try {
              const result = await navigator.permissions.query({ name: 'geolocation' })
              if (cancelled) return
              setPermissionState(result.state as 'prompt' | 'granted' | 'denied')

              result.addEventListener('change', () => {
                setPermissionState(result.state as 'prompt' | 'granted' | 'denied')
              })
            } catch {
              setPermissionState('prompt')
            }
          } else {
            setPermissionState('prompt')
          }

          // Request user location
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                if (cancelled) return
                const { latitude, longitude } = position.coords
                initMap({ lat: latitude, lng: longitude })
                onLocationFoundRef.current?.(latitude, longitude)
                setPermissionState('granted')
              },
              () => {
                if (cancelled) return
                initMap(DEFAULT_CENTER)
                setPermissionState('denied')
              },
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            )
          } else {
            initMap(DEFAULT_CENTER)
          }
        } catch {
          if (!cancelled) {
            initMap(DEFAULT_CENTER)
          }
        }
      }

      init()

      return () => {
        cancelled = true
      }
    }, [initMap])

    return (
      <div className={`relative w-full h-full ${className ?? ''}`}>
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Loading overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-neutral-500">Carregando mapa...</span>
            </div>
          </div>
        )}

        {/* Permission denied banner */}
        {permissionState === 'denied' && mapLoaded && (
          <div className="absolute top-4 left-4 right-16 z-10 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 shadow-md">
            <p className="text-xs text-amber-800 leading-snug">
              Permita o acesso a sua localização nas configurações do navegador para uma melhor experiência.
            </p>
          </div>
        )}
      </div>
    )
  }
)
