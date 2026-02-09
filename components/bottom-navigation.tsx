'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function BottomNavigation() {
  const pathname = usePathname()

  const links = [
    {
      href: '/app/home',
      label: 'Inicio',
      icon: (active: boolean) => (
        <svg className="w-[26px] h-[26px]" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
          {active ? (
            <path d="M3 12.5l1.5-1.5L12 3.5l7.5 7.5L21 12.5v7.5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4a1 1 0 00-1-1h-4a1 1 0 00-1 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V12.5z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          )}
        </svg>
      ),
    },
    {
      href: '/app/history',
      label: 'Viagens',
      icon: (active: boolean) => (
        <svg className="w-[26px] h-[26px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      href: '/app/favorites',
      label: 'Favoritos',
      icon: (active: boolean) => (
        <svg className="w-[26px] h-[26px]" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      href: '/app/profile',
      label: 'Perfil',
      icon: (active: boolean) => (
        <svg className="w-[26px] h-[26px]" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 ios-blur border-t border-neutral-200/60 z-50">
      <div className="flex items-center justify-around h-[52px] max-w-lg mx-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors',
                isActive
                  ? 'text-blue-500'
                  : 'text-neutral-400'
              )}
            >
              {link.icon(isActive)}
              <span className="text-[10px] font-semibold tracking-wide">{link.label}</span>
            </Link>
          )
        })}
      </div>
      <div className="pb-safe-offset-4" />
    </nav>
  )
}
