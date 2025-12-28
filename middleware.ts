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
    // Check if user has active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', session.user.id)
      .single()

    // If no active subscription, redirect to pricing
    if (!subscription || subscription.status !== 'active') {
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
