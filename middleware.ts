import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SECRET_KEY = process.env.JWT_SECRET || "ukrainegta-secret-key-change-in-production"

const publicPaths = ["/", "/auth/login", "/auth/signup", "/listings"]

// Custom JWT verification function using Web Crypto API
async function verifyToken(token: string): Promise<any | null> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [headerB64, payloadB64, signatureB64] = parts

    // Verify signature
    const encoder = new TextEncoder()
    const data = encoder.encode(`${headerB64}.${payloadB64}`)
    const keyData = encoder.encode(SECRET_KEY)

    const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, [
      "verify",
    ])

    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))

    const isValid = await crypto.subtle.verify("HMAC", cryptoKey, signature, data)
    if (!isValid) return null

    // Decode payload
    const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
    const payload = JSON.parse(payloadJson)

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload.user
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  const { pathname } = request.nextUrl

  // Check if path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // Verify token
  let user = null
  if (token) {
    user = await verifyToken(token)
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
