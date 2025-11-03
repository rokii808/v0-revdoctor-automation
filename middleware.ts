import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Simplified middleware without Supabase authentication for testing
  // In production, this would handle authentication checks

  console.log("[v0] Middleware running for:", request.nextUrl.pathname)

  // For now, just pass through all requests
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
