import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const cookieStore = await cookies()
  const onboardingDone = cookieStore.get('onboarding_done')?.value

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user || onboardingDone) {
    redirect('/app/home')
  }

  redirect('/onboarding/splash')
}
