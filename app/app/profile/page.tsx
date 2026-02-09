'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Profile, DriverProfile } from '@/lib/types/database'
import { BottomNavigation } from '@/components/bottom-navigation'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(profileData)
        setFullName(profileData?.full_name || '')
        setPhone(profileData?.phone || '')

        if (profileData?.user_type === 'driver' || profileData?.user_type === 'both') {
          const { data: driverData } = await supabase
            .from('driver_profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          setDriverProfile(driverData)
        }
      }
      setLoading(false)
    }

    loadProfile()
  }, [supabase])

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone
        })
        .eq('id', user.id)
      
      setEditing(false)
      window.location.reload()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/onboarding/splash')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="h-dvh bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-[2.5px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-dvh overflow-y-auto bg-neutral-50 pb-24 ios-scroll">
      {/* Header - iOS style */}
      <header className="bg-white/95 ios-blur border-b border-neutral-200/60 sticky top-0 z-30">
        <div className="px-5 pt-safe-offset-4 pb-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full ios-press"
            >
              <svg className="w-[22px] h-[22px] text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-[20px] font-bold text-neutral-900 tracking-tight">Perfil</h1>
          </div>
        </div>
      </header>

      <main className="px-5 py-5 max-w-2xl mx-auto">
        {/* Profile Header - iOS card */}
        <div className="bg-white rounded-[20px] p-6 mb-5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <Avatar className="w-24 h-24 mx-auto mb-4 ring-[3px] ring-blue-500/20 ring-offset-2">
            <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-blue-50 text-blue-500 text-3xl font-bold">
              {profile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-[24px] font-bold text-neutral-900 tracking-tight mb-1">{profile?.full_name}</h2>
          <p className="text-[15px] text-neutral-500 mb-5">{profile?.phone}</p>
          <div className="flex gap-8 justify-center">
            <div>
              <div className="text-[28px] font-bold text-blue-500 tracking-tight">{profile?.rating?.toFixed(1) || '5.0'}</div>
              <div className="text-[13px] font-medium text-neutral-500">Avaliacao</div>
            </div>
            <div className="w-px bg-neutral-100" />
            <div>
              <div className="text-[28px] font-bold text-blue-500 tracking-tight">{profile?.total_rides || 0}</div>
              <div className="text-[13px] font-medium text-neutral-500">Corridas</div>
            </div>
          </div>
        </div>

        {/* Profile Tabs - iOS segmented control style */}
        <Tabs defaultValue="info" className="mb-5">
          <TabsList className="grid w-full grid-cols-2 bg-neutral-100 rounded-[14px] h-[40px] p-1">
            <TabsTrigger value="info" className="rounded-[10px] text-[14px] font-semibold data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm">
              Informacoes
            </TabsTrigger>
            <TabsTrigger value="vehicle" className="rounded-[10px] text-[14px] font-semibold data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm">
              Veiculo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wide">Nome Completo</Label>
                    <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 h-[48px] rounded-[14px] border-neutral-200 text-[17px]" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wide">Telefone</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 h-[48px] rounded-[14px] border-neutral-200 text-[17px]" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={handleSave} className="flex-1 h-[48px] rounded-[14px] bg-blue-500 text-white font-semibold text-[17px] ios-press">Salvar</button>
                    <button type="button" onClick={() => setEditing(false)} className="flex-1 h-[48px] rounded-[14px] bg-neutral-100 text-neutral-700 font-semibold text-[17px] ios-press">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wide">Nome Completo</p>
                    <p className="text-[17px] font-medium text-neutral-900 mt-0.5">{profile?.full_name}</p>
                  </div>
                  <div className="h-px bg-neutral-100" />
                  <div>
                    <p className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wide">Telefone</p>
                    <p className="text-[17px] font-medium text-neutral-900 mt-0.5">{profile?.phone}</p>
                  </div>
                  <div className="h-px bg-neutral-100" />
                  <div>
                    <p className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wide">Tipo de Conta</p>
                    <p className="text-[17px] font-medium text-neutral-900 capitalize mt-0.5">{profile?.user_type}</p>
                  </div>
                  <button type="button" onClick={() => setEditing(true)} className="w-full h-[48px] rounded-[14px] bg-blue-500 text-white font-semibold text-[17px] mt-2 ios-press">Editar Perfil</button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="vehicle">
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              {driverProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Marca', value: driverProfile.vehicle_brand },
                      { label: 'Modelo', value: driverProfile.vehicle_model },
                      { label: 'Ano', value: driverProfile.vehicle_year },
                      { label: 'Cor', value: driverProfile.vehicle_color },
                      { label: 'Placa', value: driverProfile.vehicle_plate, mono: true },
                      { label: 'Tipo', value: driverProfile.vehicle_type, capitalize: true },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wide">{item.label}</p>
                        <p className={`text-[17px] font-medium text-neutral-900 mt-0.5 ${item.mono ? 'font-mono uppercase' : ''} ${item.capitalize ? 'capitalize' : ''}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-px bg-neutral-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-semibold text-neutral-900">Verificacao</span>
                    {driverProfile.is_verified ? (
                      <span className="text-green-500 font-semibold text-[15px] flex items-center gap-1.5">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Verificado
                      </span>
                    ) : (
                      <span className="text-amber-500 font-semibold text-[15px]">Pendente</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-14 h-14 text-neutral-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  <p className="text-[17px] font-medium text-neutral-900 mb-1">Sem veiculo cadastrado</p>
                  <p className="text-[15px] text-neutral-500">Apenas motoristas precisam cadastrar veiculo</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Settings - iOS grouped list style */}
        <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-5">
          <p className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wide px-5 pt-4 pb-2">Configuracoes</p>
          {[
            { icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', label: 'Notificacoes' },
            { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', label: 'Formas de Pagamento' },
            { icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Ajuda e Suporte' },
          ].map((item, i) => (
            <button key={item.label} type="button" className={`w-full flex items-center gap-4 px-5 py-3.5 ios-press ${i < 2 ? 'border-b border-neutral-100' : ''}`}>
              <svg className="w-[22px] h-[22px] text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="flex-1 text-left text-[17px] text-neutral-900">{item.label}</span>
              <svg className="w-5 h-5 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Logout - iOS style */}
        <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <button type="button" onClick={handleLogout} className="w-full flex items-center justify-center gap-2 h-[52px] text-red-500 text-[17px] font-medium ios-press">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
