'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Navigation, Loader2, X } from 'lucide-react'

interface Prediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

export default function RouteInputPage() {
  const router = useRouter()
  const [currentAddress, setCurrentAddress] = useState('Buscando sua localização...')
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [loadingLocation, setLoadingLocation] = useState(true)
  const [destination, setDestination] = useState('')
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loadingPredictions, setLoadingPredictions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Get current location on mount
  useEffect(() => {
    // First check sessionStorage for cached location
    const cached = sessionStorage.getItem('userLocation')
    if (cached) {
      const coords = JSON.parse(cached)
      setCurrentCoords(coords)
      reverseGeocode(coords.lat, coords.lng)
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setCurrentCoords({ lat: latitude, lng: longitude })
          sessionStorage.setItem('userLocation', JSON.stringify({ lat: latitude, lng: longitude }))
          reverseGeocode(latitude, longitude)
        },
        () => {
          if (!cached) {
            setCurrentAddress('Localização não disponível')
            setLoadingLocation(false)
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else if (!cached) {
      setCurrentAddress('Localização não disponível')
      setLoadingLocation(false)
    }
  }, [])

  // Auto focus destination input
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      })
      const data = await response.json()
      if (data.address) {
        setCurrentAddress(data.address)
      } else {
        setCurrentAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      }
    } catch {
      setCurrentAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    } finally {
      setLoadingLocation(false)
    }
  }

  const searchPlaces = useCallback(async (query: string) => {
    if (query.length < 3) {
      setPredictions([])
      return
    }

    setLoadingPredictions(true)
    try {
      const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`)
      const data = await response.json()
      setPredictions(data.predictions || [])
    } catch {
      setPredictions([])
    } finally {
      setLoadingPredictions(false)
    }
  }, [])

  const handleDestinationChange = (value: string) => {
    setDestination(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      searchPlaces(value)
    }, 400)
  }

  const handleSelectPlace = async (prediction: Prediction) => {
    setDestination(prediction.description)
    setPredictions([])

    try {
      const response = await fetch(`/api/places/details?place_id=${prediction.place_id}`)
      const data = await response.json()

      const route = {
        pickup: currentAddress,
        pickupCoords: currentCoords,
        destination: prediction.description,
        destinationCoords: data.result
          ? {
              lat: data.result.geometry.location.lat,
              lng: data.result.geometry.location.lng,
            }
          : null,
      }

      sessionStorage.setItem('rideRoute', JSON.stringify(route))
      router.push('/app/ride/select')
    } catch {
      const route = {
        pickup: currentAddress,
        pickupCoords: currentCoords,
        destination: prediction.description,
        destinationCoords: null,
      }
      sessionStorage.setItem('rideRoute', JSON.stringify(route))
      router.push('/app/ride/select')
    }
  }

  return (
    <div className="h-dvh bg-white flex flex-col overflow-hidden">
      {/* Header - iOS style */}
      <div className="flex items-center gap-2 px-4 pt-safe-offset-4 pb-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full ios-press"
        >
          <ArrowLeft className="w-[22px] h-[22px] text-neutral-800" strokeWidth={2.5} />
        </button>
        <h1 className="text-[20px] font-bold text-neutral-900 tracking-tight">{'Para onde?'}</h1>
      </div>

      {/* Inputs section - iOS style */}
      <div className="px-4 pb-3 overflow-hidden">
        <div className="flex gap-3 overflow-hidden">
          {/* Route line indicators */}
          <div className="flex flex-col items-center pt-4 flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <div className="w-[2px] flex-1 bg-blue-200 my-1" />
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          </div>

          {/* Input fields */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {/* Current location (read-only) */}
            <div className="flex items-center gap-3 bg-neutral-50 rounded-[16px] px-4 py-3.5">
              <Navigation className="w-4 h-4 text-blue-500 flex-shrink-0" strokeWidth={2.5} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-blue-500 uppercase tracking-wide">{'Local atual'}</p>
                <p className="text-[15px] text-neutral-800 truncate mt-0.5">
                  {loadingLocation ? (
                    <span className="flex items-center gap-2 text-neutral-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {'Buscando...'}
                    </span>
                  ) : (
                    currentAddress
                  )}
                </p>
              </div>
            </div>

            {/* Destination input */}
            <div className="flex items-center gap-3 bg-neutral-50 border-2 border-blue-500 rounded-[16px] px-4 py-3.5">
              <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" strokeWidth={2.5} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-neutral-400 uppercase tracking-wide">{'Destino'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Para onde voce vai?"
                    value={destination}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    className="flex-1 bg-transparent text-[15px] text-neutral-800 outline-none placeholder:text-neutral-400"
                  />
                  {destination && (
                    <button
                      type="button"
                      onClick={() => {
                        setDestination('')
                        setPredictions([])
                        inputRef.current?.focus()
                      }}
                      className="flex-shrink-0 w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center ios-press"
                    >
                      <X className="w-3.5 h-3.5 text-neutral-600" strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-neutral-100 mx-4" />

      {/* Results - iOS list style */}
      <div className="flex-1 overflow-y-auto ios-scroll">
        {loadingPredictions && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        )}

        {!loadingPredictions && predictions.length > 0 && (
          <div className="px-4 py-1">
            {predictions.map((prediction, i) => (
              <button
                key={prediction.place_id}
                type="button"
                onClick={() => handleSelectPlace(prediction)}
                className={`w-full flex items-start gap-3.5 py-3.5 text-left ios-press px-1 ${i < predictions.length - 1 ? 'border-b border-neutral-100' : ''}`}
              >
                <div className="w-10 h-10 bg-neutral-100 rounded-[14px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-[18px] h-[18px] text-neutral-500" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-neutral-900 truncate">
                    {prediction.structured_formatting?.main_text || prediction.description}
                  </p>
                  <p className="text-[13px] text-neutral-500 truncate mt-0.5">
                    {prediction.structured_formatting?.secondary_text || ''}
                  </p>
                </div>
                <svg className="w-5 h-5 text-neutral-300 mt-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {!loadingPredictions && destination.length >= 3 && predictions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <MapPin className="w-12 h-12 text-neutral-200 mb-3" strokeWidth={1.5} />
            <p className="text-[17px] font-medium text-neutral-900 text-center">{'Nenhum resultado'}</p>
            <p className="text-[15px] text-neutral-500 text-center mt-1">{'Tente digitar outro endereco'}</p>
          </div>
        )}

        {!loadingPredictions && destination.length < 3 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <MapPin className="w-12 h-12 text-neutral-200 mb-3" strokeWidth={1.5} />
            <p className="text-[15px] text-neutral-400 text-center">{'Digite o endereco de destino'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
