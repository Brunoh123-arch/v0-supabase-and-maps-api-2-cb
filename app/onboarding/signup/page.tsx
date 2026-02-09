'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: 'Usuário Teste',
    email: `teste${Date.now()}@example.com`,
    phone: '(11) 99999-9999',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Store signup data temporarily
      sessionStorage.setItem('signupData', JSON.stringify(formData))
      
      // Navigate to SMS verification
      router.push('/onboarding/verify-sms')
    } catch {
      // erro ao salvar dados
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-dvh bg-neutral-950 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-6">
        <button 
          onClick={() => router.back()}
          className="text-white"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8">
        <div className="max-w-md mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-white mb-8">
            Confirme suas informações
          </h1>

          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-neutral-800">
                <AvatarImage src="/images/default-avatar.jpg" />
                <AvatarFallback className="bg-neutral-800 text-white text-2xl">
                  {formData.name ? formData.name[0].toUpperCase() : '?'}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-4 border-neutral-950">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-400 text-sm">
                Nome
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-neutral-800 border-neutral-700 text-white h-14 rounded-xl"
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-400 text-sm">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-neutral-800 border-neutral-700 text-white h-14 rounded-xl"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-400 text-sm">
                Telefone
              </Label>
              <div className="flex gap-3">
                <div className="w-20">
                  <Input
                    value="+55"
                    disabled
                    className="bg-neutral-800 border-neutral-700 text-white h-14 rounded-xl text-center"
                  />
                </div>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="flex-1 bg-neutral-800 border-neutral-700 text-white h-14 rounded-xl"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-base font-semibold rounded-xl mt-8"
            >
              {loading ? 'Enviando...' : 'Enviar código'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
