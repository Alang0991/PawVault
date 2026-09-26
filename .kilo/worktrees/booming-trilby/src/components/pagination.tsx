import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PaginationProps {
  page: number
  totalPages: number
  searchParams: Record<string, string | undefined>
  basePath?: string
}

export function Pagination({ page, totalPages, searchParams, basePath = "/browse" }: PaginationProps) {
  const buildHref = (p: number) => {
    const params = new URLSearchParams(
      Object.entries(searchParams)
        .filter(([, v]) => v)
        .map(([k, v]) => [k, v as string])
    )
    params.set("page", String(p))
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        asChild={page > 1}
      >
        {page > 1 ? (
          <Link href={buildHref(page - 1)}>Previous</Link>
        ) : (
          <span>Previous</span>
        )}
      </Button>
      <span className="text-xs text-text-muted px-2">
        {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        asChild={page < totalPages}
      >
        {page < totalPages ? (
          <Link href={buildHref(page + 1)}>Next</Link>
        ) : (
          <span>Next</span>
        )}
      </Button>
    </div>
  )
}

Pagination.displayName = "Pagination"