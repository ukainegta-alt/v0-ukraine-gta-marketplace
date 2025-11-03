import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search-bar"
import { ListingCard } from "@/components/listing-card"
import { CategoryCard } from "@/components/category-card"
import { Car, Shirt, Home, Package, ArrowRight, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch VIP listings
  const { data: vipListings } = await supabase
    .from("listings")
    .select(`
      *,
      user:users(nickname),
      images:listing_images(image_url)
    `)
    .eq("is_vip", true)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(4)

  // Fetch new listings
  const { data: newListings } = await supabase
    .from("listings")
    .select(`
      *,
      user:users(nickname),
      images:listing_images(image_url)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(8)

  // Fetch categories with counts
  const { data: categories } = await supabase.from("categories").select("*").order("name_uk")

  const categoryIcons: Record<string, any> = {
    vehicles: Car,
    clothing: Shirt,
    "real-estate": Home,
    other: Package,
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b">
        <div className="container py-16 md:py-24">
          <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>UkraineGTA 02 - Західна Україна</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-balance">Маркетплейс для гравців</h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance">
              Купуйте та продавайте транспорт, одяг, нерухомість та інші предмети на сервері
            </p>
            <SearchBar />
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/listings">
                  Переглянути оголошення
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/listings/create">Створити оголошення</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Категорії</h2>
            <p className="text-muted-foreground mt-1">Оберіть категорію для швидкого пошуку</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories?.map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name_uk}
              slug={category.slug}
              icon={categoryIcons[category.slug] || Package}
            />
          ))}
        </div>
      </section>

      {/* VIP Listings Section */}
      {vipListings && vipListings.length > 0 && (
        <section className="container py-12 md:py-16 border-t">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-secondary" />
                VIP Оголошення
              </h2>
              <p className="text-muted-foreground mt-1">Преміум оголошення від наших користувачів</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/vip">
                Дізнатися більше
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vipListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* New Listings Section */}
      {newListings && newListings.length > 0 && (
        <section className="container py-12 md:py-16 border-t">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Нові оголошення</h2>
              <p className="text-muted-foreground mt-1">Останні додані оголошення на маркетплейсі</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/listings">
                Всі оголошення
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="container py-16 md:py-24">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-8 md:p-12 text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Готові почати торгувати?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Приєднуйтесь до спільноти UkraineGTA 02 та почніть купувати або продавати вже сьогодні
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth/signup">Зареєструватися</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/listings">Переглянути оголошення</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
