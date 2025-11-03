import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, User } from "lucide-react"

interface ListingCardProps {
  listing: {
    id: string
    title: string
    description: string
    price: number
    category?: {
      name_uk: string
      slug: string
    }
    location?: string
    is_vip: boolean
    created_at: string
    user: {
      nickname: string
    }
    images?: Array<{ image_url: string }>
  }
}

export function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = listing.images?.[0]?.image_url || "/gta-vehicle.jpg"
  const timeAgo = getTimeAgo(new Date(listing.created_at))

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-110"
          />
          {listing.is_vip && (
            <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground font-bold">VIP</Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg line-clamp-1 text-balance">{listing.title}</h3>
            <p className="font-bold text-primary whitespace-nowrap">{listing.price.toLocaleString()} ₴</p>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{listing.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{listing.user.nickname}</span>
            </div>
            {listing.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{listing.location}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 bg-muted/50 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "щойно"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} хв тому`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} год тому`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} дн тому`
  return date.toLocaleDateString("uk-UA")
}
