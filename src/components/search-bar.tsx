"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import Link from "next/link"

interface Suggestion {
  type: "product" | "creator"
  id: string
  title: string
  subtitle?: string
  href: string
  image?: string
}

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setOpen(false)
      return
    }

    const timeout = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=5`)
        const data = await res.json()
        const items: Suggestion[] = [
          ...(data.products || []).slice(0, 5).map((p: any) => ({
            type: "product" as const,
            id: p.id,
            title: p.title,
            subtitle: p.creator?.displayName || p.creator?.username,
            href: `/product/${p.slug}`,
            image: p.media?.[0]?.url,
          })),
          ...(data.creators || []).slice(0, 3).map((c: any) => ({
            type: "creator" as const,
            id: c.id,
            title: c.displayName || c.username,
            subtitle: "Creator",
            href: c.store?.slug ? `/store/${c.store.slug}` : `/profile/${c.username}`,
            image: c.avatar || undefined,
          })),
        ]
        setSuggestions(items)
        setOpen(true)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timeout)
  }, [query])

  const go = (q: string) => {
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setOpen(false)
    go(query)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
      router.push(suggestions[activeIndex].href)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="w-full max-w-xl mx-auto relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search assets, creators, and more..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(-1)
            }}
            onKeyDown={onKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            className="pl-9 pr-9 py-2 w-full"
            autoComplete="off"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <Link
              key={`${s.type}-${s.id}`}
              href={s.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 text-sm ${
                i === activeIndex ? "bg-muted" : "hover:bg-muted"
              }`}
            >
              {s.image ? (
                <img src={s.image} alt="" className="h-8 w-8 rounded object-cover" />
              ) : (
                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs">
                  {s.type === "creator" ? "C" : "P"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{s.title}</p>
                {s.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">{s.subtitle}</p>
                )}
              </div>
              <span className="text-[10px] uppercase text-muted-foreground">{s.type}</span>
            </Link>
          ))}
          <button
            type="button"
            onClick={() => go(query)}
            className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-muted border-t"
          >
            See all results for &quot;{query}&quot;
          </button>
        </div>
      )}
    </div>
  )
}
