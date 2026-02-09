'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Database, AlertCircle, CheckCircle } from 'lucide-react'

export function DatabaseSetupChecker() {
  const [needsSetup, setNeedsSetup] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  async function checkDatabaseStatus() {
    try {
      const response = await fetch('/api/setup-database')
      const data = await response.json()
      setNeedsSetup(data.needsSetup)
    } catch (err) {
      console.error('[v0] Failed to check database status:', err)
      setNeedsSetup(true)
    } finally {
      setIsChecking(false)
    }
  }

  async function setupDatabase() {
    setIsSettingUp(true)
    setError(null)

    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
      })
      
      const data = await response.json()

      if (data.success) {
        setSetupComplete(true)
        setNeedsSetup(false)
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setError(data.message || 'Failed to setup database')
      }
    } catch (err) {
      console.error('[v0] Setup failed:', err)
      setError('An error occurred. Please try again or setup manually.')
    } finally {
      setIsSettingUp(false)
    }
  }

  if (isChecking) {
    return null
  }

  if (!needsSetup) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="mx-4 max-w-md p-6 space-y-4">
        {setupComplete ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Banco Configurado!</h2>
                <p className="text-sm text-muted-foreground">
                  Recarregando aplicativo...
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                {error ? (
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                ) : (
                  <Database className="h-6 w-6 text-orange-600" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {error ? 'Erro na Configuração' : 'Banco de Dados Não Configurado'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {error ? 'Tente novamente ou configure manualmente' : 'Configure agora em segundos'}
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Este projeto foi duplicado e precisa configurar o banco de dados Supabase. 
                Clique no botão abaixo para criar automaticamente todas as tabelas necessárias.
              </p>
              
              <div className="rounded-lg bg-muted p-3 text-xs space-y-1">
                <p className="font-medium">Serão criadas as seguintes tabelas:</p>
                <ul className="list-disc list-inside text-muted-foreground">
                  <li>Perfis de usuários e motoristas</li>
                  <li>Corridas e ofertas de preço</li>
                  <li>Avaliações e favoritos</li>
                  <li>Pagamentos e notificações</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={setupDatabase}
                disabled={isSettingUp}
                className="flex-1"
                size="lg"
              >
                {isSettingUp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Configurando...
                  </>
                ) : (
                  'Configurar Banco Agora'
                )}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Ou configure manualmente copiando o script de{' '}
              <code className="rounded bg-muted px-1 py-0.5">scripts/setup-database.sql</code>
            </p>
          </>
        )}
      </Card>
    </div>
  )
}
