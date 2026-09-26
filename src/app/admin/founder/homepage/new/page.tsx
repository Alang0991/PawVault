import { getServerUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Banner', config: '{"showCTA": true, "ctaText": "Browse Marketplace", "ctaHref": "/browse", "secondaryCtaText": "Start Selling", "secondaryCtaHref": "/auth/signin"}' },
  { value: 'featuredProducts', label: 'Featured Products', config: '{"title": "Featured", "limit": 4, "showAction": true, "actionLabel": "All featured", "actionHref": "/browse?featured=true"}' },
  { value: 'staffPicks', label: 'Staff Picks', config: '{"title": "Staff Picks", "limit": 6}' },
  { value: 'followingFeed', label: 'Following Feed', config: '{"title": "Following"}' },
  { value: 'trendingProducts', label: 'Trending Products', config: '{"title": "Trending", "subtitle": "Popular right now", "limit": 8, "showAction": true, "actionLabel": "See more", "actionHref": "/browse?sort=popular"}' },
  { value: 'newDrops', label: 'New Drops', config: '{"title": "New Drops", "subtitle": "Recently published", "limit": 8, "showAction": true, "actionLabel": "See all new", "actionHref": "/browse?sort=newest"}' },
  { value: 'categories', label: 'Categories', config: '{"title": "Shop by Category", "limit": 8, "showAction": true, "actionLabel": "All categories", "actionHref": "/categories"}' },
  { value: 'creatorSpotlight', label: 'Creator Spotlight', config: '{"title": "Creator Spotlight", "subtitle": "Meet the artists behind the assets", "showAction": true, "actionLabel": "View store"}' },
  { value: 'freeProducts', label: 'Free Products', config: '{"title": "Free Products", "subtitle": "Hand-picked free assets", "limit": 8, "showAction": true, "actionLabel": "Free in all", "actionHref": "/browse?free=true"}' },
  { value: 'announcements', label: 'Announcements', config: '{}' },
  { value: 'customHtml', label: 'Custom HTML', config: '{"html": "<div>Custom content</div>"}' },
]

export default async function NewHomepageSectionPage() {
  const user = await getServerUser()
  if (!user || user.role !== 'FOUNDER') {
    redirect('/admin')
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
          <h1 className="text-2xl font-bold">Add Section</h1>
          <p className="text-sm text-muted-foreground">Choose a section type and configure it</p>
        </div>
      </div>

      <form action="/api/admin/homepage" method="POST">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Section Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select id="type" name="type" required className="w-full border rounded-md px-3 py-2 bg-background">
                <option value="">Select a section type...</option>
                {SECTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input id="displayOrder" name="displayOrder" type="number" defaultValue="0" />
            </div>

            <div className="flex items-center gap-3">
              <Switch id="enabled" name="enabled" checked={true} />
              <Label htmlFor="enabled" className="cursor-pointer">Enabled</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isSeasonal">Seasonal Section</Label>
              <Switch id="isSeasonal" name="isSeasonal" />
            </div>

            <div id="seasonalFields" className="hidden grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seasonStart">Season Start</Label>
                <Input id="seasonStart" name="seasonStart" type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seasonEnd">Season End</Label>
                <Input id="seasonEnd" name="seasonEnd" type="datetime-local" />
              </div>
            </div>
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
                defaultValue='{}'
                placeholder='{"title": "Section Title", "limit": 8, "showAction": true}'
              />
              <p className="text-xs text-muted-foreground">
                Section-specific configuration. Select a type above to see defaults.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" />
            Create Section
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/founder/homepage">Cancel</Link>
          </Button>
        </div>
      </form>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('type').addEventListener('change', function() {
            const type = this.value;
            const configField = document.getElementById('config');
            const seasonalFields = document.getElementById('seasonalFields');
            const isSeasonal = document.getElementById('isSeasonal');

            const defaults = {
              'hero': '{"showCTA": true, "ctaText": "Browse Marketplace", "ctaHref": "/browse", "secondaryCtaText": "Start Selling", "secondaryCtaHref": "/auth/signin"}',
              'featuredProducts': '{"title": "Featured", "limit": 4, "showAction": true, "actionLabel": "All featured", "actionHref": "/browse?featured=true"}',
              'staffPicks': '{"title": "Staff Picks", "limit": 6}',
              'followingFeed': '{"title": "Following"}',
              'trendingProducts': '{"title": "Trending", "subtitle": "Popular right now", "limit": 8, "showAction": true, "actionLabel": "See more", "actionHref": "/browse?sort=popular"}',
              'newDrops': '{"title": "New Drops", "subtitle": "Recently published", "limit": 8, "showAction": true, "actionLabel": "See all new", "actionHref": "/browse?sort=newest"}',
              'categories': '{"title": "Shop by Category", "limit": 8, "showAction": true, "actionLabel": "All categories", "actionHref": "/categories"}',
              'creatorSpotlight': '{"title": "Creator Spotlight", "subtitle": "Meet the artists behind the assets", "showAction": true, "actionLabel": "View store"}',
              'freeProducts': '{"title": "Free Products", "subtitle": "Hand-picked free assets", "limit": 8, "showAction": true, "actionLabel": "Free in all", "actionHref": "/browse?free=true"}',
              'announcements': '{}',
              'customHtml': '{"html": "<div>Custom content</div>"}',
            };

            if (defaults[type]) {
              configField.value = defaults[type];
            }

            isSeasonal.addEventListener('change', function() {
              seasonalFields.classList.toggle('hidden', !this.checked);
            });
          });
        `
      }} />
    </div>
  )
}