'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface EmergencyContact {
  id: string
  name: string
  phone: string
  relationship: string
}

export default function EmergencyContactsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '', relationship: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/onboarding/splash')
        return
      }

      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error('[v0] Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      alert('Preencha nome e telefone')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: user.id,
          name: formData.name,
          phone: formData.phone,
          relationship: formData.relationship || null
        })
        .select()
        .single()

      if (error) throw error

      setContacts([...contacts, data])
      setFormData({ name: '', phone: '', relationship: '' })
      setShowForm(false)
    } catch (error) {
      console.error('[v0] Error saving contact:', error)
      alert('Erro ao salvar contato')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (contactId: string) => {
    if (!confirm('Deseja remover este contato?')) return

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId)

      if (error) throw error

      setContacts(contacts.filter(c => c.id !== contactId))
    } catch (error) {
      console.error('[v0] Error deleting contact:', error)
      alert('Erro ao deletar contato')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="text-blue-700 hover:bg-blue-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <h1 className="text-xl font-bold text-blue-900">Contatos de Emergência</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {/* Info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-800 leading-relaxed">
              Estes contatos serão notificados em caso de emergência durante uma corrida.
            </p>
          </div>
        </Card>

        {/* Lista de Contatos */}
        {contacts.map(contact => (
          <Card key={contact.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-blue-900">{contact.name}</p>
                <p className="text-sm text-blue-600">{contact.phone}</p>
                <p className="text-xs text-gray-500">{contact.relationship}</p>
              </div>
              <Button
                onClick={() => handleDelete(contact.id)}
                variant="ghost"
                size="icon"
                className="text-red-600 hover:bg-red-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          </Card>
        ))}

        {contacts.length === 0 && !showForm && (
          <Card className="p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 mb-4">Nenhum contato cadastrado</p>
          </Card>
        )}

        {/* Formulário */}
        {showForm && (
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-blue-900">Novo Contato</h3>
            <Input
              placeholder="Nome completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              placeholder="Telefone com DDD"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              placeholder="Relacionamento (ex: Mãe, Amigo)"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        {/* Botão Adicionar */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Contato
          </Button>
        )}
      </main>
    </div>
  )
}
