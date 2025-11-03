import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { ListingCard } from "@/components/listing-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Package, Eye, Clock } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  // Fetch user's listings
  const { data: activeListings } = await supabase
    .from("listings")
    .select(`
      *,
      user:users(nickname),
      images:listing_images(image_url)
    `)
    .eq("user_id", user.id)
    .in("status", ["active", "approved"])
    .order("created_at", { ascending: false })

  const { data: pendingListings } = await supabase
    .from("listings")
    .select(`
      *,
      user:users(nickname),
      images:listing_images(image_url)
    `)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  const { data: inactiveListings } = await supabase
    .from("listings")
    .select(`
      *,
      user:users(nickname),
      images:listing_images(image_url)
    `)
    .eq("user_id", user.id)
    .eq("status", "inactive")
    .order("created_at", { ascending: false })

  const totalListings = (activeListings?.length || 0) + (pendingListings?.length || 0) + (inactiveListings?.length || 0)

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Мої оголошення</h1>
          <p className="text-muted-foreground mt-2">Керуйте своїми оголошеннями</p>
        </div>
        <Button asChild size="lg">
          <Link href="/listings/create">
            <Plus className="mr-2 h-4 w-4" />
            Створити оголошення
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всього оголошень</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalListings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активні</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeListings?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">На модерації</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingListings?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Listings Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Активні ({activeListings?.length || 0})</TabsTrigger>
          <TabsTrigger value="pending">На модерації ({pendingListings?.length || 0})</TabsTrigger>
          <TabsTrigger value="inactive">Неактивні ({inactiveListings?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeListings && activeListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">У вас немає активних оголошень</p>
                <Button asChild>
                  <Link href="/listings/create">Створити оголошення</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          {pendingListings && pendingListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Немає оголошень на модерації</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-6">
          {inactiveListings && inactiveListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Немає неактивних оголошень</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
