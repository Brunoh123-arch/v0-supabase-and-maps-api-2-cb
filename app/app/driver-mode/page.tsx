'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DriverModePage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-dvh overflow-hidden bg-neutral-950 flex flex-col">
      {/* Header */}
      <div className="p-4">
        <button
          type="button"
          className="w-12 h-12 rounded-full flex items-center justify-center"
          onClick={() => router.back()}
        >
          <svg className="w-6 h-6 text-neutral-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Green Banner */}
      <div className="mx-4 mt-4 bg-green-700 rounded-2xl p-6">
        <h1 className="text-white text-2xl font-bold mb-4">Ganhe dinheiro conosco</h1>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white text-base">Horario flexivel</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white text-base">Seus precos</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white text-base font-bold flex-shrink-0 w-5 text-center">%</span>
            <span className="text-white text-base">Pagamentos de servico acessiveis</span>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 px-4 mt-8 space-y-4">
        {/* Motorista Card */}
        <button
          type="button"
          className="w-full bg-neutral-800 rounded-2xl p-5 flex items-center gap-5"
          onClick={() => router.push('/app/driver/documents')}
        >
          <div className="w-20 h-14 bg-neutral-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-12 h-8 text-neutral-400" fill="none" viewBox="0 0 48 32" stroke="currentColor">
              <rect x="2" y="10" width="44" height="16" rx="4" strokeWidth="2" />
              <circle cx="12" cy="22" r="3" strokeWidth="2" />
              <circle cx="36" cy="22" r="3" strokeWidth="2" />
              <path d="M10 10V8a4 4 0 014-4h20a4 4 0 014 4v2" strokeWidth="2" />
            </svg>
          </div>
          <span className="text-neutral-200 text-lg font-medium">Motorista</span>
        </button>

        {/* Entregador Card */}
        <button
          type="button"
          className="w-full bg-neutral-800 rounded-2xl p-5 flex items-center gap-5"
          onClick={() => router.push('/app/driver/documents')}
        >
          <div className="w-20 h-14 bg-neutral-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="text-neutral-200 text-lg font-medium">Entregador</span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 pb-8 space-y-4">
        <button
          type="button"
          className="w-full py-4 rounded-xl bg-neutral-800 text-neutral-200 font-semibold text-base"
          onClick={() => router.push('/onboarding/signup')}
        >
          Ja tenho uma conta
        </button>
        <button
          type="button"
          className="w-full py-3 text-neutral-400 font-medium text-base"
          onClick={() => router.push('/app/home')}
        >
          Ir para o modo passageiro
        </button>
      </div>
    </div>
  )
}
