import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BottomNavigation } from '@/components/bottom-navigation'

export default async function DriverEarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/onboarding/splash')
  }

  // Get driver profile
  const { data: driver } = await supabase
    .from('driver_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!driver) {
    redirect('/app/driver/register')
  }

  // Get completed rides for this driver
  const { data: rides } = await supabase
    .from('rides')
    .select(`
      *,
      passenger:profiles!passenger_id(full_name, avatar_url)
    `)
    .eq('driver_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  const totalRides = rides?.length || 0
  const totalEarnings = rides?.reduce((sum, ride) => sum + (ride.final_price || 0), 0) || 0
  const avgRideValue = totalRides > 0 ? totalEarnings / totalRides : 0

  // Group by period
  const today = new Date()
  const thisWeek = rides?.filter(r => {
    const date = new Date(r.completed_at)
    const diff = today.getTime() - date.getTime()
    return diff < 7 * 24 * 60 * 60 * 1000
  }) || []
  const thisMonth = rides?.filter(r => {
    const date = new Date(r.completed_at)
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }) || []

  const weekEarnings = thisWeek.reduce((sum, r) => sum + (r.final_price || 0), 0)
  const monthEarnings = thisMonth.reduce((sum, r) => sum + (r.final_price || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/app/driver">
            <Button variant="ghost" size="icon" className="text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-blue-900">Meus Ganhos</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-blue-100">
            <div className="text-sm text-gray-600 mb-1">Esta Semana</div>
            <div className="text-2xl font-bold text-blue-600">
              R$ {weekEarnings.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">{thisWeek.length} corridas</div>
          </Card>

          <Card className="p-4 border-blue-100">
            <div className="text-sm text-gray-600 mb-1">Este Mês</div>
            <div className="text-2xl font-bold text-blue-600">
              R$ {monthEarnings.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">{thisMonth.length} corridas</div>
          </Card>

          <Card className="p-4 border-blue-100">
            <div className="text-sm text-gray-600 mb-1">Total Geral</div>
            <div className="text-2xl font-bold text-blue-900">
              R$ {totalEarnings.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">{totalRides} corridas</div>
          </Card>

          <Card className="p-4 border-blue-100">
            <div className="text-sm text-gray-600 mb-1">Média por Corrida</div>
            <div className="text-2xl font-bold text-blue-900">
              R$ {avgRideValue.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">valor médio</div>
          </Card>
        </div>

        {/* Recent Rides */}
        <Card className="p-4 border-blue-100">
          <h2 className="text-lg font-bold text-blue-900 mb-4">Corridas Recentes</h2>
          
          {!rides || rides.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-2">Nenhuma corrida concluída ainda</p>
              <p className="text-sm text-gray-500">Comece a aceitar corridas para ver seus ganhos aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rides.slice(0, 10).map((ride) => (
                <div key={ride.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex-1">
                    <div className="font-medium text-blue-900">
                      {ride.passenger?.full_name || 'Passageiro'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(ride.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      R$ {ride.final_price?.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {ride.distance_km ? `${ride.distance_km} km` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Withdraw Button */}
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12">
          <Link href="/app/wallet">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Sacar Ganhos
          </Link>
        </Button>
      </main>

      <BottomNavigation />
    </div>
  )
}
