import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ride_id, offer_price, message } = body

    // Check if user is a driver
    const { data: driverProfile } = await supabase
      .from('driver_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!driverProfile) {
      return NextResponse.json({ error: 'Only drivers can make offers' }, { status: 403 })
    }

    // Set expiration time (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Create offer
    const { data: offer, error } = await supabase
      .from('price_offers')
      .insert({
        ride_id,
        driver_id: user.id,
        offered_price: offer_price,
        message,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error creating offer:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ offer })
  } catch (error) {
    console.error('[v0] API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ride_id = searchParams.get('ride_id')

    if (!ride_id) {
      return NextResponse.json({ error: 'ride_id is required' }, { status: 400 })
    }

    // Get offers with driver profiles
    const { data: offers, error } = await supabase
      .from('price_offers')
      .select(`
        *,
        driver:profiles!driver_id(
          id,
          full_name,
          avatar_url,
          rating,
          total_rides,
          driver_profiles(*)
        )
      `)
      .eq('ride_id', ride_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching offers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ offers })
  } catch (error) {
    console.error('[v0] API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
