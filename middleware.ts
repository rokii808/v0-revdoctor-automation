import { NextResponse, type NextRequest } from "next/server"
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  const publicPaths = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/auth/callback',
    '/pricing',
    '/demo-login',
    '/test-email',
    '/onboarding', // Allow onboarding for authenticated users
    '/api',
  ]

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  if (isPublicPath) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Not logged in, redirect to login
  if (!session) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check subscription status for protected routes
  const protectedRoutes = ['/dashboard', '/agents', '/reports', '/settings', '/dealer-admin', '/customer-dashboard']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Run dealer and subscription queries in parallel
    const [dealerResult, subscriptionResult] = await Promise.all([
      supabase
        .from('dealers')
        .select('subscription_status, subscription_expires_at')
        .eq('user_id', session.user.id)
        .single(),
      supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', session.user.id)
        .single()
    ])

    const dealer = dealerResult.data
    const subscription = subscriptionResult.data

    // If no dealer profile, redirect to onboarding
    if (!dealer) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/onboarding'
      return NextResponse.redirect(redirectUrl)
    }

    // Check if trial is valid
    if (dealer.subscription_status === 'trial') {
      const trialExpiry = new Date(dealer.subscription_expires_at)
      const now = new Date()

      if (trialExpiry > now) {
        // Trial still valid, allow access
        return response
      } else {
        // Trial expired, redirect to pricing
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/pricing'
        redirectUrl.searchParams.set('trial_expired', 'true')
        return NextResponse.redirect(redirectUrl)
      }
    }

    // If no active subscription and not on trial, redirect to pricing
    if (!subscription || (subscription.status !== 'active' && dealer.subscription_status !== 'active')) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/pricing'
      redirectUrl.searchParams.set('required', 'true')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
