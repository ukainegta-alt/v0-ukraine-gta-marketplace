"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X, Eye, Trash2 } from "lucide-react"
import { moderateListing, deleteListing } from "@/app/actions/admin"

interface Listing {
  id: string
  title: string
  price: number
  status: string
  is_vip: boolean
  created_at: string
  user: {
    nickname: string
  }
}

interface AdminListingsTableProps {
  listings: Listing[]
  showActions?: boolean
}

export function AdminListingsTable({ listings, showActions = false }: AdminListingsTableProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleApprove = async (listingId: string) => {
    setIsLoading(listingId)
    await moderateListing(listingId, "active")
    setIsLoading(null)
    window.location.reload()
  }

  const handleReject = async (listingId: string) => {
    setIsLoading(listingId)
    await moderateListing(listingId, "inactive")
    setIsLoading(null)
    window.location.reload()
  }

  const handleDelete = async (listingId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити це оголошення?")) return
    setIsLoading(listingId)
    await deleteListing(listingId)
    setIsLoading(null)
    window.location.reload()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Активне</Badge>
      case "pending":
        return <Badge className="bg-orange-600">На модерації</Badge>
      case "inactive":
        return <Badge variant="secondary">Неактивне</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (listings.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Оголошень не знайдено</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Назва</TableHead>
            <TableHead>Користувач</TableHead>
            <TableHead>Ціна</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата</TableHead>
            {showActions && <TableHead className="text-right">Дії</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => (
            <TableRow key={listing.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {listing.title}
                  {listing.is_vip && (
                    <Badge variant="secondary" className="text-xs">
                      VIP
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{listing.user.nickname}</TableCell>
              <TableCell>{listing.price.toLocaleString()} ₴</TableCell>
              <TableCell>{getStatusBadge(listing.status)}</TableCell>
              <TableCell>{new Date(listing.created_at).toLocaleDateString("uk-UA")}</TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/listings/${listing.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {listing.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApprove(listing.id)}
                          disabled={isLoading === listing.id}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReject(listing.id)}
                          disabled={isLoading === listing.id}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(listing.id)}
                      disabled={isLoading === listing.id}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
