"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createListing(formData: FormData, userId: string) {
  try {
    const supabase = await createClient()

    const listingData = {
      user_id: userId,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category_slug: formData.get("category_slug") as string,
      price: Number.parseInt(formData.get("price") as string),
      location: (formData.get("location") as string) || null,
      contact_info: (formData.get("contact_info") as string) || null,
      is_vip: formData.get("is_vip") === "on",
      status: "active",
    }

    const { data, error } = await supabase.from("listings").insert(listingData).select().single()

    if (error) throw error

    revalidatePath("/")
    revalidatePath("/listings")

    return { id: data.id }
  } catch (error) {
    return { error: "Помилка створення оголошення" }
  }
}

export async function deleteListing(listingId: string, userId: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("listings").delete().eq("id", listingId).eq("user_id", userId)

    if (error) throw error

    revalidatePath("/")
    revalidatePath("/listings")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    return { error: "Помилка видалення оголошення" }
  }
}
