import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - List favorites
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('[v0] Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar favoritos' },
      { status: 500 }
    )
  }
}

// POST - Add favorite
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { label, address, latitude, longitude } = body

    if (!label || !address || !latitude || !longitude) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    console.log('[v0] Adding favorite:', label, address)

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        label,
        address,
        location: `POINT(${longitude} ${latitude})`
      })
      .select()
      .single()

    if (error) throw error

    console.log('[v0] Favorite added successfully')
    return NextResponse.json(data)

  } catch (error) {
    console.error('[v0] Error adding favorite:', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar favorito' },
      { status: 500 }
    )
  }
}

// DELETE - Remove favorite
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 })
    }

    console.log('[v0] Removing favorite:', id)

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    console.log('[v0] Favorite removed successfully')
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[v0] Error removing favorite:', error)
    return NextResponse.json(
      { error: 'Erro ao remover favorito' },
      { status: 500 }
    )
  }
}
