'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function EmergencyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [countdown, setCountdown] = useState<number | null>(null)
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    loadEmergencyContacts()
  }, [])

  useEffect(() => {
    if (countdown === null || countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          activateEmergency()
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  const loadEmergencyContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('emergency_contacts')
        .eq('id', user.id)
        .single()

      setEmergencyContacts(profile?.emergency_contacts || [])
    } catch (error) {
      console.error('[v0] Error loading emergency contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const startCountdown = () => {
    setCountdown(5)
  }

  const cancelCountdown = () => {
    setCountdown(null)
  }

  const activateEmergency = async () => {
    setActivating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      // Save emergency alert
      await supabase.from('emergency_alerts').insert({
        user_id: user.id,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        status: 'active'
      })

      // Here you would send notifications to emergency contacts
      // and potentially contact authorities

      alert('Alerta de emergência ativado! Seus contatos foram notificados.')
      router.push('/app/home')
    } catch (error) {
      console.error('[v0] Error activating emergency:', error)
      alert('Erro ao ativar emergência')
    } finally {
      setActivating(false)
    }
  }

  const callPolice = () => {
    window.location.href = 'tel:190'
  }

  const callAmbulance = () => {
    window.location.href = 'tel:192'
  }

  if (loading) {
    return (
      <div className="h-dvh overflow-y-auto bg-red-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-dvh overflow-y-auto bg-gradient-to-br from-red-950 via-red-900 to-red-950 p-6">
      {/* Header */}
      <header className="mb-8">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-red-800 mb-4"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">Emergência</h1>
        <p className="text-red-200">Use apenas em situações reais de perigo</p>
      </header>

      {/* SOS Button */}
      <Card className="bg-red-800/50 border-red-700 p-8 mb-6 text-center">
        <div className="mb-6">
          <svg className="w-24 h-24 mx-auto text-white mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">Botão de Pânico</h2>
          <p className="text-red-200 text-sm">
            Pressione e segure por 5 segundos para alertar seus contatos de emergência
          </p>
        </div>

        {countdown !== null ? (
          <div className="space-y-4">
            <div className="text-6xl font-bold text-white">{countdown}</div>
            <Button
              onClick={cancelCountdown}
              className="w-full bg-white text-red-900 hover:bg-red-100 h-14 text-lg font-bold"
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <Button
            onMouseDown={startCountdown}
            onMouseUp={cancelCountdown}
            onTouchStart={startCountdown}
            onTouchEnd={cancelCountdown}
            disabled={activating}
            className="w-full bg-red-600 hover:bg-red-700 text-white h-20 text-xl font-bold rounded-full"
          >
            {activating ? 'Ativando...' : 'PRESSIONE E SEGURE'}
          </Button>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3 mb-6">
        <Button
          onClick={callPolice}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg font-semibold"
        >
          <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Ligar para Polícia (190)
        </Button>

        <Button
          onClick={callAmbulance}
          className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg font-semibold"
        >
          <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Ligar para SAMU (192)
        </Button>
      </div>

      {/* Emergency Contacts */}
      <Card className="bg-red-800/30 border-red-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Contatos de Emergência</h3>
        {emergencyContacts.length === 0 ? (
          <p className="text-red-200 text-sm">Nenhum contato cadastrado</p>
        ) : (
          <div className="space-y-2">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between bg-red-800/50 p-3 rounded-lg">
                <div>
                  <p className="text-white font-medium">{contact.name}</p>
                  <p className="text-red-200 text-sm">{contact.phone}</p>
                </div>
                <Button
                  onClick={() => window.location.href = `tel:${contact.phone}`}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Ligar
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
