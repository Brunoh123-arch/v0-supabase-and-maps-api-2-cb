import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BottomNavigation } from '@/components/bottom-navigation'
import { ReferralClient } from '@/components/referral-client'

export default async function ReferralPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/onboarding/splash')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Generate referral code (first 8 chars of user id)
  const referralCode = user.id.substring(0, 8).toUpperCase()

  // Count referrals (users who used this code)
  // This would need a referral_code column in profiles table
  const totalReferrals = 0 // Placeholder for now
  const referralBonus = totalReferrals * 10 // R$10 per referral

  return (
    <div className="h-dvh overflow-y-auto bg-gradient-to-br from-blue-50 to-blue-100 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/app/home">
            <Button variant="ghost" size="icon" className="text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-blue-900">Indique e Ganhe</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <ReferralClient
          referralCode={referralCode}
          totalReferrals={totalReferrals}
          referralBonus={referralBonus}
        />
      </main>

      <BottomNavigation />
    </div>
  )
}
