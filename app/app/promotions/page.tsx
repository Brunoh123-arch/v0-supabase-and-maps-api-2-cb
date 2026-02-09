'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BottomNavigation } from '@/components/bottom-navigation'

interface Coupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_amount: number
  max_discount: number
  valid_until: string
  used: boolean
}

export default function PromotionsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_coupons')
        .select('*, coupon:coupons(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const formattedCoupons = data?.map((item: any) => ({
        id: item.coupon.id,
        code: item.coupon.code,
        discount_type: item.coupon.discount_type,
        discount_value: item.coupon.discount_value,
        min_amount: item.coupon.min_amount,
        max_discount: item.coupon.max_discount,
        valid_until: item.coupon.valid_until,
        used: item.used
      })) || []

      setCoupons(formattedCoupons)
    } catch (error) {
      console.error('[v0] Error loading coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim() || applying) return

    setApplying(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if coupon exists and is valid
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .single()

      if (couponError || !coupon) {
        alert('Cupom inválido')
        return
      }

      // Check if already used
      const { data: existing } = await supabase
        .from('user_coupons')
        .select('*')
        .eq('user_id', user.id)
        .eq('coupon_id', coupon.id)
        .single()

      if (existing) {
        alert('Você já possui este cupom')
        return
      }

      // Add coupon to user
      const { error: insertError } = await supabase
        .from('user_coupons')
        .insert({
          user_id: user.id,
          coupon_id: coupon.id
        })

      if (insertError) throw insertError

      alert('Cupom adicionado com sucesso!')
      setCouponCode('')
      loadCoupons()
    } catch (error) {
      console.error('[v0] Error applying coupon:', error)
      alert('Erro ao adicionar cupom')
    } finally {
      setApplying(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert('Código copiado!')
  }

  if (loading) {
    return (
      <div className="h-dvh overflow-y-auto bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center pb-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-dvh overflow-y-auto bg-gradient-to-br from-blue-50 to-blue-100 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-8">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-blue-500 mb-4"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Promoções</h1>
        <p className="text-blue-100">Economize em suas corridas</p>
      </header>

      <main className="p-6 space-y-6">
        {/* Add Coupon */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Adicionar Cupom</h2>
          <div className="flex gap-2">
            <Input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Digite o código"
              className="flex-1"
              disabled={applying}
            />
            <Button
              onClick={applyCoupon}
              disabled={!couponCode.trim() || applying}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {applying ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </Card>

        {/* Coupons List */}
        <div>
          <h2 className="text-xl font-bold text-blue-900 mb-4">Meus Cupons</h2>
          {coupons.length === 0 ? (
            <Card className="p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-blue-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <p className="text-blue-600 font-medium">Nenhum cupom disponível</p>
              <p className="text-sm text-blue-500 mt-1">Adicione cupons para economizar</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => {
                const isExpired = new Date(coupon.valid_until) < new Date()
                const discount = coupon.discount_type === 'percentage' 
                  ? `${coupon.discount_value}% OFF`
                  : `R$ ${coupon.discount_value.toFixed(2)} OFF`

                return (
                  <Card key={coupon.id} className={`p-4 ${coupon.used || isExpired ? 'opacity-50' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-2xl font-bold text-blue-600 mb-1">{discount}</div>
                        <p className="text-sm text-blue-700">
                          Mínimo de R$ {coupon.min_amount.toFixed(2)}
                        </p>
                        {coupon.max_discount > 0 && (
                          <p className="text-xs text-blue-500">
                            Máx. R$ {coupon.max_discount.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        coupon.used ? 'bg-gray-200 text-gray-700' :
                        isExpired ? 'bg-red-100 text-red-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {coupon.used ? 'Usado' : isExpired ? 'Expirado' : 'Disponível'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <div>
                        <p className="text-xs text-blue-600 mb-1">CÓDIGO</p>
                        <p className="font-mono font-bold text-blue-900">{coupon.code}</p>
                      </div>
                      <Button
                        onClick={() => copyCode(coupon.code)}
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        disabled={coupon.used || isExpired}
                      >
                        Copiar
                      </Button>
                    </div>

                    <p className="text-xs text-blue-500 mt-3">
                      Válido até {new Date(coupon.valid_until).toLocaleDateString('pt-BR')}
                    </p>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
