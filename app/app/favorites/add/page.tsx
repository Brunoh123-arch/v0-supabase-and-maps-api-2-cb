'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function AddFavoritePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [locationName, setLocationName] = useState('')
  const [address, setAddress] = useState('')
  const [locationType, setLocationType] = useState<'home' | 'work' | 'other'>('home')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/onboarding/splash')
        return
      }

      // In a real app, you would geocode the address to get coordinates
      // For now, using placeholder coordinates
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          location_name: locationName,
          address: address,
          latitude: -23.5505,
          longitude: -46.6333,
          location_type: locationType
        })

      if (error) throw error

      router.push('/app/favorites')
    } catch (error) {
      console.error('[v0] Error adding favorite:', error)
      alert('Erro ao adicionar favorito')
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-xl font-bold text-blue-900">Adicionar Favorito</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          {/* Location Type */}
          <Card className="p-6 bg-white border-blue-200 mb-6">
            <Label className="text-blue-900 mb-4 block font-semibold">Tipo de Local</Label>
            <RadioGroup value={locationType} onValueChange={(value) => setLocationType(value as 'home' | 'work' | 'other')}>
              <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg border border-blue-200 mb-3">
                <RadioGroupItem value="home" id="home" className="border-blue-600 text-blue-600" />
                <Label htmlFor="home" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-blue-900 font-semibold">Casa</p>
                      <p className="text-xs text-blue-600">Seu endereço residencial</p>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg border border-blue-200 mb-3">
                <RadioGroupItem value="work" id="work" className="border-blue-600 text-blue-600" />
                <Label htmlFor="work" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-blue-900 font-semibold">Trabalho</p>
                      <p className="text-xs text-blue-600">Seu local de trabalho</p>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <RadioGroupItem value="other" id="other" className="border-blue-600 text-blue-600" />
                <Label htmlFor="other" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-blue-900 font-semibold">Outro</p>
                      <p className="text-xs text-blue-600">Qualquer outro local</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </Card>

          {/* Location Details */}
          <Card className="p-6 bg-white border-blue-200 mb-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-blue-900 mb-2 block">
                  Nome do Local
                </Label>
                <Input
                  id="name"
                  placeholder={
                    locationType === 'home' ? 'Ex: Minha Casa' :
                    locationType === 'work' ? 'Ex: Escritório' :
                    'Ex: Academia, Mercado...'
                  }
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  required
                  className="border-blue-200 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-blue-900 mb-2 block">
                  Endereço Completo
                </Label>
                <Input
                  id="address"
                  placeholder="Rua, número, bairro, cidade..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="border-blue-200 focus:border-blue-600 focus:ring-blue-600"
                />
                <p className="text-xs text-blue-600 mt-2">
                  Digite o endereço completo para melhores resultados
                </p>
              </div>
            </div>
          </Card>

          <Button 
            type="submit"
            disabled={loading || !locationName || !address}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
          >
            {loading ? 'Salvando...' : 'Salvar Favorito'}
          </Button>
        </form>
      </main>
    </div>
  )
}
