'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BottomNavigation } from '@/components/bottom-navigation'

interface Payment {
  id: string
  amount: number
  payment_method: string
  status: string
  created_at: string
  ride_id?: string
  type: 'ride' | 'topup' | 'cashback'
}

export default function WalletPage() {
  const router = useRouter()
  const supabase = createClient()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMoney, setShowAddMoney] = useState(false)
  const [amount, setAmount] = useState('')

  useEffect(() => {
    loadWalletData()
  }, [])

  const loadWalletData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load wallet transactions to calculate balance
      const { data: transactions, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate balance from transactions
      const calculatedBalance = (transactions || []).reduce((sum, t) => {
        if (t.type === 'credit') return sum + parseFloat(t.amount)
        if (t.type === 'debit') return sum - parseFloat(t.amount)
        return sum
      }, 0)

      setBalance(calculatedBalance)
      setTransactions(transactions || [])
    } catch (error) {
      console.error('[v0] Error loading wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Digite um valor válido')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Create wallet transaction
      const { error } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          amount: parseFloat(amount),
          type: 'credit',
          description: 'Recarga via PIX'
        })

      if (error) throw error

      alert('Saldo adicionado com sucesso!')
      setShowAddMoney(false)
      setAmount('')
      loadWalletData()
    } catch (error) {
      console.error('[v0] Error adding money:', error)
      alert('Erro ao adicionar saldo')
    }
  }

  const getTransactionIcon = (type: string) => {
    if (type === 'credit' || type === 'refund') return '+'
    return '-'
  }

  const getTransactionColor = (type: string) => {
    if (type === 'credit' || type === 'refund') return 'text-green-600'
    return 'text-red-600'
  }

  const getTransactionBg = (type: string) => {
    if (type === 'credit' || type === 'refund') return 'bg-green-100'
    return 'bg-red-100'
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
            <h1 className="text-[20px] font-bold text-neutral-900 tracking-tight">Carteira</h1>
          </div>
        </div>
      </header>

      <main className="px-5 py-5 max-w-2xl mx-auto space-y-5">
        {/* Balance Card - iOS style */}
        <div className="bg-blue-500 rounded-[24px] p-6 text-white shadow-[0_8px_24px_rgba(59,130,246,0.3)]">
          <p className="text-blue-100 text-[15px] font-medium mb-1">Saldo Disponivel</p>
          <h2 className="text-[40px] font-bold tracking-tight mb-6">R$ {balance.toFixed(2)}</h2>
          
          <button
            type="button"
            onClick={() => setShowAddMoney(true)}
            className="w-full h-[48px] bg-white/20 backdrop-blur-sm rounded-[16px] text-white font-semibold text-[17px] flex items-center justify-center gap-2 ios-press"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Saldo
          </button>
        </div>

        {showAddMoney && (
          <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[20px] font-bold text-neutral-900 tracking-tight">Adicionar Saldo</h3>
              <button type="button" onClick={() => setShowAddMoney(false)} className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center ios-press">
                <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Valor</label>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0,00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-[28px] font-bold text-center h-[56px] rounded-[16px] border-neutral-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[20, 50, 100].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAmount(value.toString())}
                    className="h-[44px] rounded-[14px] bg-neutral-100 text-neutral-700 font-semibold text-[17px] ios-press"
                  >
                    R$ {value}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddMoney}
                className="w-full h-[52px] rounded-[16px] bg-blue-500 text-white font-semibold text-[17px] ios-press"
              >
                Confirmar Recarga
              </button>
            </div>
          </div>
        )}

        {/* Transactions - iOS grouped list */}
        <div>
          <p className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wide mb-3 px-1">Transacoes Recentes</p>
          {transactions.length === 0 ? (
            <div className="bg-white rounded-[20px] p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <svg className="w-14 h-14 text-neutral-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              <p className="text-[17px] font-medium text-neutral-900">Nenhuma transacao</p>
              <p className="text-[15px] text-neutral-500 mt-1">Suas transacoes aparecerao aqui</p>
            </div>
          ) : (
            <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              {transactions.map((transaction, i) => (
                <div key={transaction.id} className={`px-5 py-4 flex items-center justify-between ${i < transactions.length - 1 ? 'border-b border-neutral-100' : ''}`}>
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionBg(transaction.type)}`}>
                      <span className={`text-[17px] font-bold ${getTransactionColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}
                      </span>
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-neutral-900">
                        {transaction.description || 'Transacao'}
                      </p>
                      <p className="text-[13px] text-neutral-500">
                        {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <p className={`text-[17px] font-bold ${getTransactionColor(transaction.type)}`}>
                    {getTransactionIcon(transaction.type)}R$ {Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
