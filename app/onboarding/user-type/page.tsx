'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function UserTypePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSelectType = async (type: 'passenger' | 'driver') => {
    setLoading(true)
    try {
      const signupData = sessionStorage.getItem('signupData')
      const data = signupData ? JSON.parse(signupData) : { name: 'Usuario', email: '', phone: '' }
      
      const supabase = createClient()
      const email = data.email || `user${Date.now()}@example.com`
      const password = 'Uppi@' + Math.random().toString(36).slice(-8) + '1!'

      // 1. Salvar senha no localStorage para persistir entre sessoes
      localStorage.setItem('uppi_credentials', JSON.stringify({ email, password }))

      // 2. Tentar criar conta no Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: data.name,
            phone: data.phone,
            user_type: type,
          },
        },
      })

      // 3. Se nao tem sessao (confirmacao email ativada), fazer login imediatamente
      if (!authData?.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) {
          console.log('[v0] SignIn error after signup:', signInError.message)
        }
      }

      // 4. Salvar dados locais para a home funcionar mesmo sem auth
      sessionStorage.setItem('userProfile', JSON.stringify({
        name: data.name,
        phone: data.phone,
        user_type: type,
      }))
      localStorage.setItem('uppi_profile', JSON.stringify({
        name: data.name,
        phone: data.phone,
        user_type: type,
      }))

      // 5. Limpar dados de signup
      sessionStorage.removeItem('signupData')

      // 6. Setar cookie para o middleware permitir acesso ao /app
      document.cookie = 'onboarding_done=true; path=/; max-age=31536000'

      // 7. Redirecionar para home
      router.push('/app/home')
      
    } catch (error) {
      console.log('[v0] Auth error:', error)
      // Mesmo com erro, setar cookie e ir pra home
      document.cookie = 'onboarding_done=true; path=/; max-age=31536000'
      const signupData = sessionStorage.getItem('signupData')
      const data = signupData ? JSON.parse(signupData) : { name: 'Usuario', phone: '' }
      sessionStorage.setItem('userProfile', JSON.stringify({
        name: data.name,
        phone: data.phone || '',
        user_type: type,
      }))
      localStorage.setItem('uppi_profile', JSON.stringify({
        name: data.name,
        phone: data.phone || '',
        user_type: type,
      }))
      router.push('/app/home')
    }
  }

  return (
    <div className="h-dvh bg-neutral-950 flex flex-col overflow-hidden">
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
      <div className="flex-1 px-6 pb-8 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
          <div className="space-y-3 mb-12 text-center">
            <h1 className="text-3xl font-bold text-white text-balance">
              Você é passageiro ou motorista?
            </h1>
            <p className="text-gray-400 text-sm">
              Você pode mudar o modo depois
            </p>
          </div>

          {/* Illustration */}
          <div className="mb-12 flex justify-center">
            <svg viewBox="0 0 400 300" className="w-80 h-60">
              {/* Map tiles background */}
              <rect x="50" y="60" width="100" height="120" fill="#0066FF" opacity="0.8" transform="rotate(-12 100 120)" />
              <rect x="130" y="50" width="100" height="120" fill="#0066FF" opacity="0.8" transform="rotate(-5 180 110)" />
              <rect x="200" y="80" width="100" height="120" fill="#0066FF" opacity="0.8" transform="rotate(8 250 140)" />
              
              {/* Two people illustration */}
              <g transform="translate(120, 140)">
                {/* Person 1 - Passenger */}
                <ellipse cx="0" cy="40" rx="25" ry="35" fill="#ffffff" />
                <circle cx="0" cy="0" r="20" fill="#ffffff" />
                <path d="M -12,-3 Q -12,-10 -5,-12 Q 0,-13 5,-12 Q 12,-10 12,-3" fill="#1a1a1a" />
                <circle cx="-6" cy="0" r="2" fill="#1a1a1a" />
                <circle cx="6" cy="0" r="2" fill="#1a1a1a" />
                <path d="M -4,6 Q 0,8 4,6" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
                
                {/* Phone in hand */}
                <rect x="-8" y="50" width="16" height="25" fill="#1a1a1a" rx="3" />
                <circle cx="0" cy="58" r="1.5" fill="#0066FF" />
              </g>
              
              <g transform="translate(240, 140)">
                {/* Person 2 - Driver */}
                <ellipse cx="0" cy="40" rx="25" ry="35" fill="#ffffff" />
                <circle cx="0" cy="0" r="20" fill="#ffffff" />
                <path d="M -12,-3 Q -12,-10 -5,-12 Q 0,-13 5,-12 Q 12,-10 12,-3" fill="#1a1a1a" />
                <circle cx="-6" cy="0" r="2" fill="#1a1a1a" />
                <circle cx="6" cy="0" r="2" fill="#1a1a1a" />
                <path d="M -4,6 Q 0,8 4,6" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
                
                {/* Keys in hand */}
                <g transform="translate(8, 55)">
                  <circle cx="0" cy="0" r="4" fill="#0066FF" />
                  <rect x="-1" y="4" width="2" height="8" fill="#0066FF" />
                  <rect x="-3" y="10" width="2" height="3" fill="#0066FF" />
                  <rect x="1" y="10" width="2" height="3" fill="#0066FF" />
                </g>
              </g>
              
              {/* Thumbs up between them */}
              <g transform="translate(180, 170)">
                <path d="M -10,0 L -10,-15 L -5,-20 L 0,-20 L 0,-10 L 5,-5 L 5,5 L -10,5 Z" fill="#0066FF" />
                <path d="M 10,0 L 10,-15 L 5,-20 L 0,-20 L 0,-10 L -5,-5 L -5,5 L 10,5 Z" fill="#0066FF" transform="scale(-1, 1)" />
              </g>
            </svg>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSelectType('passenger')}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-16 text-lg font-semibold rounded-xl disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Eu sou passageiro'
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectType('driver')}
              disabled={loading}
              className="w-full bg-neutral-700 hover:bg-neutral-600 text-neutral-200 h-16 text-lg font-semibold rounded-xl disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-neutral-200 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Eu sou motorista'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
