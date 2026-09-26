import { getServerUser } from '@/lib/session'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Calendar } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const SECTION_TYPES = [
  'hero', 'featuredProducts', 'staffPicks', 'followingFeed',
  'trendingProducts', 'newDrops', 'categories', 'creatorSpotlight',
  'freeProducts', 'announcements', 'customHtml'
]

export default async function EditHomepageSectionPage({ params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user || user.role !== 'FOUNDER') {
    redirect('/admin')
  }

  const section = await prisma.homepageSection.findUnique({
    where: { id: params.id },
  })

  if (!section) {
    notFound()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/founder/homepage">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Homepage Sections
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Section</h1>
          <p className="text-sm text-muted-foreground">{section.type}</p>
        </div>
      </div>

      <form action="/api/admin/homepage/[id]" method="POST">
        <input type="hidden" name="_method" value="PUT" />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Section Type</Label>
              <select id="type" name="type" defaultValue={section.type} className="w-full border rounded-md px-3 py-2 bg-background">
                {SECTION_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input id="displayOrder" name="displayOrder" type="number" defaultValue={section.displayOrder} />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="enabled"
                name="enabled"
                checked={section.enabled}
              />
              <Label htmlFor="enabled" className="cursor-pointer">
                Enabled
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isSeasonal">Seasonal Section</Label>
              <Switch
                id="isSeasonal"
                name="isSeasonal"
                checked={section.isSeasonal}
              />
            </div>

            {section.isSeasonal && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seasonStart">Season Start</Label>
                  <Input
                    id="seasonStart"
                    name="seasonStart"
                    type="datetime-local"
                    defaultValue={section.seasonStart ? new Date(section.seasonStart).toISOString().slice(0, 16) : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seasonEnd">Season End</Label>
                  <Input
                    id="seasonEnd"
                    name="seasonEnd"
                    type="datetime-local"
                    defaultValue={section.seasonEnd ? new Date(section.seasonEnd).toISOString().slice(0, 16) : ''}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuration (JSON)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="config">Config JSON</Label>
              <Textarea
                id="config"
                name="config"
                className="font-mono text-sm"
                rows={10}
                defaultValue={JSON.stringify(section.config ?? {}, null, 2)}
                placeholder='{"title": "Section Title", "limit": 8, "showAction": true}'
              />
              <p className="text-xs text-muted-foreground">
                Section-specific configuration. Varies by section type.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/founder/homepage">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}