import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UpdatePasswordForm } from "@/components/update-password-form"
import { Separator } from "@/components/ui/separator"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Налаштування</h1>
        <p className="text-muted-foreground mt-2">Керуйте налаштуваннями вашого акаунту</p>
      </div>

      <div className="space-y-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Інформація профілю</CardTitle>
            <CardDescription>Ваша основна інформація на платформі</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Нікнейм</p>
              <p className="text-lg font-semibold">{user.nickname}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Роль</p>
              <p className="text-lg font-semibold">{user.role === "admin" ? "Адміністратор" : "Користувач"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Змінити пароль</CardTitle>
            <CardDescription>Оновіть пароль для вашого акаунту</CardDescription>
          </CardHeader>
          <CardContent>
            <UpdatePasswordForm userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
