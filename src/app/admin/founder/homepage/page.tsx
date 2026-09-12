import { getServerUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, GripVertical, Eye, Trash2, Plus, Save, Calendar } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Banner', description: 'Main hero section with CTA buttons' },
  { value: 'featuredProducts', label: 'Featured Products', description: 'Curated featured products grid' },
  { value: 'staffPicks', label: 'Staff Picks', description: 'Staff-curated product selections' },
  { value: 'followingFeed', label: 'Following Feed', description: 'Products from followed creators (logged-in users)' },
  { value: 'trendingProducts', label: 'Trending Products', description: 'Popular products by favorites/views' },
  { value: 'newDrops', label: 'New Drops', description: 'Recently published products' },
  { value: 'categories', label: 'Categories', description: 'Shop by category grid' },
  { value: 'creatorSpotlight', label: 'Creator Spotlight', description: 'Featured creator profile' },
  { value: 'freeProducts', label: 'Free Products', description: 'Free assets showcase' },
  { value: 'announcements', label: 'Announcements', description: 'Platform announcements bar' },
  { value: 'customHtml', label: 'Custom HTML', description: 'Custom content block' },
]

export default async function HomepageManagementPage() {
  const user = await getServerUser()
  if (!user || user.role !== 'FOUNDER') {
    redirect('/admin')
  }

  let sections: any[] = []
  try {
    sections = await prisma.homepageSection.findMany({
      orderBy: { displayOrder: 'asc' },
    })
  } catch (error) {
    console.error("Failed to fetch homepage sections:", error)
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/founder">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Founder Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Homepage Sections</h1>
          <p className="text-sm text-muted-foreground">
            Manage homepage layout, enable/disable sections, and configure seasonal content
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Sections ({sections.length})</CardTitle>
              <CardDescription>Drag to reorder, toggle to enable/disable, click to edit</CardDescription>
            </div>
            <Button asChild>
              <Link href="/admin/founder/homepage/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No sections configured</p>
          ) : (
            <div className="space-y-3">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={section.enabled ? 'success' : 'secondary'} size="sm">
                          {section.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        {section.isSeasonal && (
                          <Badge variant="outline" size="sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            Seasonal
                          </Badge>
                        )}
                        <span className="text-sm font-medium truncate">{section.type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Order: {section.displayOrder}
                        {section.config && typeof section.config === 'object' && 'title' in section.config && (
                          <> · {String(section.config.title)}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={section.enabled}
                      onCheckedChange={(checked) =>
                        fetch(`/api/admin/homepage/${section.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ enabled: checked }),
                        })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link href={`/admin/founder/homepage/${section.id}`}>
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={async () => {
                        if (confirm('Delete this section?')) {
                          await fetch(`/api/admin/homepage/${section.id}`, { method: 'DELETE' })
                          window.location.reload()
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Section Types</CardTitle>
          <CardDescription>Reference for creating new sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SECTION_TYPES.map((type) => (
              <div key={type.value} className="p-3 border rounded-lg">
                <p className="font-medium">{type.label}</p>
                <p className="text-sm text-muted-foreground">{type.description}</p>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{type.value}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}