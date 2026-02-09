'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function DriverRegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    vehicle_type: 'car',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_color: '',
    vehicle_plate: '',
    vehicle_year: '',
    license_number: '',
    license_category: 'B'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('driver_profiles')
        .insert({
          id: user.id,
          ...formData,
          status: 'pending',
          vehicle_year: parseInt(formData.vehicle_year)
        })

      if (error) throw error

      // Update user type in profiles
      await supabase
        .from('profiles')
        .update({ user_type: 'driver' })
        .eq('id', user.id)

      alert('Cadastro enviado! Aguarde a aprovação.')
      router.push('/app/profile')
    } catch (error) {
      console.error('[v0] Driver registration error:', error)
      alert('Erro ao enviar cadastro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pb-20">
      <header className="bg-white border-b border-blue-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
              className="text-blue-700"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <h1 className="text-xl font-bold text-blue-900">Cadastro de Motorista</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 bg-white border-blue-200">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Informações do Veículo</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-blue-900">Tipo de Veículo</Label>
                <select
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  className="w-full mt-1.5 px-4 py-2 border border-blue-200 rounded-lg focus:border-blue-600 focus:ring-blue-600"
                  required
                >
                  <option value="car">Carro</option>
                  <option value="motorcycle">Moto</option>
                  <option value="van">Van</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-blue-900">Marca</Label>
                  <Input
                    value={formData.vehicle_brand}
                    onChange={(e) => setFormData({ ...formData, vehicle_brand: e.target.value })}
                    placeholder="Ex: Toyota"
                    className="border-blue-200"
                    required
                  />
                </div>
                <div>
                  <Label className="text-blue-900">Modelo</Label>
                  <Input
                    value={formData.vehicle_model}
                    onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                    placeholder="Ex: Corolla"
                    className="border-blue-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-blue-900">Cor</Label>
                  <Input
                    value={formData.vehicle_color}
                    onChange={(e) => setFormData({ ...formData, vehicle_color: e.target.value })}
                    placeholder="Ex: Preto"
                    className="border-blue-200"
                    required
                  />
                </div>
                <div>
                  <Label className="text-blue-900">Ano</Label>
                  <Input
                    type="number"
                    value={formData.vehicle_year}
                    onChange={(e) => setFormData({ ...formData, vehicle_year: e.target.value })}
                    placeholder="Ex: 2020"
                    className="border-blue-200"
                    min="1980"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-blue-900">Placa</Label>
                <Input
                  value={formData.vehicle_plate}
                  onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value.toUpperCase() })}
                  placeholder="ABC1D23"
                  className="border-blue-200 uppercase"
                  maxLength={7}
                  required
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-blue-200">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Carteira de Motorista</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-blue-900">Número da CNH</Label>
                <Input
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="Digite o número"
                  className="border-blue-200"
                  required
                />
              </div>

              <div>
                <Label className="text-blue-900">Categoria</Label>
                <select
                  value={formData.license_category}
                  onChange={(e) => setFormData({ ...formData, license_category: e.target.value })}
                  className="w-full mt-1.5 px-4 py-2 border border-blue-200 rounded-lg focus:border-blue-600 focus:ring-blue-600"
                  required
                >
                  <option value="A">A (Moto)</option>
                  <option value="B">B (Carro)</option>
                  <option value="AB">AB (Moto e Carro)</option>
                  <option value="C">C (Caminhão pequeno)</option>
                  <option value="D">D (Ônibus)</option>
                  <option value="E">E (Caminhão com reboque)</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">Seus documentos serão verificados</p>
                <p>O processo de aprovação pode levar até 48 horas. Você receberá uma notificação quando seu cadastro for aprovado.</p>
              </div>
            </div>
          </Card>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
          >
            {loading ? 'Enviando...' : 'Enviar Cadastro'}
          </Button>
        </form>
      </main>
    </div>
  )
}
