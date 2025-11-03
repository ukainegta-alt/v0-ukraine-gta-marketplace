import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { CreateListingForm } from "@/components/create-listing-form"
import { createClient } from "@/lib/supabase/server"

export default async function CreateListingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const supabase = await createClient()
  const { data: categories } = await supabase.from("categories").select("*").order("name_uk")

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Створити оголошення</h1>
        <p className="text-muted-foreground mt-2">Заповніть форму нижче, щоб створити нове оголошення</p>
      </div>

      <CreateListingForm categories={categories || []} userId={user.id} />
    </div>
  )
}
