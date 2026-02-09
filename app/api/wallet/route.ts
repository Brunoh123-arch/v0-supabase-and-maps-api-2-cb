import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Get wallet transactions
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: transactions, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    // Calculate balance
    const balance = transactions?.reduce((sum, t) => {
      if (t.type === 'credit') return sum + parseFloat(t.amount)
      if (t.type === 'debit') return sum - parseFloat(t.amount)
      return sum
    }, 0) || 0

    return NextResponse.json({ transactions, balance })
  } catch (error) {
    console.error('[v0] Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar transações' },
      { status: 500 }
    )
  }
}

// POST - Add transaction
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, type, description, ride_id } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }

    if (!type || !['credit', 'debit', 'refund', 'withdrawal'].includes(type)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    console.log('[v0] Creating wallet transaction:', type, amount)

    // Create transaction
    const { data: transaction, error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        amount,
        type,
        description: description || `Transação ${type}`,
        ride_id
      })
      .select()
      .single()

    if (error) throw error

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'wallet',
      title: type === 'credit' ? 'Crédito adicionado' : 'Débito realizado',
      message: `R$ ${amount.toFixed(2)} ${type === 'credit' ? 'adicionado à' : 'debitado da'} sua carteira`,
      read: false
    })

    console.log('[v0] Transaction created successfully')
    return NextResponse.json({ transaction })

  } catch (error) {
    console.error('[v0] Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Erro ao processar transação' },
      { status: 500 }
    )
  }
}
