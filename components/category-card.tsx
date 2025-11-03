import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface CategoryCardProps {
  name: string
  slug: string
  icon: LucideIcon
  count?: number
}

export function CategoryCard({ name, slug, icon: Icon, count }: CategoryCardProps) {
  return (
    <Link href={`/listings?category=${slug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary">
        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            {count !== undefined && <p className="text-sm text-muted-foreground">{count} оголошень</p>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
