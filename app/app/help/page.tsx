'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BottomNavigation } from '@/components/bottom-navigation'

export default function HelpPage() {
  const router = useRouter()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)

  const faqs = [
    {
      question: 'Como funciona a negociação de preço?',
      answer: 'Você informa seu destino e o preço que deseja pagar. Motoristas próximos recebem sua solicitação e podem aceitar seu preço ou fazer uma contra-oferta. Você escolhe a melhor opção.',
    },
    {
      question: 'Como sei se o motorista é confiável?',
      answer: 'Todos os motoristas passam por verificação de documentos. Você pode ver a avaliação, número de corridas e comentários de outros passageiros antes de aceitar.',
    },
    {
      question: 'Posso cancelar uma corrida?',
      answer: 'Sim, você pode cancelar antes do motorista chegar. Cancelamentos após o motorista iniciar o deslocamento podem ter taxa de cancelamento.',
    },
    {
      question: 'Como funciona o pagamento?',
      answer: 'Você pode pagar em dinheiro, cartão de crédito/débito ou PIX. O pagamento é processado apenas após a conclusão da viagem.',
    },
    {
      question: 'O que fazer em caso de emergência?',
      answer: 'Use o botão SOS dentro do app durante a corrida. Suas informações e localização serão compartilhadas com nosso suporte e contatos de emergência.',
    },
    {
      question: 'Como adicionar um método de pagamento?',
      answer: 'Vá em Perfil > Pagamentos e adicione seu cartão ou configure o PIX. Todos os dados são criptografados e seguros.',
    },
  ]

  const quickActions = [
    { iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', title: 'Minhas Corridas', path: '/app/history' },
    { iconPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', title: 'Pagamentos', path: '/app/profile' },
    { iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', title: 'Favoritos', path: '/app/favorites' },
    { iconPath: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', title: 'Notificacoes', path: '/app/notifications' },
  ]

  return (
    <div className="h-dvh overflow-y-auto bg-neutral-50 pb-24 ios-scroll">
      {/* Header - iOS style */}
      <header className="bg-white/95 ios-blur border-b border-neutral-200/60 sticky top-0 z-30">
        <div className="px-5 pt-safe-offset-4 pb-3">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full ios-press">
              <svg className="w-[22px] h-[22px] text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-[20px] font-bold text-neutral-900 tracking-tight">Ajuda e Suporte</h1>
          </div>
        </div>
      </header>

      <main className="px-5 py-5 max-w-2xl mx-auto space-y-6">
        {/* Search - iOS style */}
        <div className="relative">
          <svg className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input 
            placeholder="Buscar ajuda..." 
            className="pl-12 h-[48px] rounded-[16px] bg-white border-neutral-200 text-[17px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          />
        </div>

        {/* Quick Actions - iOS grid */}
        <div>
          <p className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wide mb-2 px-1">Acesso Rapido</p>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                type="button"
                onClick={() => router.push(action.path)}
                className="bg-white rounded-[18px] p-4 text-left shadow-[0_2px_8px_rgba(0,0,0,0.04)] ios-press"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-[14px] flex items-center justify-center mb-3">
                  <svg className="w-[22px] h-[22px] text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={action.iconPath} />
                  </svg>
                </div>
                <p className="text-[15px] font-semibold text-neutral-900">{action.title}</p>
              </button>
            ))}
          </div>
        </div>

        {/* FAQs - iOS grouped list */}
        <div>
          <p className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wide mb-2 px-1">Perguntas Frequentes</p>
          <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            {faqs.map((faq, index) => (
              <div key={index} className={index < faqs.length - 1 ? 'border-b border-neutral-100' : ''}>
                <button
                  type="button"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between ios-press"
                >
                  <span className="text-[15px] font-semibold text-neutral-900 pr-4">{faq.question}</span>
                  <svg 
                    className={`w-5 h-5 text-neutral-400 flex-shrink-0 transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === index && (
                  <div className="px-5 pb-4 text-[15px] text-neutral-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support - iOS style */}
        <div className="bg-white rounded-[20px] p-6 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="w-16 h-16 bg-blue-50 rounded-[22px] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-[20px] font-bold text-neutral-900 tracking-tight mb-1.5">Nao encontrou o que procura?</h3>
          <p className="text-[15px] text-neutral-500 mb-5">Entre em contato com nossa equipe</p>

          {!showContactForm ? (
            <button
              type="button"
              onClick={() => setShowContactForm(true)}
              className="w-full h-[52px] rounded-[16px] bg-blue-500 text-white font-semibold text-[17px] ios-press"
            >
              Falar com Suporte
            </button>
          ) : (
            <div className="space-y-4 text-left">
              <div>
                <label className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wide mb-1.5 block">Assunto</label>
                <Input placeholder="Descreva brevemente o problema" className="h-[48px] rounded-[14px] border-neutral-200 text-[17px]" />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wide mb-1.5 block">Mensagem</label>
                <Textarea 
                  placeholder="Descreva seu problema em detalhes..."
                  rows={4}
                  className="rounded-[14px] border-neutral-200 text-[17px]"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowContactForm(false)} className="flex-1 h-[48px] rounded-[14px] bg-neutral-100 text-neutral-700 font-semibold text-[17px] ios-press">
                  Cancelar
                </button>
                <button type="button" className="flex-1 h-[48px] rounded-[14px] bg-blue-500 text-white font-semibold text-[17px] ios-press">
                  Enviar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Emergency - iOS style */}
        <div className="bg-red-50 rounded-[20px] p-5">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 bg-red-500 rounded-[14px] flex items-center justify-center flex-shrink-0">
              <svg className="w-[22px] h-[22px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-red-900 mb-1">Emergencia?</h3>
              <p className="text-[13px] text-red-800 leading-relaxed">Se voce esta em perigo, ligue imediatamente para a policia (190) ou use o botao SOS durante uma corrida.</p>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
