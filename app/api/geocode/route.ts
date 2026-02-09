import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { latitude, longitude } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 })
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=pt-BR`
    )

    const data = await response.json()

    if (data.status === 'OK' && data.results.length > 0) {
      return NextResponse.json({
        address: data.results[0].formatted_address,
        results: data.results,
      })
    }

    return NextResponse.json({ address: null, error: 'No results found' })
  } catch (error) {
    console.error('[v0] Geocode error:', error)
    return NextResponse.json({ error: 'Failed to geocode' }, { status: 500 })
  }
}
