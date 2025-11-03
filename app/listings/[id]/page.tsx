import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, User, Phone, Mail, Sparkles } from "lucide-react"
import Link from "next/link"
import { ImageGallery } from "@/components/image-gallery"

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const currentUser = await getCurrentUser()

  const { data: listing } = await supabase
    .from("listings")
    .select(`
      *,
      user:users(id, nickname, avatar_url, created_at),
      images:listing_images(image_url),
      category:categories(name, slug)
    `)
    .eq("id", id)
    .single()

  if (!listing) {
    notFound()
  }

  const isOwner = currentUser?.id === listing.user_id
  const createdAt = new Date(listing.created_at).toLocaleDateString("uk-UA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <ImageGallery images={listing.images?.map((img: any) => img.image_url) || []} />

          {/* Listing Details */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {listing.is_vip && (
                      <Badge className="bg-secondary text-secondary-foreground">
                        <Sparkles className="h-3 w-3 mr-1" />
                        VIP
                      </Badge>
                    )}
                    <Badge variant="outline">{listing.category?.name}</Badge>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{createdAt}</span>
                    </div>
                    {listing.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{listing.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{listing.price.toLocaleString()} ₴</p>
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-3">Опис</h2>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{listing.description}</p>
              </div>

              {isOwner && (
                <>
                  <Separator />
                  <div className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/listings/${listing.id}/edit`}>Редагувати</Link>
                    </Button>
                    <Button variant="destructive">Видалити</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Seller Info */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Продавець</h3>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{listing.user.nickname}</p>
                  <p className="text-sm text-muted-foreground">
                    На сайті з {new Date(listing.user.created_at).getFullYear()}
                  </p>
                </div>
              </div>

              {!isOwner && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Button className="w-full" size="lg">
                      <Phone className="mr-2 h-4 w-4" />
                      Зв'язатися
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Mail className="mr-2 h-4 w-4" />
                      Написати повідомлення
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Safety Tips */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="font-semibold text-lg">Поради безпеки</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Зустрічайтеся в безпечних місцях</li>
                <li>• Перевіряйте товар перед оплатою</li>
                <li>• Не передавайте гроші заздалегідь</li>
                <li>• Повідомляйте про підозрілу активність</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
