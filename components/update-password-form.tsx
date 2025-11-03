"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updatePassword } from "@/app/actions/user"

interface UpdatePasswordFormProps {
  userId: string
}

export function UpdatePasswordForm({ userId }: UpdatePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (newPassword !== confirmPassword) {
      setError("Нові паролі не співпадають")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Пароль повинен містити мінімум 6 символів")
      setIsLoading(false)
      return
    }

    const result = await updatePassword(userId, currentPassword, newPassword)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      e.currentTarget.reset()
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Поточний пароль</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Новий пароль</Label>
        <Input id="newPassword" name="newPassword" type="password" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Підтвердіть новий пароль</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required />
      </div>

      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      {success && <div className="p-3 rounded-lg bg-green-500/10 text-green-600 text-sm">Пароль успішно оновлено</div>}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Оновлення..." : "Оновити пароль"}
      </Button>
    </form>
  )
}
