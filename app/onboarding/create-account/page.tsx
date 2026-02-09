'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CreateAccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    setLoading(true)
    
    try {
      console.log('[v0] Starting account creation...')
      
      // Get stored signup data
      const signupData = sessionStorage.getItem('signupData')
      const userType = sessionStorage.getItem('userType')
      
      console.log('[v0] Signup data:', signupData)
      console.log('[v0] User type:', userType)
      
      if (!signupData) {
        console.log('[v0] No signup data, redirecting to signup')
        router.push('/onboarding/signup')
        return
      }

      const data = JSON.parse(signupData)
      const supabase = createClient()

      // Create account with temporary password
      const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!'
      
      console.log('[v0] Creating auth user...')
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: tempPassword,
        options: {
          data: {
            full_name: data.name,
            phone: data.phone,
            user_type: userType || 'passenger',
          },
        },
      })

      if (signUpError) {
        console.error('[v0] SignUp error:', signUpError)
        throw signUpError
      }

      console.log('[v0] Auth user created:', authData.user?.id)

      // Clear session storage
      sessionStorage.removeItem('signupData')
      sessionStorage.removeItem('userType')

      console.log('[v0] Redirecting to app...')
      // Redirect to main app
      router.push('/app/home')
    } catch (error) {
      console.error('[v0] Account creation error:', error)
      alert('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    // Still create the account, just skip biometric setup
    await handleContinue()
  }

  return (
    <div className="h-dvh bg-neutral-950 flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Biometric Illustration */}
      <div className="mb-12">
        <svg viewBox="0 0 200 200" className="w-40 h-40">
          {/* Phone outline */}
          <rect x="60" y="30" width="80" height="140" rx="10" fill="#262626" />
          <rect x="65" y="35" width="70" height="130" rx="8" fill="#0066FF" />
          
          {/* Fingerprint */}
          <g transform="translate(100, 100)" opacity="0.9">
            <circle cx="0" cy="0" r="35" fill="none" stroke="#ffffff" strokeWidth="3" />
            <circle cx="0" cy="0" r="28" fill="none" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="21" fill="none" stroke="#ffffff" strokeWidth="2" />
            <circle cx="0" cy="0" r="14" fill="none" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="7" fill="none" stroke="#ffffff" strokeWidth="1" />
          </g>
          
          {/* Hand holding phone */}
          <g transform="translate(100, 180)">
            <ellipse cx="0" cy="0" rx="45" ry="15" fill="#ffffff" opacity="0.9" />
          </g>
        </svg>
      </div>

      {/* Content */}
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white text-balance">
            Login rápido e seguro com uma senha
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Não espere mais pelo código
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-4 text-left">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed flex-1">
              Entre com sua impressão digital, rosto, PIN ou padrão. Não coletamos nenhuma dessas informações
            </p>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed flex-1">
              A senha é mais segura, armazenada apenas na conta do seu dispositivo
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-8">
          <Button
            onClick={handleContinue}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-base font-semibold rounded-xl relative"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 absolute left-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Continuar
              </>
            )}
          </Button>

          <Button
            onClick={handleSkip}
            disabled={loading}
            variant="ghost"
            className="w-full text-gray-400 hover:text-white hover:bg-neutral-800 h-14 text-base rounded-xl"
          >
            Recusar
          </Button>
        </div>
      </div>
    </div>
  )
}
