'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

function TrackingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  
  const rideId = searchParams.get('rideId')
  const [ride, setRide] = useState<any>(null)
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!rideId) return

    loadRideData()

    // Subscribe to ride updates
    const channel = supabase
      .channel(`ride:${rideId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rides',
        filter: `id=eq.${rideId}`
      }, (payload) => {
        console.log('[v0] Ride updated:', payload)
        setRide(payload.new)
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'price_offers',
        filter: `ride_id=eq.${rideId}`
      }, () => {
        console.log('[v0] New offer received')
        loadOffers()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [rideId])

  const loadRideData = async () => {
    const { data: rideData } = await supabase
      .from('rides')
      .select('*, driver:profiles!driver_id(id, full_name, avatar_url, rating)')
      .eq('id', rideId)
      .single()

    setRide(rideData)
    await loadOffers()
    setLoading(false)
  }

  const loadOffers = async () => {
    const response = await fetch(`/api/offers?ride_id=${rideId}`)
    if (response.ok) {
      const { offers: offersData } = await response.json()
      setOffers(offersData || [])
    }
  }

  const handleAcceptOffer = async (offerId: string) => {
    const response = await fetch(`/api/offers/${offerId}/accept`, {
      method: 'POST',
    })

    if (response.ok) {
      await loadRideData()
    }
  }

  const handleCancelRide = async () => {
    if (!confirm('Tem certeza que deseja cancelar esta corrida?')) return

    const response = await fetch(`/api/rides/${rideId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancellation_reason: 'Cancelado pelo passageiro' })
    })

    if (response.ok) {
      router.push('/app/home')
    }
  }

  if (loading) {
    return (
      <div className="h-dvh overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-blue-600 text-lg">Carregando...</div>
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="h-dvh overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-blue-900 text-lg mb-4">Corrida não encontrada</p>
          <Button onClick={() => router.push('/app/home')} className="bg-blue-600 hover:bg-blue-700">
            Voltar ao início
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-dvh overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
      <header className="bg-white border-b border-blue-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push('/app/home')}
              className="text-blue-700 hover:bg-blue-100"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <h1 className="text-xl font-bold text-blue-900">Acompanhar Corrida</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Status */}
        <Card className="p-6 bg-white border-blue-200 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-3 h-3 rounded-full ${
              ride.status === 'pending' ? 'bg-yellow-500' :
              ride.status === 'negotiating' ? 'bg-blue-500' :
              ride.status === 'accepted' ? 'bg-green-500' :
              ride.status === 'in_progress' ? 'bg-purple-500' :
              ride.status === 'completed' ? 'bg-gray-500' :
              'bg-red-500'
            }`}></div>
            <div>
              <h2 className="text-lg font-bold text-blue-900">
                {ride.status === 'pending' ? 'Aguardando ofertas' :
                 ride.status === 'negotiating' ? 'Negociando' :
                 ride.status === 'accepted' ? 'Corrida aceita' :
                 ride.status === 'in_progress' ? 'Em andamento' :
                 ride.status === 'completed' ? 'Finalizada' :
                 'Cancelada'}
              </h2>
              <p className="text-sm text-blue-600">
                {ride.status === 'pending' ? 'Motoristas estão vendo sua solicitação' :
                 ride.status === 'negotiating' ? 'Você tem ofertas disponíveis' :
                 ride.status === 'accepted' ? 'Motorista a caminho' :
                 ride.status === 'in_progress' ? 'Você está em viagem' :
                 ride.status === 'completed' ? 'Obrigado por usar nosso serviço' :
                 'Esta corrida foi cancelada'}
              </p>
            </div>
          </div>

          {/* Route Info */}
          <div className="flex gap-4 pt-4 border-t border-blue-100">
            <div className="flex flex-col items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <div className="w-0.5 h-12 bg-blue-300"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-sm text-blue-600 font-medium mb-1">Origem</p>
                <p className="text-blue-900">{ride.pickup_address}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium mb-1">Destino</p>
                <p className="text-blue-900">{ride.dropoff_address}</p>
              </div>
            </div>
          </div>

          {/* Driver Info */}
          {ride.driver && (
            <div className="pt-4 mt-4 border-t border-blue-100">
              <p className="text-sm text-blue-600 font-medium mb-3">Motorista</p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={ride.driver.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {ride.driver.full_name?.charAt(0) || 'M'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-blue-900">{ride.driver.full_name}</p>
                  <p className="text-sm text-blue-600">⭐ {ride.driver.rating}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Offers */}
        {ride.status === 'pending' && offers.length > 0 && (
          <Card className="p-6 bg-white border-blue-200 mb-6">
            <h2 className="text-lg font-bold text-blue-900 mb-4">
              Ofertas recebidas ({offers.length})
            </h2>
            <div className="space-y-3">
              {offers.map((offer: any) => (
                <div key={offer.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={offer.driver?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {offer.driver?.full_name?.charAt(0) || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-blue-900">{offer.driver?.full_name}</p>
                      <p className="text-sm text-blue-600">⭐ {offer.driver?.rating}</p>
                      {offer.message && (
                        <p className="text-sm text-blue-700 mt-1">{offer.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">R$ {offer.offered_price}</p>
                    <Button
                      onClick={() => handleAcceptOffer(offer.id)}
                      size="sm"
                      className="mt-2 bg-green-600 hover:bg-green-700"
                    >
                      Aceitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Price Info */}
        <Card className="p-6 bg-white border-blue-200 mb-6">
          <h2 className="text-lg font-bold text-blue-900 mb-4">Detalhes do pagamento</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-700">Sua oferta</span>
              <span className="font-semibold text-blue-900">R$ {ride.passenger_price_offer}</span>
            </div>
            {ride.final_price && (
              <div className="flex justify-between pt-2 border-t border-blue-100">
                <span className="text-blue-700 font-semibold">Preço final</span>
                <span className="text-xl font-bold text-blue-600">R$ {ride.final_price}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-blue-600">Forma de pagamento</span>
              <span className="text-blue-900">
                {ride.payment_method === 'cash' ? 'Dinheiro' :
                 ride.payment_method === 'pix' ? 'PIX' :
                 'Cartão de Crédito'}
              </span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        {(ride.status === 'pending' || ride.status === 'negotiating') && (
          <Button
            onClick={handleCancelRide}
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
          >
            Cancelar corrida
          </Button>
        )}

        {ride.status === 'completed' && (
          <Button
            onClick={() => router.push(`/app/rate?rideId=${rideId}`)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Avaliar corrida
          </Button>
        )}
      </main>
    </div>
  )
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="h-dvh overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-blue-600 text-lg">Carregando...</div>
      </div>
    }>
      <TrackingContent />
    </Suspense>
  )
}
