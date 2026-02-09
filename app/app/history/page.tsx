'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Ride } from '@/lib/types/database'
import { BottomNavigation } from '@/components/bottom-navigation'

interface RideWithDetails extends Ride {
  driver?: {
    full_name: string
    avatar_url?: string
    rating: number
  }
  passenger?: {
    full_name: string
    avatar_url?: string
    rating: number
  }
}

export default function HistoryPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [rides, setRides] = useState<RideWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data } = await supabase
          .from('rides')
          .select(`
            *,
            driver:profiles!driver_id (
              full_name,
              avatar_url,
              rating
            ),
            passenger:profiles!passenger_id (
              full_name,
              avatar_url,
              rating
            )
          `)
          .or(`passenger_id.eq.${user.id},driver_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
        
        setRides(data || [])
      }
      setLoading(false)
    }

    loadHistory()
  }, [supabase])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-50 text-green-600', label: 'Concluida' },
      cancelled: { color: 'bg-red-50 text-red-500', label: 'Cancelada' },
      in_progress: { color: 'bg-blue-50 text-blue-500', label: 'Em Andamento' },
      accepted: { color: 'bg-amber-50 text-amber-600', label: 'Aceita' },
      pending: { color: 'bg-neutral-100 text-neutral-600', label: 'Pendente' },
      negotiating: { color: 'bg-violet-50 text-violet-500', label: 'Negociando' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <span className={`${config.color} px-3 py-1 rounded-full text-[12px] font-semibold`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="h-dvh bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-[2.5px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const completedRides = rides.filter(r => r.status === 'completed')
  const cancelledRides = rides.filter(r => r.status === 'cancelled')
  const activeRides = rides.filter(r => ['pending', 'negotiating', 'accepted', 'in_progress'].includes(r.status))

  return (
    <div className="h-dvh overflow-y-auto bg-neutral-50 pb-24 ios-scroll">
      {/* Header - iOS style */}
      <header className="bg-white/95 ios-blur border-b border-neutral-200/60 sticky top-0 z-30">
        <div className="px-5 pt-safe-offset-4 pb-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full ios-press"
            >
              <svg className="w-[22px] h-[22px] text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-[20px] font-bold text-neutral-900 tracking-tight">Historico</h1>
          </div>
        </div>
      </header>

      <main className="px-5 py-5 max-w-2xl mx-auto">
        {/* Stats - iOS style */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-[18px] p-4 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="text-[24px] font-bold text-blue-500 tracking-tight">{completedRides.length}</div>
            <div className="text-[12px] font-semibold text-neutral-500 mt-0.5">Concluidas</div>
          </div>
          <div className="bg-white rounded-[18px] p-4 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="text-[24px] font-bold text-blue-500 tracking-tight">{activeRides.length}</div>
            <div className="text-[12px] font-semibold text-neutral-500 mt-0.5">Ativas</div>
          </div>
          <div className="bg-white rounded-[18px] p-4 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="text-[24px] font-bold text-blue-500 tracking-tight">{cancelledRides.length}</div>
            <div className="text-[12px] font-semibold text-neutral-500 mt-0.5">Canceladas</div>
          </div>
        </div>

        {/* Tabs - iOS segmented control */}
        <Tabs defaultValue="all" className="mb-5">
          <TabsList className="grid w-full grid-cols-3 bg-neutral-100 rounded-[14px] h-[40px] p-1">
            <TabsTrigger value="all" className="rounded-[10px] text-[14px] font-semibold data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm">
              Todas
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-[10px] text-[14px] font-semibold data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm">
              Concluidas
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="rounded-[10px] text-[14px] font-semibold data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm">
              Canceladas
            </TabsTrigger>
          </TabsList>

          {/* All Rides - iOS card style */}
          <TabsContent value="all" className="space-y-3 mt-3">
            {rides.length === 0 ? (
              <div className="bg-white rounded-[20px] p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <svg className="w-14 h-14 text-neutral-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[17px] font-medium text-neutral-900">Nenhuma corrida</p>
                <p className="text-[15px] text-neutral-500 mt-1">Suas viagens aparecerão aqui</p>
              </div>
            ) : (
              rides.map((ride) => (
                <div key={ride.id} className="bg-white rounded-[20px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ios-press">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        {getStatusBadge(ride.status)}
                        <span className="text-[13px] text-neutral-500">{formatDate(ride.created_at)}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex gap-3 items-start">
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                          <p className="text-[15px] text-neutral-900 font-medium leading-snug">{ride.pickup_address}</p>
                        </div>
                        <div className="flex gap-3 items-start">
                          <div className="w-2.5 h-2.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                          <p className="text-[15px] text-neutral-900 font-medium leading-snug">{ride.dropoff_address}</p>
                        </div>
                      </div>
                    </div>
                    {ride.final_price && (
                      <div className="text-right ml-3">
                        <p className="text-[22px] font-bold text-blue-500 tracking-tight">R$ {ride.final_price.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                  {ride.driver && (
                    <div className="pt-3 border-t border-neutral-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] text-neutral-500">Motorista:</span>
                          <span className="text-[14px] font-semibold text-neutral-900">{ride.driver.full_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                          <span className="text-[14px] font-semibold text-neutral-900">{ride.driver.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* Completed Rides */}
          <TabsContent value="completed" className="space-y-3 mt-3">
            {completedRides.length === 0 ? (
              <div className="bg-white rounded-[20px] p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <p className="text-[17px] font-medium text-neutral-900">Nenhuma corrida concluida</p>
              </div>
            ) : (
              completedRides.map((ride) => (
                <div key={ride.id} className="bg-white rounded-[20px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <span className="text-[13px] text-neutral-500">{formatDate(ride.completed_at || ride.created_at)}</span>
                      <div className="space-y-2 mt-2">
                        <div className="flex gap-3 items-start">
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                          <p className="text-[15px] text-neutral-900 font-medium">{ride.pickup_address}</p>
                        </div>
                        <div className="flex gap-3 items-start">
                          <div className="w-2.5 h-2.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                          <p className="text-[15px] text-neutral-900 font-medium">{ride.dropoff_address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-[22px] font-bold text-green-500 tracking-tight">R$ {ride.final_price?.toFixed(2)}</p>
                      <p className="text-[13px] text-neutral-500">{ride.distance_km} km</p>
                    </div>
                  </div>
                  {ride.driver && (
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-[15px] text-neutral-900 font-semibold">{ride.driver.full_name}</span>
                      <button
                        type="button"
                        onClick={() => router.push(`/app/ride/${ride.id}/review`)}
                        className="px-4 h-[34px] rounded-full bg-blue-500 text-white text-[14px] font-semibold ios-press"
                      >
                        Avaliar
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* Cancelled Rides */}
          <TabsContent value="cancelled" className="space-y-3 mt-3">
            {cancelledRides.length === 0 ? (
              <div className="bg-white rounded-[20px] p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <p className="text-[17px] font-medium text-neutral-900">Nenhuma corrida cancelada</p>
              </div>
            ) : (
              cancelledRides.map((ride) => (
                <div key={ride.id} className="bg-white rounded-[20px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] opacity-80">
                  <div className="mb-2">
                    <span className="text-[13px] text-neutral-500">{formatDate(ride.cancelled_at || ride.created_at)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-3 items-start">
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                      <p className="text-[15px] text-neutral-900">{ride.pickup_address}</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-2.5 h-2.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                      <p className="text-[15px] text-neutral-900">{ride.dropoff_address}</p>
                    </div>
                  </div>
                  {ride.cancellation_reason && (
                    <p className="text-[13px] text-red-500 mt-3">Motivo: {ride.cancellation_reason}</p>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  )
}
