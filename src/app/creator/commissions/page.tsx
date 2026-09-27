"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/empty-state"
import { CreatorDashboardSkeleton } from "@/components/creator/dashboard-skeleton"
import { CommissionCard } from "@/components/storefront/commission-card"
import { formatPrice } from "@/lib/helpers"
import { Plus, Trash2 } from "lucide-react"

interface Service {
  id: string
  title: string
  description: string
  serviceType: string
  serviceCategory: string
  startingPrice: number
  availability: string
  turnaroundDays: number
  tags: string[]
  portfolioImages: string[]
  isActive: boolean
}

const SERVICE_TYPES = [
  { value: "avatar-commissions", label: "Avatar" },
  { value: "art-commissions", label: "Artwork" },
  { value: "clothing-commissions", label: "Clothing" },
  { value: "texture-commissions", label: "Textures" },
  { value: "vrc-setup", label: "VRChat setup" },
  { value: "other", label: "Something else" },
]

const AVAILABILITY = [
  { value: "open", label: "Open for work" },
  { value: "limited", label: "Limited availability" },
  { value: "closed", label: "Booked up" },
]

const EMPTY_FORM = {
  title: "",
  description: "",
  serviceType: "avatar-commissions",
  serviceCategory: "",
  startingPrice: "",
  turnaroundDays: "14",
  availability: "open",
}

/**
 * Commission management.
 *
 * These listings are the same records the public storefront and the
 * /services discovery pages read, so what a creator sets here is what a
 * buyer sees. See the design direction §10.
 */
export default function CreatorCommissionsPage() {
  const [services, setServices] = useState<Service[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/creator/commissions")
      if (!res.ok) throw new Error("request failed")
      const data = await res.json()
      setServices(data.services ?? [])
    } catch {
      setError("We couldn't load your commissions. Please try again.")
      setServices([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFormError(null)
    setSaving(true)

    try {
      const res = await fetch("/api/creator/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          serviceType: form.serviceType,
          serviceCategory: form.serviceCategory || undefined,
          startingPrice: form.startingPrice || 0,
          availability: form.availability,
          turnaroundDays: form.turnaroundDays,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error ?? "Could not save the commission.")
        return
      }

      setServices((prev) => [data.service, ...(prev ?? [])])
      setForm(EMPTY_FORM)
      setOpen(false)
    } catch {
      setFormError("We couldn't reach the server. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(service: Service) {
    setServices((prev) =>
      (prev ?? []).map((s) => (s.id === service.id ? { ...s, isActive: !s.isActive } : s))
    )
    try {
      const res = await fetch(`/api/creator/commissions/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      })
      if (!res.ok) throw new Error("failed")
    } catch {
      // Roll back so the UI never disagrees with the server.
      setServices((prev) =>
        (prev ?? []).map((s) => (s.id === service.id ? { ...s, isActive: service.isActive } : s))
      )
    }
  }

  async function remove(service: Service) {
    if (!window.confirm(`Remove “${service.title}” from your commissions?`)) return

    const previous = services
    setServices((prev) => (prev ?? []).filter((s) => s.id !== service.id))

    try {
      const res = await fetch(`/api/creator/commissions/${service.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("failed")
    } catch {
      setServices(previous)
    }
  }

  if (services === null) return <CreatorDashboardSkeleton />

  return (
    <div className="pv-shell py-8 md:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-[32px]">
            Commissions
          </h1>
          <p className="mt-1 max-w-xl text-sm text-text-muted">
            What you take on, what it costs and how long it takes. Buyers see this
            on your storefront.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add commission
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New commission</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="c-title" className="text-xs text-text-muted">
                  Title
                </Label>
                <Input
                  id="c-title"
                  required
                  maxLength={120}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Full-body avatar with texture and rig"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="c-desc" className="text-xs text-text-muted">
                  Description
                </Label>
                <textarea
                  id="c-desc"
                  rows={3}
                  maxLength={1000}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What the buyer gets, what's included, what you need from them."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-text-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="c-type" className="text-xs text-text-muted">
                    What you make
                  </Label>
                  <select
                    id="c-type"
                    value={form.serviceType}
                    onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm text-text-primary"
                  >
                    {SERVICE_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="c-category" className="text-xs text-text-muted">
                    Category <span className="text-text-muted">(optional)</span>
                  </Label>
                  <Input
                    id="c-category"
                    value={form.serviceCategory}
                    onChange={(e) => setForm({ ...form, serviceCategory: e.target.value })}
                    placeholder="Stylised"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="c-price" className="text-xs text-text-muted">
                    Starting price
                  </Label>
                  <Input
                    id="c-price"
                    type="number"
                    min={0}
                    step="1"
                    required
                    value={form.startingPrice}
                    onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
                    placeholder="40"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="c-turnaround" className="text-xs text-text-muted">
                    Turnaround (days)
                  </Label>
                  <Input
                    id="c-turnaround"
                    type="number"
                    min={1}
                    max={365}
                    required
                    value={form.turnaroundDays}
                    onChange={(e) => setForm({ ...form, turnaroundDays: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="c-availability" className="text-xs text-text-muted">
                  Availability
                </Label>
                <select
                  id="c-availability"
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm text-text-primary"
                >
                  {AVAILABILITY.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <p role="alert" className="text-sm text-error">
                  {formError}
                </p>
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Publish commission"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-lg border border-border bg-surface p-4 text-sm text-error">
          {error}
        </p>
      )}

      <div className="mt-8">
        {services.length === 0 ? (
          <EmptyState
            title="No commissions listed."
            description="Add what you take on so buyers can find you. You can change or remove it whenever you like."
            action={{ label: "Add commission", onClick: () => setOpen(true) }}
          />
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.id} className="flex flex-col">
                <div className={service.isActive ? "" : "opacity-60"}>
                  <CommissionCard
                    listing={{
                      id: service.id,
                      title: service.title,
                      description: service.description,
                      whatTheyMake: [service.serviceCategory, service.serviceType].filter(
                        Boolean
                      ),
                      priceLabel: `From ${formatPrice(service.startingPrice)}`,
                      startingPrice: service.startingPrice,
                      turnaroundDays: service.turnaroundDays,
                      portfolioImages: service.portfolioImages ?? [],
                      rating: 0,
                      reviewCount: 0,
                      completedOrders: 0,
                      availability: service.availability,
                      tags: service.tags ?? [],
                    }}
                  />
                </div>

                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(service)}
                  >
                    {service.isActive ? "Hide" : "Publish"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(service)}
                    aria-label={`Remove ${service.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Link
                    href="/creator/store/settings"
                    className="ml-auto text-xs text-text-muted underline-offset-4 hover:text-text-primary hover:underline"
                  >
                    Edit details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
