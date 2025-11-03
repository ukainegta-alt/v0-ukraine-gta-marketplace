"use server"

import { createClient } from "@/lib/supabase/server"

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function updatePassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    const supabase = await createClient()
    const currentPasswordHash = await hashPassword(currentPassword)

    // Verify current password
    const { data: user } = await supabase.from("users").select("password_hash").eq("id", userId).single()

    if (!user || user.password_hash !== currentPasswordHash) {
      return { error: "Невірний поточний пароль" }
    }

    // Update password
    const newPasswordHash = await hashPassword(newPassword)
    const { error } = await supabase.from("users").update({ password_hash: newPasswordHash }).eq("id", userId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    return { error: "Помилка оновлення пароля" }
  }
}
