'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BottomNavigation } from '@/components/bottom-navigation'

interface Payment {
  id: string
  amount: number
  payment_method: string
  status: string
  created_at: string
  ride_id?: string
}

export default function PaymentsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMethod, setSelectedMethod] = useState('wallet')

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load wallet transactions (which represent payments)
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      
      // Transform to payment format
      const formattedPayments = (data || []).map(t => ({
        id: t.id,
        amount: parseFloat(t.amount),
        payment_method: 'wallet',
        status: 'completed',
        created_at: t.created_at,
        ride_id: t.ride_id
      }))
      
      setPayments(formattedPayments)
    } catch (error) {
      console.error('[v0] Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const paymentMethods = [
    { id: 'wallet', name: 'Carteira Uppi', iconPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { id: 'pix', name: 'PIX', iconPath: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: 'cash', name: 'Dinheiro', iconPath: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Pago'
      case 'pending': return 'Pendente'
      case 'failed': return 'Falhou'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="h-dvh bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-[2.5px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-dvh overflow-y-auto bg-neutral-50 pb-24 ios-scroll">
      {/* Header - iOS style */}
      <header className="bg-white/95 ios-blur border-b border-neutral-200/60 sticky top-0 z-30">
        <div className="px-5 pt-safe-offset-4 pb-3">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full ios-press">
              <svg className="w-[22px] h-[22px] text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-[20px] font-bold text-neutral-900 tracking-tight">Pagamentos</h1>
          </div>
        </div>
      </header>

      <main className="px-5 py-5 max-w-2xl mx-auto space-y-6">
        {/* Payment Methods - iOS grouped list */}
        <div>
          <p className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wide mb-2 px-1">Seus Metodos</p>
          <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            {paymentMethods.map((method, i) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full px-5 py-4 flex items-center gap-4 ios-press ${i < paymentMethods.length - 1 ? 'border-b border-neutral-100' : ''}`}
              >
                <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center ${
                  selectedMethod === method.id ? 'bg-blue-500' : 'bg-neutral-100'
                }`}>
                  <svg className={`w-[22px] h-[22px] ${selectedMethod === method.id ? 'text-white' : 'text-neutral-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={method.iconPath} />
                  </svg>
                </div>
                <span className="flex-1 text-left text-[17px] font-medium text-neutral-900">{method.name}</span>
                {selectedMethod === method.id && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Payment History - iOS grouped list */}
        <div>
          <p className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wide mb-2 px-1">Historico</p>
          {payments.length === 0 ? (
            <div className="bg-white rounded-[20px] p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <svg className="w-14 h-14 text-neutral-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[17px] font-medium text-neutral-900">Nenhum pagamento</p>
              <p className="text-[15px] text-neutral-500 mt-1">Seus pagamentos aparecerao aqui</p>
            </div>
          ) : (
            <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              {payments.map((payment, i) => (
                <div key={payment.id} className={`px-5 py-4 flex items-center justify-between ${i < payments.length - 1 ? 'border-b border-neutral-100' : ''}`}>
                  <div>
                    <p className="text-[17px] font-bold text-neutral-900">R$ {payment.amount.toFixed(2)}</p>
                    <p className="text-[13px] text-neutral-500 mt-0.5">
                      {new Date(payment.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={`text-[12px] font-semibold px-3 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                    {getStatusText(payment.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security info - iOS style */}
        <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex gap-3.5">
            <div className="w-10 h-10 bg-green-50 rounded-[14px] flex items-center justify-center flex-shrink-0">
              <svg className="w-[22px] h-[22px] text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-neutral-900 mb-0.5">Dados seguros</p>
              <p className="text-[13px] text-neutral-500 leading-relaxed">
                Todas as informacoes de pagamento sao criptografadas e protegidas.
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
