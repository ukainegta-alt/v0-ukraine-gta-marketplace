"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface Category {
  id: string
  name_uk: string
  slug: string
}

interface ListingsFiltersProps {
  categories: Category[]
}

export function ListingsFilters({ categories }: ListingsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/listings?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/listings")
  }

  const hasFilters = searchParams.toString().length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Фільтри</CardTitle>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Очистити
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Категорія</Label>
          <Select
            value={searchParams.get("category") || "all"}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Всі категорії" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі категорії</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name_uk}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Сортування</Label>
          <Select
            value={searchParams.get("sort") || "newest"}
            onValueChange={(value) => handleFilterChange("sort", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Спочатку нові</SelectItem>
              <SelectItem value="oldest">Спочатку старі</SelectItem>
              <SelectItem value="price-asc">Ціна: за зростанням</SelectItem>
              <SelectItem value="price-desc">Ціна: за спаданням</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Мінімальна ціна</Label>
          <Input
            type="number"
            placeholder="0"
            value={searchParams.get("minPrice") || ""}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Максимальна ціна</Label>
          <Input
            type="number"
            placeholder="Без обмежень"
            value={searchParams.get("maxPrice") || ""}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
