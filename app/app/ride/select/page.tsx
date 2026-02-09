'use client'

import React from "react"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ChevronRight,
  User,
  CreditCard,
  Tag,
  SlidersHorizontal,
  Calendar,
  X,
  Clock,
  Briefcase,
  PawPrint,
  ChevronDown,
  Loader2,
  Car,
  MapPin,
} from 'lucide-react'
import { RouteMap } from '@/components/route-map'

const PRICE_PER_KM: Record<VehicleType, number> = {
  moto: 1.8,
  economy: 2.5,
  plus: 4.0,
}

const BASE_FARE: Record<VehicleType, number> = {
  moto: 3.0,
  economy: 5.0,
  plus: 8.0,
}

type VehicleType = 'moto' | 'economy' | 'plus'

interface RouteData {
  pickup: string
  pickupCoords: { lat: number; lng: number } | null
  destination: string
  destinationCoords: { lat: number; lng: number } | null
}

function calculatePrice(type: VehicleType, distanceKm: number): number {
  const base = BASE_FARE[type]
  const perKm = PRICE_PER_KM[type]
  return Math.round((base + perKm * distanceKm) * 100) / 100
}

export default function RideSelectPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<VehicleType>('moto')
  const [showPayment, setShowPayment] = useState(false)
  const [showCoupon, setShowCoupon] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [waitTime] = useState('Sem tempo de espera')
  const [hasLuggage, setHasLuggage] = useState(false)
  const [hasPet, setHasPet] = useState(false)
  const [route, setRoute] = useState<RouteData>({
    pickup: '',
    pickupCoords: null,
    destination: '',
    destinationCoords: null,
  })
  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const [durationText, setDurationText] = useState<string | null>(null)
  const [loadingDistance, setLoadingDistance] = useState(true)

  // Map expand state
  const [mapExpanded, setMapExpanded] = useState(false)
  const recenterMapRef = useRef<(() => void) | null>(null)

  // Bottom sheet drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragCurrentY, setDragCurrentY] = useState(0)
  const dragOffset = isDragging ? dragCurrentY - dragStartY : 0

  useEffect(() => {
    const saved = sessionStorage.getItem('rideRoute')
    if (saved) {
      const parsed = JSON.parse(saved) as RouteData
      setRoute(parsed)

      if (parsed.pickupCoords && parsed.destinationCoords) {
        fetchDistance(parsed.pickupCoords, parsed.destinationCoords)
      } else {
        setLoadingDistance(false)
        setDistanceKm(5)
      }
    } else {
      setLoadingDistance(false)
      setDistanceKm(5)
    }
  }, [])

  const fetchDistance = async (
    origin: { lat: number; lng: number },
    dest: { lat: number; lng: number }
  ) => {
    try {
      const res = await fetch('/api/distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originLat: origin.lat,
          originLng: origin.lng,
          destLat: dest.lat,
          destLng: dest.lng,
        }),
      })
      const data = await res.json()

      if (data.distance) {
        const km = data.distance.value / 1000
        setDistanceKm(km)
        setDurationText(data.duration?.text || null)
      } else {
        const km = haversineDistance(origin, dest)
        setDistanceKm(km)
      }
    } catch {
      const km = haversineDistance(origin, dest)
      setDistanceKm(km)
    } finally {
      setLoadingDistance(false)
    }
  }

  const haversineDistance = (
    a: { lat: number; lng: number },
    b: { lat: number; lng: number }
  ): number => {
    const R = 6371
    const dLat = ((b.lat - a.lat) * Math.PI) / 180
    const dLng = ((b.lng - a.lng) * Math.PI) / 180
    const sinLat = Math.sin(dLat / 2)
    const sinLng = Math.sin(dLng / 2)
    const h =
      sinLat * sinLat +
      Math.cos((a.lat * Math.PI) / 180) *
        Math.cos((b.lat * Math.PI) / 180) *
        sinLng *
        sinLng
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  }

  const rideOptions = [
    {
      id: 'moto' as VehicleType,
      name: 'Moto',
      passengers: 1,
      description: 'Rapido e economico',
      vehicleType: 'moto' as const,
    },
    {
      id: 'economy' as VehicleType,
      name: 'Economico',
      passengers: 3,
      description: 'Opcao mais economica',
      vehicleType: 'car' as const,
    },
    {
      id: 'plus' as VehicleType,
      name: 'Conforto',
      passengers: 4,
      description: 'Mais espaco e conforto',
      vehicleType: 'car' as const,
    },
  ]

  const getPrice = (type: VehicleType) => {
    if (distanceKm === null) return 0
    return calculatePrice(type, distanceKm)
  }

  const selectedRide = rideOptions.find((r) => r.id === selected)
  const selectedPrice = getPrice(selected)

  // Handle drag gestures
  const handleDragStart = (clientY: number) => {
    setIsDragging(true)
    setDragStartY(clientY)
    setDragCurrentY(clientY)
  }

  const handleDragMove = (clientY: number) => {
    if (isDragging) {
      setDragCurrentY(clientY)
    }
  }

  const handleDragEnd = () => {
    if (isDragging) {
      // If dragged down more than 100px, expand the map
      if (dragOffset > 100) {
        setMapExpanded(true)
      }
      // If dragged up more than 100px, collapse the map
      else if (dragOffset < -100 && mapExpanded) {
        setMapExpanded(false)
      }
      setIsDragging(false)
      setDragStartY(0)
      setDragCurrentY(0)
    }
  }

  return (
    <div className="h-dvh bg-neutral-50 flex flex-col overflow-hidden">
      {/* Header - Mapa pequeno com overlay de info */}
      <div className={`relative flex-shrink-0 transition-all duration-500 ease-out ${mapExpanded ? 'h-[55dvh]' : 'h-[28dvh]'}`}>
        {/* Mapa compacto */}
        <div className="absolute inset-0 bg-neutral-200">
          {route.pickupCoords && route.destinationCoords ? (
            <RouteMap
              origin={route.pickupCoords}
              destination={route.destinationCoords}
              originLabel={route.pickup}
              destinationLabel={route.destination}
              showInfoWindows={mapExpanded}
              onRecenterReady={(fn) => {
                recenterMapRef.current = fn
              }}
              bottomPadding={20}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-200">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}
        </div>

        {/* Top bar - back + route info */}
        <div className="absolute top-0 left-0 right-0 z-10 pt-safe-offset-2 px-3 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-9 h-9 bg-white/95 backdrop-blur-xl rounded-full shadow-[0_1px_6px_rgba(0,0,0,0.1)] flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-4.5 h-4.5 text-neutral-800" strokeWidth={2.5} />
            </button>

            <div className="flex-1 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_1px_6px_rgba(0,0,0,0.1)] px-3 py-2 flex items-center gap-2 min-w-0">
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {distanceKm !== null && (
                    <span className="text-[12px] font-bold text-blue-600">
                      {distanceKm.toFixed(1)} km
                    </span>
                  )}
                  {durationText && (
                    <>
                      <span className="text-neutral-300 text-[10px]">{'|'}</span>
                      <span className="text-[12px] font-medium text-neutral-500">
                        {durationText}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[12px] text-neutral-500 truncate">
                  {route.destination || 'Destino'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('rideRoute')
                  router.push('/app/ride/route-input')
                }}
                className="w-7 h-7 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
              >
                <X className="w-3.5 h-3.5 text-neutral-500" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Botao expandir/colapsar mapa */}
        <button
          type="button"
          onClick={() => setMapExpanded(!mapExpanded)}
          className="absolute bottom-3 right-3 z-10 w-9 h-9 bg-white/95 backdrop-blur-xl rounded-full shadow-[0_1px_6px_rgba(0,0,0,0.1)] flex items-center justify-center active:scale-95 transition-transform"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-neutral-700 transition-transform duration-300 ${mapExpanded ? 'rotate-180' : ''}`}
          >
            {mapExpanded ? (
              <>
                <polyline points="4 14 10 14 10 20" />
                <polyline points="20 10 14 10 14 4" />
                <line x1="14" y1="10" x2="21" y2="3" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </>
            ) : (
              <>
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Conteudo principal - cards de veiculo com scroll infinito */}
      <div 
        className="flex-1 flex flex-col min-h-0 bg-white rounded-t-[24px] -mt-4 relative z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-transform"
        style={{
          transform: isDragging ? `translateY(${Math.max(0, dragOffset)}px)` : 'none',
        }}
      >
        {/* Handle decorativo - DRAGGABLE */}
        <div 
          className="flex justify-center pt-2.5 pb-1 cursor-grab active:cursor-grabbing"
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
          onTouchEnd={handleDragEnd}
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onMouseMove={(e) => handleDragMove(e.clientY)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <div className={`w-9 h-1 rounded-full transition-colors ${isDragging ? 'bg-neutral-400' : 'bg-neutral-200'}`} />
        </div>

        {/* Titulo da secao */}
        <div className="px-5 pb-2 pt-1">
          <h2 className="text-[15px] font-semibold text-neutral-900 tracking-tight">
            Escolha seu veiculo
          </h2>
          {durationText && (
            <p className="text-[13px] text-neutral-400 mt-0.5">
              Chegada estimada em {durationText}
            </p>
          )}
        </div>

        {/* Lista de veiculos - scroll infinito */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-2 overscroll-contain">
          {loadingDistance ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2.5" />
              <p className="text-[14px] font-medium text-neutral-500">Calculando valores...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {rideOptions.map((option) => {
                const price = getPrice(option.id)
                const isSelected = selected === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelected(option.id)}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all duration-200 text-left active:scale-[0.98] ${
                      isSelected
                        ? 'bg-blue-50/80 ring-2 ring-blue-500 shadow-[0_2px_12px_rgba(59,130,246,0.12)]'
                        : 'bg-neutral-50/60 ring-1 ring-neutral-100'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-white shadow-sm' : 'bg-white'
                    }`}>
                      {option.vehicleType === 'moto' ? (
                        <svg className="w-5.5 h-5.5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="4" cy="17" r="2.5" />
                          <circle cx="20" cy="17" r="2.5" />
                          <path d="M13 6l3 4h4" />
                          <path d="M6.5 17l3.5-6h4l2.5 3.5" />
                          <path d="M13 6h2" />
                        </svg>
                      ) : (
                        <Car
                          strokeWidth={2.5}
                          className={`w-5.5 h-5.5 ${
                            option.id === 'economy'
                              ? 'text-blue-500'
                              : 'text-emerald-500'
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[15px] text-neutral-900 tracking-tight">
                          {option.name}
                        </span>
                        <div className="flex items-center gap-0.5 text-neutral-400">
                          <User className="w-3 h-3" strokeWidth={2.5} />
                          <span className="text-[12px] font-medium">
                            {option.passengers}
                          </span>
                        </div>
                      </div>
                      <p className="text-[13px] text-neutral-500 mt-0.5">
                        {option.description}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-[17px] font-bold tracking-tight ${isSelected ? 'text-blue-600' : 'text-neutral-800'}`}>
                        R${price.toFixed(2)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer fixo - pagamento + confirmar */}
        <div className="flex-shrink-0 px-4 pt-2 pb-safe-offset-3 bg-white border-t border-neutral-100/60">
          {/* Pagamento */}
          <button
            type="button"
            onClick={() => setShowPayment(true)}
            className="w-full flex items-center gap-3 px-3.5 py-3 border border-amber-200/80 rounded-2xl bg-amber-50/30 active:scale-[0.98] transition-transform"
          >
            <CreditCard className="w-4.5 h-4.5 text-amber-600" strokeWidth={2.5} />
            <span className="flex-1 text-left text-blue-600 font-semibold text-[14px]">
              {paymentMethod || 'Selecione o pagamento'}
            </span>
            <ChevronRight className="w-4.5 h-4.5 text-neutral-400" strokeWidth={2.5} />
          </button>

          {/* Preferencias e Cupom */}
          <div className="mt-2.5 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              className="flex items-center gap-1.5 active:opacity-60 transition-opacity"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
              <span className="text-blue-600 font-semibold text-[13px]">
                Preferencias
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowCoupon(true)}
              className="flex items-center gap-1.5 active:opacity-60 transition-opacity"
            >
              <Tag className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
              <span className="text-blue-600 font-semibold text-[13px]">Cupom</span>
            </button>
          </div>

          {/* Agendar / Confirmar */}
          <div className="mt-2.5 flex items-center gap-2.5">
            <button
              type="button"
              className="w-[48px] h-[48px] rounded-2xl border border-neutral-200 flex items-center justify-center flex-shrink-0 bg-neutral-50/50 active:scale-95 transition-transform"
            >
              <Calendar className="w-4.5 h-4.5 text-neutral-500" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              disabled={loadingDistance}
              onClick={() => {
                sessionStorage.setItem(
                  'selectedRide',
                  JSON.stringify({
                    ...selectedRide,
                    price: selectedPrice,
                    distanceKm,
                    durationText,
                  })
                )
                router.push('/app/ride/searching')
              }}
              className="flex-1 h-[48px] rounded-2xl bg-blue-600 text-white font-semibold text-[15px] tracking-tight transition-all disabled:opacity-50 active:scale-[0.98] active:bg-blue-700"
            >
              Confirmar viagem - R$ {selectedPrice.toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl px-6 pt-6 pb-8 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6">
              <button type="button" onClick={() => setShowPayment(false)}>
                <X className="w-6 h-6 text-neutral-500" />
              </button>
              <h2 className="text-xl font-bold text-neutral-900">Pagamento</h2>
              <div className="w-6" />
            </div>

            <div className="border-2 border-dashed border-blue-400 rounded-2xl p-5 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-neutral-600">Taxa base</span>
                <span className="font-medium text-neutral-900">
                  R$ {BASE_FARE[selected].toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-neutral-600">
                  Distancia ({distanceKm?.toFixed(1)} km x R${' '}
                  {PRICE_PER_KM[selected].toFixed(2)})
                </span>
                <span className="font-medium text-neutral-900">
                  R${' '}
                  {distanceKm
                    ? (PRICE_PER_KM[selected] * distanceKm).toFixed(2)
                    : '0.00'}
                </span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-neutral-600">Desconto de cupom</span>
                <span className="font-medium text-neutral-900">R$ 0.00</span>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl py-3 px-5 flex items-center justify-between">
                <span className="text-white font-semibold">Preco total</span>
                <span className="text-white font-bold text-2xl">
                  R$ {selectedPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <h3 className="font-semibold text-neutral-900 mb-3">
              Selecione o metodo de pagamento:
            </h3>
            <div className="flex flex-col divide-y divide-neutral-100">
              {['Pix', 'Dinheiro', 'Cartao'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(method)
                    setShowPayment(false)
                  }}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-left font-medium text-neutral-900">
                    {method}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      paymentMethod === method
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-neutral-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={!paymentMethod}
              onClick={() => setShowPayment(false)}
              className={`w-full mt-6 py-4 rounded-xl font-semibold text-base transition-colors ${
                paymentMethod
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-neutral-200 text-neutral-400'
              }`}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {/* COUPON MODAL */}
      {showCoupon && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl px-6 pt-8 pb-8 animate-in slide-in-from-bottom">
            <div className="flex flex-col items-center mb-6">
              <Tag className="w-8 h-8 text-blue-700 mb-3" />
              <h2 className="text-xl font-bold text-neutral-900">
                Insira o cupom
              </h2>
              <p className="text-neutral-500 text-sm text-center mt-2">
                Insira o codigo do seu cupom para ser aplicado nos precos
              </p>
            </div>

            <div className="flex items-center gap-3 border-2 border-neutral-200 rounded-xl px-4 py-3 mb-6 bg-neutral-50">
              <Tag className="w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Digite o codigo do cupom"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-transparent outline-none text-neutral-900 placeholder:text-neutral-400"
              />
            </div>

            <button
              type="button"
              disabled={!couponCode.trim()}
              onClick={() => setShowCoupon(false)}
              className={`w-full py-4 rounded-xl font-semibold text-base transition-colors ${
                couponCode.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-neutral-200 text-neutral-400'
              }`}
            >
              Aplicar
            </button>

            <button
              type="button"
              onClick={() => {
                setCouponCode('')
                setShowCoupon(false)
              }}
              className="w-full mt-3 text-center text-blue-600 font-medium py-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* PREFERENCES MODAL */}
      {showPreferences && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="flex items-center px-4 pt-4 pb-2">
            <button
              type="button"
              onClick={() => setShowPreferences(false)}
              className="w-10 h-10 flex items-center justify-center"
            >
              <X className="w-6 h-6 text-neutral-700" />
            </button>
          </div>

          <div className="flex-1 px-6 pt-4">
            <div className="flex flex-col items-center mb-8">
              <SlidersHorizontal className="w-8 h-8 text-blue-600 mb-3" />
              <h2 className="text-xl font-bold text-neutral-900">
                Preferencias de passeio
              </h2>
            </div>

            <div className="border-t border-neutral-200" />

            <div className="flex items-center gap-4 py-5">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-neutral-900">
                  Tempo de espera
                </div>
              </div>
              <div className="flex items-center gap-1 text-neutral-600">
                <span className="text-sm">{waitTime}</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <div className="border-t border-neutral-200" />

            <div className="flex items-center gap-4 py-5">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-neutral-900">Bagagem</div>
              </div>
              <button
                type="button"
                onClick={() => setHasLuggage(!hasLuggage)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  hasLuggage
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-blue-400 bg-white'
                }`}
              >
                {hasLuggage && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="border-t border-neutral-200" />

            <div className="flex items-center gap-4 py-5">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-neutral-900">Pet</div>
              </div>
              <button
                type="button"
                onClick={() => setHasPet(!hasPet)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  hasPet
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-blue-400 bg-white'
                }`}
              >
                {hasPet && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="px-6 pb-6">
            <button
              type="button"
              onClick={() => setShowPreferences(false)}
              className="w-full py-4 rounded-xl bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
