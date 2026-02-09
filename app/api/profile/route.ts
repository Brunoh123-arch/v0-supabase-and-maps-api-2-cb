import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Get user profile
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, driver_profiles(*)')
      .eq('id', user.id)
      .single()

    if (error) throw error

    return NextResponse.json(profile)
  } catch (error) {
    console.error('[v0] Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
      { status: 500 }
    )
  }
}

// PATCH - Update profile
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, phone, avatar_url } = body

    console.log('[v0] Updating profile for user:', user.id)

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        phone,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    console.log('[v0] Profile updated successfully')
    return NextResponse.json(profile)

  } catch (error) {
    console.error('[v0] Error updating profile:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }
}
