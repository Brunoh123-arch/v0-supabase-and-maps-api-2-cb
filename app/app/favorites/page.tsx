import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomNavigation } from '@/components/bottom-navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/onboarding/splash')
  }

  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      id,
      location_name,
      address,
      latitude,
      longitude,
      location_type,
      created_at
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-neutral-50 pb-24 ios-scroll">
      {/* Header - iOS style */}
      <header className="bg-white/95 ios-blur border-b border-neutral-200/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-5 pt-safe-offset-4 pb-3">
          <h1 className="text-[20px] font-bold text-neutral-900 tracking-tight">Favoritos</h1>
          <Link href="/app/favorites/add" className="h-[36px] px-4 bg-blue-500 text-white rounded-full font-semibold text-[15px] flex items-center ios-press">
            Adicionar
          </Link>
        </div>
      </header>

      <main className="px-5 py-5 space-y-3">
        {!favorites || favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-neutral-100 rounded-[22px] flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-[20px] font-bold text-neutral-900 tracking-tight mb-1.5">Nenhum favorito ainda</h2>
            <p className="text-[15px] text-neutral-500 mb-6 max-w-[280px]">
              Adicione seus enderecos favoritos para solicitar corridas mais rapido.
            </p>
            <Link href="/app/favorites/add" className="h-[48px] px-6 bg-blue-500 text-white rounded-[16px] font-semibold text-[17px] flex items-center ios-press">
              Adicionar Favorito
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            {favorites.map((fav, i) => (
              <div
                key={fav.id}
                className={`flex items-center gap-3.5 px-5 py-4 ${i < favorites.length - 1 ? 'border-b border-neutral-100' : ''}`}
              >
                <div className="w-11 h-11 bg-blue-50 rounded-[14px] flex items-center justify-center flex-shrink-0">
                  {fav.location_type === 'home' ? (
                    <svg className="w-[22px] h-[22px] text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  ) : fav.location_type === 'work' ? (
                    <svg className="w-[22px] h-[22px] text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-[22px] h-[22px] text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[17px] font-semibold text-neutral-900 truncate">
                    {fav.location_name}
                  </h3>
                  <p className="text-[13px] text-neutral-500 truncate mt-0.5">
                    {fav.address}
                  </p>
                </div>
                <Link
                  href={`/app/request-ride?destination=${encodeURIComponent(fav.address)}&lat=${fav.latitude}&lng=${fav.longitude}`}
                  className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 ios-press"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
