'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ReferralClientProps {
  referralCode: string
  totalReferrals: number
  referralBonus: number
}

export function ReferralClient({ referralCode, totalReferrals, referralBonus }: ReferralClientProps) {
  return (
    <>
      {/* Hero Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Ganhe R$ 10 por amigo</h2>
          <p className="text-blue-100 mb-4">
            Indique amigos e ganhe R$ 10 para cada um que completar a primeira viagem
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
            <div className="text-sm text-blue-100 mb-2">Seu código de indicação</div>
            <div className="text-3xl font-bold tracking-wider mb-3">{referralCode}</div>
            <Button 
              className="bg-white text-blue-600 hover:bg-blue-50 w-full"
              onClick={() => {
                navigator.clipboard.writeText(referralCode)
                alert('Código copiado!')
              }}
            >
              Copiar Código
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 border-blue-100 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">{totalReferrals}</div>
          <div className="text-sm text-gray-600">Amigos Indicados</div>
        </Card>
        <Card className="p-4 border-blue-100 text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">R$ {referralBonus.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Ganhos Totais</div>
        </Card>
      </div>

      {/* How it works */}
      <Card className="p-6 border-blue-100">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Como funciona?</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold">
              1
            </div>
            <div>
              <div className="font-medium text-blue-900 mb-1">Compartilhe seu código</div>
              <div className="text-sm text-gray-600">
                Envie seu código de indicação para amigos e familiares
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold">
              2
            </div>
            <div>
              <div className="font-medium text-blue-900 mb-1">Eles se cadastram</div>
              <div className="text-sm text-gray-600">
                Seu amigo usa o código ao criar a conta no Uppi
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold">
              3
            </div>
            <div>
              <div className="font-medium text-blue-900 mb-1">Primeira viagem</div>
              <div className="text-sm text-gray-600">
                Quando ele completar a primeira corrida, vocês ganham!
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold">
              4
            </div>
            <div>
              <div className="font-medium text-blue-900 mb-1">Receba seu bônus</div>
              <div className="text-sm text-gray-600">
                R$ 10 são creditados na sua carteira automaticamente
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Share buttons */}
      <Card className="p-6 border-blue-100">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Compartilhar</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              const text = `Use o código ${referralCode} no app Uppi e ganhe R$ 10 na primeira corrida!`
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </Button>

          <Button 
            variant="outline"
            className="border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Indique Uppi',
                  text: `Use o código ${referralCode} no app Uppi e ganhe R$ 10 na primeira corrida!`
                })
              }
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Mais Opções
          </Button>
        </div>
      </Card>
    </>
  )
}
