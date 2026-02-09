'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BottomNavigation } from '@/components/bottom-navigation'
import type { Ride } from '@/lib/types/database'

interface RideWithPassenger extends Ride {
  passenger?: {
    full_name: string
    avatar_url?: string
  }
}

export default function DriverPage() {
  const router = useRouter()
  const supabase = createClient()
  const [rides, setRides] = useState<RideWithPassenger[]>([])
  const [loading, setLoading] = useState(true)
  const [offerPrice, setOfferPrice] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    loadAvailableRides()
  }, [])

  const loadAvailableRides = async () => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          passenger:profiles!passenger_id(full_name, avatar_url)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRides(data || [])
    } catch (error) {
      console.error('[v0] Error loading rides:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMakeOffer = async (rideId: string) => {
    try {
      const price = offerPrice[rideId]
      if (!price) {
        alert('Digite um valor para sua oferta')
        return
      }

      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ride_id: rideId,
          offer_price: parseFloat(price),
          message: 'Oferta do motorista',
        }),
      })

      if (response.ok) {
        alert('Oferta enviada com sucesso!')
        setOfferPrice({ ...offerPrice, [rideId]: '' })
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('[v0] Error making offer:', error)
      alert('Erro ao enviar oferta')
    }
  }

  if (loading) {
    return (
      <div className="h-dvh bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-dvh bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-900">Corridas Disponíveis</h1>
            <Button
              onClick={loadAvailableRides}
              variant="ghost"
              size="sm"
              className="text-blue-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {rides.length === 0 ? (
          <Card className="p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-blue-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Nenhuma corrida disponível</h3>
            <p className="text-blue-600">Aguarde novas solicitações de passageiros</p>
          </Card>
        ) : (
          rides.map((ride) => (
            <Card key={ride.id} className="p-4 border-blue-100">
              <div className="space-y-4">
                {/* Passenger Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {ride.passenger?.full_name?.[0] || 'P'}
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">{ride.passenger?.full_name || 'Passageiro'}</p>
                    <p className="text-sm text-blue-600">Solicitou uma corrida</p>
                  </div>
                </div>

                {/* Route Info */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-1.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-600">Origem</p>
                      <p className="font-medium text-blue-900">{ride.pickup_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-600">Destino</p>
                      <p className="font-medium text-blue-900">{ride.dropoff_address}</p>
                    </div>
                  </div>
                </div>

                {/* Distance and Price */}
                <div className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-blue-600">Distância</p>
                    <p className="font-semibold text-blue-900">{ride.distance_km} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Oferta do Passageiro</p>
                    <p className="font-semibold text-blue-900">R$ {ride.passenger_price_offer?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>

                {/* Make Offer */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-900">Sua oferta (R$)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 25.00"
                      value={offerPrice[ride.id] || ''}
                      onChange={(e) => setOfferPrice({ ...offerPrice, [ride.id]: e.target.value })}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleMakeOffer(ride.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                    >
                      Enviar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
