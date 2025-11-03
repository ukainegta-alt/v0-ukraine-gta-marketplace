import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Package, Clock, AlertCircle } from "lucide-react"
import { AdminListingsTable } from "@/components/admin-listings-table"
import { AdminUsersTable } from "@/components/admin-users-table"

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/")
  }

  const supabase = await createClient()

  // Fetch statistics
  const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

  const { count: totalListings } = await supabase.from("listings").select("*", { count: "exact", head: true })

  const { count: pendingListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: activeListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  // Fetch pending listings for moderation
  const { data: pendingListingsData } = await supabase
    .from("listings")
    .select(`
      *,
      user:users(nickname),
      images:listing_images(image_url)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  // Fetch all listings
  const { data: allListingsData } = await supabase
    .from("listings")
    .select(`
      *,
      user:users(nickname),
      images:listing_images(image_url)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  // Fetch all users
  const { data: usersData } = await supabase.from("users").select("*").order("created_at", { ascending: false })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Адмін панель</h1>
        <p className="text-muted-foreground mt-2">Керування платформою UkraineGTA 02</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Користувачі</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всього оголошень</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalListings || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активні</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeListings || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">На модерації</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingListings || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            <AlertCircle className="h-4 w-4 mr-2" />
            На модерації ({pendingListings || 0})
          </TabsTrigger>
          <TabsTrigger value="listings">
            <Package className="h-4 w-4 mr-2" />
            Всі оголошення
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Користувачі
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Оголошення на модерації</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminListingsTable listings={pendingListingsData || []} showActions />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Всі оголошення</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminListingsTable listings={allListingsData || []} showActions />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Користувачі платформи</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminUsersTable users={usersData || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
