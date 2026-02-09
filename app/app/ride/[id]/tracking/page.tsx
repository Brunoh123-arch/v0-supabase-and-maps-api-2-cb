'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Ride, Profile, DriverProfile } from '@/lib/types/database'

export default function RideTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [ride, setRide] = useState<Ride | null>(null)
  const [driver, setDriver] = useState<Profile | null>(null)
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null)
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

      if (rideData?.driver_id) {
        // Load driver profile
        const { data: driverData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', rideData.driver_id)
          .single()
        
        setDriver(driverData)

        // Load driver vehicle info
        const { data: vehicleData } = await supabase
          .from('driver_profiles')
          .select('*')
          .eq('id', rideData.driver_id)
          .single()
        
        setDriverProfile(vehicleData)
      }

      setLoading(false)
    }

    loadData()

    // Subscribe to ride updates
    const channel = supabase
      .channel('ride_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rides',
          filter: `id=eq.${params.id}`
        },
        (payload) => {
          console.log('[v0] Ride updated:', payload)
          setRide(payload.new as Ride)
          
          if (payload.new.status === 'completed') {
            router.push(`/app/ride/${params.id}/review`)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.id, supabase, router])

  const handleStartRide = async () => {
    await supabase
      .from('rides')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', params.id)
  }

  const handleCompleteRide = async () => {
    await supabase
      .from('rides')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', params.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-blue-600 text-lg">Carregando...</div>
      </div>
    )
  }

  const getStatusText = () => {
    switch (ride?.status) {
      case 'accepted':
        return 'Motorista a caminho'
      case 'in_progress':
        return 'Em viagem'
      case 'completed':
        return 'Corrida finalizada'
      default:
        return 'Aguardando'
    }
  }

  const getStatusColor = () => {
    switch (ride?.status) {
      case 'accepted':
        return 'bg-yellow-500'
      case 'in_progress':
        return 'bg-green-500'
      case 'completed':
        return 'bg-blue-600'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-blue-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-blue-900 text-center">{getStatusText()}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <div className={`${getStatusColor()} text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2`}>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            {getStatusText()}
          </div>
        </div>

        {/* Map Placeholder */}
        <Card className="mb-6 h-96 bg-blue-50 border-blue-200 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center relative">
            <svg className="w-20 h-20 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {/* Route markers */}
            <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center animate-bounce">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C7.802 0 4.403 3.403 4.403 7.602c0 4.198 7.597 16.398 7.597 16.398s7.597-12.2 7.597-16.398C19.597 3.403 16.198 0 12 0zm0 11.5c-2.14 0-3.898-1.76-3.898-3.898C8.102 5.56 9.86 3.8 12 3.8s3.898 1.76 3.898 3.898C15.898 9.74 14.14 11.5 12 11.5z"/>
              </svg>
            </div>
            <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-red-500 rounded-full"></div>
          </div>
        </Card>

        {/* Driver Info */}
        {driver && (
          <Card className="p-6 bg-white border-blue-200 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-20 h-20 border-2 border-blue-200">
                <AvatarImage src={driver.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-bold">
                  {driver.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-900">{driver.full_name}</h3>
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <span className="font-semibold text-lg">{driver.rating.toFixed(1)}</span>
                  </div>
                  <span>•</span>
                  <span>{driver.total_rides} corridas</span>
                </div>
              </div>
              <Button size="icon" className="bg-green-500 hover:bg-green-600 rounded-full w-14 h-14">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </Button>
            </div>
            {driverProfile && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Veículo</p>
                    <p className="text-sm text-blue-900 font-semibold">
                      {driverProfile.vehicle_brand} {driverProfile.vehicle_model}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Cor</p>
                    <p className="text-sm text-blue-900 font-semibold">{driverProfile.vehicle_color}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Placa</p>
                    <p className="text-sm text-blue-900 font-semibold font-mono uppercase">{driverProfile.vehicle_plate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Tipo</p>
                    <p className="text-sm text-blue-900 font-semibold capitalize">{driverProfile.vehicle_type}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Trip Details */}
        <Card className="p-6 bg-white border-blue-200 mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Detalhes da Viagem</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <div className="w-0.5 h-12 bg-blue-300"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Origem</p>
                  <p className="text-blue-900 font-semibold">{ride?.pickup_address}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Destino</p>
                  <p className="text-blue-900 font-semibold">{ride?.dropoff_address}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-4 border-t border-blue-100">
              <div>
                <p className="text-sm text-blue-600">Distância</p>
                <p className="text-lg font-bold text-blue-900">{ride?.distance_km} km</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Valor</p>
                <p className="text-lg font-bold text-green-600">R$ {ride?.final_price?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Pagamento</p>
                <p className="text-lg font-bold text-blue-900 capitalize">
                  {ride?.payment_method === 'cash' ? 'Dinheiro' : 
                   ride?.payment_method === 'pix' ? 'PIX' : 
                   ride?.payment_method === 'credit_card' ? 'Crédito' : 
                   ride?.payment_method}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons (for demo purposes) */}
        {ride?.status === 'accepted' && (
          <Button 
            onClick={handleStartRide}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg"
          >
            Iniciar Corrida
          </Button>
        )}

        {ride?.status === 'in_progress' && (
          <Button 
            onClick={handleCompleteRide}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
          >
            Finalizar Corrida
          </Button>
        )}
      </main>
    </div>
  )
}
