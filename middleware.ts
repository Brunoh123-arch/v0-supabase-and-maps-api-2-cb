import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const onboardingDone = request.cookies.get('onboarding_done')?.value

  // If user is logged in (Supabase session OR onboarding done) and tries to access onboarding or root, redirect to app
  if ((user || onboardingDone) && (pathname === '/' || pathname.startsWith('/onboarding'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/app/home'
    return NextResponse.redirect(url)
  }

  // Allow onboarding routes for non-logged-in users
  if (pathname.startsWith('/onboarding')) {
    return supabaseResponse
  }

  // For /app routes: require authentication or onboarding done
  if (!user && !onboardingDone && pathname.startsWith('/app')) {
    const url = request.nextUrl.clone()
    url.pathname = '/onboarding/splash'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
