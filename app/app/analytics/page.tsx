'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BottomNavigation } from '@/components/bottom-navigation'

export default function AnalyticsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [monthlyData, setMonthlyData] = useState<any[]>([])

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/onboarding/splash')
        return
      }

      // Buscar estatísticas gerais
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, driver_profile:driver_profiles(*)')
        .eq('id', user.id)
        .single()

      // Buscar corridas do último ano
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

      const { data: rides } = await supabase
        .from('rides')
        .select('*, price_offers!inner(*)')
        .or(`passenger_id.eq.${user.id},driver_id.eq.${user.id}`)
        .eq('status', 'completed')
        .gte('created_at', oneYearAgo.toISOString())
        .order('created_at', { ascending: false })

      // Calcular estatísticas mensais
      const monthly = calculateMonthlyStats(rides || [], user.id, profile?.user_type)

      setStats({
        totalRides: rides?.length || 0,
        totalSpent: calculateTotal(rides || [], user.id, 'passenger'),
        totalEarned: calculateTotal(rides || [], user.id, 'driver'),
        avgRating: profile?.rating || 0,
        userType: profile?.user_type
      })
      
      setMonthlyData(monthly)
    } catch (error) {
      console.error('[v0] Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = (rides: any[], userId: string, type: 'passenger' | 'driver') => {
    return rides
      .filter(ride => type === 'passenger' ? ride.passenger_id === userId : ride.driver_id === userId)
      .reduce((sum, ride) => sum + (ride.price_offers?.[0]?.amount || 0), 0)
  }

  const calculateMonthlyStats = (rides: any[], userId: string, userType: string) => {
    const monthsData: any = {}
    
    rides.forEach(ride => {
      const date = new Date(ride.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthsData[monthKey]) {
        monthsData[monthKey] = { month: monthKey, rides: 0, amount: 0 }
      }
      
      monthsData[monthKey].rides++
      monthsData[monthKey].amount += ride.price_offers?.[0]?.amount || 0
    })

    return Object.values(monthsData).slice(0, 6).reverse()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="text-blue-700 hover:bg-blue-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <h1 className="text-xl font-bold text-blue-900">Analytics</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Resumo Geral */}
        <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <h2 className="text-lg font-semibold mb-4">Resumo Geral</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-blue-100 text-sm">Total de Corridas</p>
              <p className="text-3xl font-bold">{stats?.totalRides}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Rating Médio</p>
              <p className="text-3xl font-bold">{stats?.avgRating.toFixed(1)} ⭐</p>
            </div>
            {stats?.userType === 'passenger' && (
              <div className="col-span-2">
                <p className="text-blue-100 text-sm">Total Gasto</p>
                <p className="text-3xl font-bold">
                  R$ {stats?.totalSpent.toFixed(2)}
                </p>
              </div>
            )}
            {stats?.userType === 'driver' && (
              <div className="col-span-2">
                <p className="text-blue-100 text-sm">Total Ganho</p>
                <p className="text-3xl font-bold">
                  R$ {stats?.totalEarned.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Estatísticas Mensais */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-4">Últimos 6 Meses</h2>
          <div className="space-y-3">
            {monthlyData.map((data: any) => (
              <div key={data.month} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold text-blue-900">{data.month}</p>
                  <p className="text-sm text-blue-600">{data.rides} corridas</p>
                </div>
                <p className="text-lg font-bold text-blue-700">
                  R$ {data.amount.toFixed(2)}
                </p>
              </div>
            ))}
            {monthlyData.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Nenhuma corrida realizada ainda
              </p>
            )}
          </div>
        </Card>

        {/* Insights */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-4">Insights</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <div>
                <p className="font-semibold text-blue-900">Crescimento</p>
                <p className="text-sm text-blue-600">
                  Você está usando o Uppi cada vez mais!
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-green-900">Economia</p>
                <p className="text-sm text-green-600">
                  Negociar preços te fez economizar em média 15%
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  )
}
