"use server"

import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function moderateListing(listingId: string, status: "active" | "inactive") {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return { error: "Недостатньо прав" }
    }

    const supabase = await createClient()

    const { error } = await supabase.from("listings").update({ status }).eq("id", listingId)

    if (error) throw error

    revalidatePath("/admin")
    revalidatePath("/")
    revalidatePath("/listings")

    return { success: true }
  } catch (error) {
    return { error: "Помилка модерації оголошення" }
  }
}

export async function deleteListing(listingId: string) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return { error: "Недостатньо прав" }
    }

    const supabase = await createClient()

    // Delete listing images first
    await supabase.from("listing_images").delete().eq("listing_id", listingId)

    // Delete listing
    const { error } = await supabase.from("listings").delete().eq("id", listingId)

    if (error) throw error

    revalidatePath("/admin")
    revalidatePath("/")
    revalidatePath("/listings")

    return { success: true }
  } catch (error) {
    return { error: "Помилка видалення оголошення" }
  }
}
