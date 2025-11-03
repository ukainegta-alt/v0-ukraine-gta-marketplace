import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { ListingCard } from "@/components/listing-card"
import { ListingsFilters } from "@/components/listings-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface SearchParams {
  search?: string
  category?: string
  minPrice?: string
  maxPrice?: string
  sort?: string
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from("listings")
    .select(`
      *,
      user:users(nickname),
      images:listing_images(image_url)
    `)
    .eq("status", "active")

  // Apply filters
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  if (params.category) {
    query = query.eq("category_slug", params.category)
  }

  if (params.minPrice) {
    query = query.gte("price", Number.parseInt(params.minPrice))
  }

  if (params.maxPrice) {
    query = query.lte("price", Number.parseInt(params.maxPrice))
  }

  // Apply sorting
  const sortBy = params.sort || "newest"
  switch (sortBy) {
    case "price-asc":
      query = query.order("price", { ascending: true })
      break
    case "price-desc":
      query = query.order("price", { ascending: false })
      break
    case "oldest":
      query = query.order("created_at", { ascending: true })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data: listings } = await query

  // Fetch categories for filter
  const { data: categories } = await supabase.from("categories").select("*").order("name_uk")

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Оголошення</h1>
          <p className="text-muted-foreground mt-2">{listings?.length || 0} оголошень знайдено</p>
        </div>
        <Button asChild>
          <Link href="/listings/create">
            <Plus className="mr-2 h-4 w-4" />
            Створити оголошення
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <Suspense fallback={<div>Завантаження...</div>}>
            <ListingsFilters categories={categories || []} />
          </Suspense>
        </aside>

        <div className="lg:col-span-3">
          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Оголошень не знайдено</p>
              <Button asChild className="mt-4">
                <Link href="/listings/create">Створити перше оголошення</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
