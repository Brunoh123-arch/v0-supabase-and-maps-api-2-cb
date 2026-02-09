'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Ride, Profile } from '@/lib/types/database'

const RATING_TAGS = [
  'Pontual',
  'Educado',
  'Dirigiu bem',
  'Carro limpo',
  'Boa conversa',
  'Respeitoso',
  'Trajeto bom'
]

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [ride, setRide] = useState<Ride | null>(null)
  const [reviewedUser, setReviewedUser] = useState<Profile | null>(null)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/onboarding/splash')
        return
      }

      // Load current user profile
      const { data: currentUserData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setCurrentUser(currentUserData)

      // Load ride
      const { data: rideData } = await supabase
        .from('rides')
        .select('*')
        .eq('id', params.id)
        .single()
      
      setRide(rideData)

      // Determine who to review (driver or passenger)
      const reviewedUserId = rideData?.passenger_id === user.id 
        ? rideData?.driver_id 
        : rideData?.passenger_id

      if (reviewedUserId) {
        const { data: reviewedUserData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', reviewedUserId)
          .single()
        
        setReviewedUser(reviewedUserData)
      }

      // Check if already reviewed
      const { data: existingReview } = await supabase
        .from('ratings')
        .select('*')
        .eq('ride_id', params.id)
        .eq('reviewer_id', user.id)
        .single()

      if (existingReview) {
        router.push('/app/history')
        return
      }

      setLoading(false)
    }

    loadData()
  }, [params.id, supabase, router])

  const handleSubmit = async () => {
    if (rating === 0 || !currentUser || !reviewedUser) return

    setSubmitting(true)

    const { error } = await supabase
      .from('ratings')
      .insert({
        ride_id: params.id as string,
        reviewer_id: currentUser.id,
        reviewed_id: reviewedUser.id,
        rating,
        comment: comment || null,
        tags: selectedTags.length > 0 ? selectedTags : null
      })

    if (error) {
      console.error('[v0] Error submitting review:', error)
      alert('Erro ao enviar avaliação')
      setSubmitting(false)
      return
    }

    router.push('/app/history')
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-blue-600 text-lg">Carregando...</div>
      </div>
    )
  }

  const isDriver = ride?.passenger_id === currentUser?.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-blue-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-blue-900 text-center">Avaliar Corrida</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* User Info */}
        <Card className="p-8 bg-white border-blue-200 mb-6 text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-blue-200">
            <AvatarImage src={reviewedUser?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-blue-100 text-blue-700 text-3xl font-bold">
              {reviewedUser?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">{reviewedUser?.full_name}</h2>
          <p className="text-blue-600">
            Como foi sua experiência {isDriver ? 'com este motorista' : 'com este passageiro'}?
          </p>
        </Card>

        {/* Rating */}
        <Card className="p-8 bg-white border-blue-200 mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-6 text-center">Dê sua nota</h3>
          <div className="flex justify-center gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <svg 
                  className={`w-12 h-12 ${
                    star <= (hoveredRating || rating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-blue-200'
                  }`}
                  fill={star <= (hoveredRating || rating) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-blue-700 font-semibold">
              {rating === 5 && 'Excelente!'}
              {rating === 4 && 'Muito bom!'}
              {rating === 3 && 'Bom'}
              {rating === 2 && 'Regular'}
              {rating === 1 && 'Ruim'}
            </p>
          )}
        </Card>

        {/* Tags */}
        {rating > 0 && (
          <Card className="p-6 bg-white border-blue-200 mb-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Adicione alguns elogios (opcional)</h3>
            <div className="flex flex-wrap gap-2">
              {RATING_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Comment */}
        {rating > 0 && (
          <Card className="p-6 bg-white border-blue-200 mb-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Deixe um comentário (opcional)</h3>
            <Textarea
              placeholder="Conte mais sobre sua experiência..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="border-blue-200 focus:border-blue-600 focus:ring-blue-600 resize-none"
            />
          </Card>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/app/history')}
            className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            Pular
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
          >
            {submitting ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
        </div>
      </main>
    </div>
  )
}
