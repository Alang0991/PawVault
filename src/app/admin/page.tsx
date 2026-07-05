export const dynamic = "force-dynamic"

import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function AdminPage() {
  const user = await getServerUser()
  if (!user || user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <CardTitle className="text-lg">Users</CardTitle>
              <p className="text-2xl font-bold mt-2">Manage users</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/admin/users">View Users</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <CardTitle className="text-lg">Assets</CardTitle>
              <p className="text-2xl font-bold mt-2">Moderate assets</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/admin/assets">View Assets</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <CardTitle className="text-lg">Licenses</CardTitle>
              <p className="text-2xl font-bold mt-2">Manage licenses</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/admin/licenses">View Licenses</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <CardTitle className="text-lg">Reports</CardTitle>
              <p className="text-2xl font-bold mt-2">Platform reports</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/admin/reports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
