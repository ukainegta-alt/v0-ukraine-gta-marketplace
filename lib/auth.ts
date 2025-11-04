"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

const SECRET_KEY = process.env.JWT_SECRET || "ukrainegta-secret-key-change-in-production"

export interface User {
  id: string
  nickname: string
  role: string
  avatar_url?: string
}

// Hash password using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Simple JWT implementation using Web Crypto API
async function createToken(user: User): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" }
  const payload = {
    user,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  }

  const encoder = new TextEncoder()
  const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")

  const data = encoder.encode(`${headerB64}.${payloadB64}`)
  const keyData = encoder.encode(SECRET_KEY)

  const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, data)
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")

  return `${headerB64}.${payloadB64}.${signatureB64}`
}

// Verify JWT token
async function verifyToken(token: string): Promise<User | null> {
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

    return payload.user as User
  } catch {
    return null
  }
}

// Sign up new user
export async function signUp(nickname: string, password: string) {
  try {
    const supabase = await createClient()
    const passwordHash = await hashPassword(password)

    const { data: existingUser } = await supabase.from("users").select("id").eq("nickname", nickname).maybeSingle()

    if (existingUser) {
      return { error: "Нікнейм вже зайнятий" }
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        nickname,
        password_hash: passwordHash,
        role: "user",
      })
      .select()
      .single()

    if (error) throw error

    // Create session
    const token = await createToken({
      id: newUser.id,
      nickname: newUser.nickname,
      role: newUser.role,
      avatar_url: newUser.avatar_url,
    })

    const cookieStore = await cookies()
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { user: newUser }
  } catch (error) {
    return { error: "Помилка реєстрації" }
  }
}

// Sign in user
export async function signIn(nickname: string, password: string) {
  try {
    const supabase = await createClient()
    const passwordHash = await hashPassword(password)

    // Find user
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("nickname", nickname)
      .eq("password_hash", passwordHash)
      .single()

    if (error || !user) {
      return { error: "Невірний нікнейм або пароль" }
    }

    // Create session
    const token = await createToken({
      id: user.id,
      nickname: user.nickname,
      role: user.role,
      avatar_url: user.avatar_url,
    })

    const cookieStore = await cookies()
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { user }
  } catch (error) {
    return { error: "Помилка входу" }
  }
}

// Sign out user
export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
}

export async function logout() {
  return signOut()
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) return null

    return await verifyToken(token)
  } catch {
    return null
  }
}

// Set user context for RLS
export async function setUserContext(supabase: any, userId: string, userRole: string) {
  await supabase.rpc("set_config", {
    setting: "app.current_user_id",
    value: userId,
  })
  await supabase.rpc("set_config", {
    setting: "app.current_user_role",
    value: userRole,
  })
}
