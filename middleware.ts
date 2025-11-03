import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "ukrainegta-secret-key-change-in-production")

const publicPaths = ["/", "/auth/login", "/auth/signup", "/listings"]

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  const { pathname } = request.nextUrl

  // Check if path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // Verify token
  let user = null
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY)
      user = payload.user
    } catch {
      // Invalid token
    }
  }

  // Redirect to login if accessing protected route without auth
  if (!isPublicPath && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Redirect to home if accessing auth pages while logged in
  if ((pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup")) && user) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
