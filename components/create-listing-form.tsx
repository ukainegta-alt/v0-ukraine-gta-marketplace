"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { createListing } from "@/app/actions/listings"

interface Category {
  id: string
  name_uk: string
  slug: string
}

interface CreateListingFormProps {
  categories: Category[]
  userId: string
}

export function CreateListingForm({ categories, userId }: CreateListingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createListing(formData, userId)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push(`/listings/${result.id}`)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Назва оголошення *</Label>
            <Input id="title" name="title" placeholder="Наприклад: BMW M5 2020" required maxLength={100} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Опис *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Детальний опис вашого товару..."
              required
              rows={6}
              maxLength={2000}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Категорія *</Label>
              <Select name="category_slug" required>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть категорію" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name_uk}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Ціна (₴) *</Label>
              <Input id="price" name="price" type="number" placeholder="10000" required min="0" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Локація</Label>
            <Input id="location" name="location" placeholder="Наприклад: Львів, Івано-Франківськ" maxLength={100} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_info">Контактна інформація</Label>
            <Input id="contact_info" name="contact_info" placeholder="Телефон, Discord, тощо" maxLength={200} />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="is_vip" name="is_vip" />
            <Label htmlFor="is_vip" className="text-sm font-normal cursor-pointer">
              Зробити VIP оголошення (преміум розміщення)
            </Label>
          </div>

          {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Створення..." : "Створити оголошення"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Скасувати
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
