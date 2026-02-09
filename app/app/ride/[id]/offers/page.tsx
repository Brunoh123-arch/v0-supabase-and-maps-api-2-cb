'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Ride, PriceOffer } from '@/lib/types/database'

export default function RideOffersPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [ride, setRide] = useState<Ride | null>(null)
  const [offers, setOffers] = useState<PriceOffer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      // Load ride details
      const { data: rideData } = await supabase
        .from('rides')
        .select('*')
        .eq('id', params.id)
        .single()
      
      setRide(rideData)

      // Load offers with driver profiles
      const { data: offersData } = await supabase
        .from('price_offers')
        .select(`
          *,
          driver:profiles!driver_id (
            id,
            full_name,
            avatar_url,
            rating,
            total_rides,
            driver_profile:driver_profiles (
              vehicle_type,
              vehicle_brand,
              vehicle_model,
              vehicle_color,
              vehicle_plate
            )
          )
        `)
        .eq('ride_id', params.id)
        .eq('status', 'pending')
        .order('offered_price', { ascending: true })
      
      setOffers(offersData || [])
      setLoading(false)
    }

    loadData()

    // Subscribe to new offers
    const channel = supabase
      .channel('price_offers')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'price_offers',
          filter: `ride_id=eq.${params.id}`
        },
        async (payload) => {
          console.log('[v0] New offer received:', payload)
          // Reload offers
          const { data: offersData } = await supabase
            .from('price_offers')
            .select(`
              *,
              driver:profiles!driver_id (
                id,
                full_name,
                avatar_url,
                rating,
                total_rides,
                driver_profile:driver_profiles (
                  vehicle_type,
                  vehicle_brand,
                  vehicle_model,
                  vehicle_color,
                  vehicle_plate
                )
              )
            `)
            .eq('ride_id', params.id)
            .eq('status', 'pending')
            .order('offered_price', { ascending: true })
          
          setOffers(offersData || [])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.id, supabase])

  const handleAcceptOffer = async (offerId: string, driverId: string, price: number) => {
    // Update offer status
    await supabase
      .from('price_offers')
      .update({ status: 'accepted' })
      .eq('id', offerId)

    // Update ride with accepted driver and price
    await supabase
      .from('rides')
      .update({
        driver_id: driverId,
        final_price: price,
        status: 'accepted'
      })
      .eq('id', params.id)

    // Reject other offers
    await supabase
      .from('price_offers')
      .update({ status: 'rejected' })
      .eq('ride_id', params.id)
      .neq('id', offerId)

    router.push(`/app/ride/${params.id}/tracking`)
  }

  const handleCancelRide = async () => {
    await supabase
      .from('rides')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', params.id)

    router.push('/app/home')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-blue-600 text-lg">Carregando ofertas...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-blue-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => router.push('/app/home')}
                className="text-blue-700 hover:bg-blue-100"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
              <h1 className="text-xl font-bold text-blue-900">Ofertas de Motoristas</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Your Offer */}
        <Card className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 border-0 mb-6">
          <div className="text-white">
            <p className="text-blue-100 mb-2">Sua oferta de preço</p>
            <p className="text-4xl font-bold">R$ {ride?.passenger_price_offer?.toFixed(2)}</p>
            <p className="text-blue-100 mt-4">
              {ride?.pickup_address} → {ride?.dropoff_address}
            </p>
          </div>
        </Card>

        {/* Waiting State */}
        {offers.length === 0 && (
          <Card className="p-12 bg-white border-blue-200 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">Procurando motoristas...</h3>
                <p className="text-blue-700">
                  Aguarde enquanto motoristas próximos visualizam sua solicitação e fazem suas ofertas.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Offers List */}
        {offers.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-blue-900">
              {offers.length} {offers.length === 1 ? 'oferta recebida' : 'ofertas recebidas'}
            </h2>
            {offers.map((offer) => {
              const driver = offer.driver as any
              const driverProfile = driver?.driver_profile?.[0]
              
              return (
                <Card key={offer.id} className="p-6 bg-white border-blue-200 hover:border-blue-400 transition-colors">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16 border-2 border-blue-200">
                      <AvatarImage src={driver?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-bold">
                        {driver?.full_name?.charAt(0) || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-blue-900">{driver?.full_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                              <span className="font-semibold">{driver?.rating?.toFixed(1) || '5.0'}</span>
                            </div>
                            <span>•</span>
                            <span>{driver?.total_rides || 0} corridas</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-blue-600">
                            R$ {offer.offered_price.toFixed(2)}
                          </div>
                          {offer.offered_price < (ride?.passenger_price_offer || 0) && (
                            <span className="text-xs text-green-600 font-semibold">Melhor preço!</span>
                          )}
                        </div>
                      </div>
                      
                      {driverProfile && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-blue-900 font-medium">
                            {driverProfile.vehicle_color} {driverProfile.vehicle_brand} {driverProfile.vehicle_model}
                          </p>
                          <p className="text-xs text-blue-600 uppercase font-mono">{driverProfile.vehicle_plate}</p>
                        </div>
                      )}
                      
                      {offer.message && (
                        <p className="text-sm text-blue-700 italic mb-3">"{offer.message}"</p>
                      )}
                      
                      <Button 
                        onClick={() => handleAcceptOffer(offer.id, offer.driver_id, offer.offered_price)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        Aceitar Oferta
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Cancel Button */}
        <div className="mt-8 text-center">
          <Button 
            variant="ghost"
            onClick={handleCancelRide}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Cancelar Solicitação
          </Button>
        </div>
      </main>
    </div>
  )
}
