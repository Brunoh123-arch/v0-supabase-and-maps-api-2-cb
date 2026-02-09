'use client'

import React from "react"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { PaymentMethod } from '@/lib/types/database'

function RequestRideContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [pickupAddress, setPickupAddress] = useState(searchParams.get('pickup') || '')
  const [dropoffAddress, setDropoffAddress] = useState(searchParams.get('dropoff') || '')
  const [priceOffer, setPriceOffer] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const estimatedDistance = 5.2
  const estimatedDuration = 15
  const suggestedPrice = 18.50

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/onboarding/splash')
      return
    }

    // Create ride request via API
    const response = await fetch('/api/rides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pickup_address: pickupAddress,
        dropoff_address: dropoffAddress,
        pickup_lat: -23.5505, // São Paulo coordinates (placeholder)
        pickup_lng: -46.6333,
        dropoff_lat: -23.5600, // Destination coordinates (placeholder)
        dropoff_lng: -46.6500,
        distance_km: estimatedDistance,
        estimated_duration_minutes: estimatedDuration,
        passenger_price_offer: parseFloat(priceOffer),
        payment_method: paymentMethod,
      })
    })

    if (!response.ok) {
      console.error('[v0] Error creating ride')
      alert('Erro ao criar solicitação de corrida')
      setLoading(false)
      return
    }

    const { ride } = await response.json()

    // Redirect to tracking page
    router.push(`/app/tracking?rideId=${ride.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-blue-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
              className="text-blue-700 hover:bg-blue-100"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <h1 className="text-xl font-bold text-blue-900">Solicitar Corrida</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Route Info */}
        <Card className="p-6 bg-white border-blue-200 mb-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <div className="w-0.5 h-12 bg-blue-300"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Origem</p>
                  <p className="text-blue-900 font-semibold">{pickupAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Destino</p>
                  <p className="text-blue-900 font-semibold">{dropoffAddress}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-6 pt-4 border-t border-blue-100">
              <div>
                <p className="text-sm text-blue-600">Distância</p>
                <p className="text-lg font-bold text-blue-900">{estimatedDistance} km</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Tempo estimado</p>
                <p className="text-lg font-bold text-blue-900">{estimatedDuration} min</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Price Form */}
        <form onSubmit={handleSubmit}>
          <Card className="p-6 bg-white border-blue-200 mb-6">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Quanto você quer pagar?</h2>
            <div className="mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Preço sugerido</span>
                  <span className="text-2xl font-bold text-blue-600">R$ {suggestedPrice.toFixed(2)}</span>
                </div>
              </div>
              <Label htmlFor="price" className="text-blue-900 mb-2 block">Sua oferta</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-700 font-semibold text-xl">R$</span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={priceOffer}
                  onChange={(e) => setPriceOffer(e.target.value)}
                  required
                  className="pl-12 text-2xl font-bold border-blue-200 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>
              <p className="text-sm text-blue-600 mt-2">
                Motoristas verão sua oferta e poderão fazer contra-ofertas
              </p>
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="p-6 bg-white border-blue-200 mb-6">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Forma de pagamento</h2>
            <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg border border-blue-200 mb-2">
                <RadioGroupItem value="cash" id="cash" className="border-blue-600 text-blue-600" />
                <Label htmlFor="cash" className="flex-1 cursor-pointer text-blue-900">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Dinheiro</span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg border border-blue-200 mb-2">
                <RadioGroupItem value="pix" id="pix" className="border-blue-600 text-blue-600" />
                <Label htmlFor="pix" className="flex-1 cursor-pointer text-blue-900">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.94 8.3a5.73 5.73 0 0 0 0 8.1l2.45 2.44c.85.86 2.23.86 3.09 0l2.54-2.54 2.54 2.54c.85.86 2.23.86 3.08 0l2.45-2.45a5.73 5.73 0 0 0 0-8.1l-2.45-2.44a2.18 2.18 0 0 0-3.08 0l-2.54 2.54-2.54-2.54a2.18 2.18 0 0 0-3.09 0zm13.11 1.42-2.45-2.45 2.45 2.45a3.55 3.55 0 0 1 0 5.02l-2.45 2.45 2.45-2.45a3.55 3.55 0 0 0 0-5.02z"/>
                    </svg>
                    <span>PIX</span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <RadioGroupItem value="credit_card" id="credit" className="border-blue-600 text-blue-600" />
                <Label htmlFor="credit" className="flex-1 cursor-pointer text-blue-900">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Cartão de Crédito</span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </Card>

          {/* Notes */}
          <Card className="p-6 bg-white border-blue-200 mb-6">
            <Label htmlFor="notes" className="text-blue-900 mb-2 block">Observações (opcional)</Label>
            <Input
              id="notes"
              placeholder="Ex: Tenho bagagem, preciso de ar-condicionado..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-blue-200 focus:border-blue-600 focus:ring-blue-600"
            />
          </Card>

          <Button 
            type="submit"
            disabled={loading || !priceOffer}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
          >
            {loading ? 'Criando solicitação...' : 'Solicitar Corrida'}
          </Button>
        </form>
      </main>
    </div>
  )
}

export default function RequestRidePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-blue-600 text-lg">Carregando...</div>
      </div>
    }>
      <RequestRideContent />
    </Suspense>
  )
}
