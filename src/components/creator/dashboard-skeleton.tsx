import { cn } from "@/lib/utils"

function Bar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-muted", className)} />
}

/**
 * Skeleton for the creator dashboard.
 *
 * Mirrors the real layout — stat row, then two columns — so nothing
 * jumps when the data lands. See the design direction §16.
 */
export function CreatorDashboardSkeleton() {
  return (
    <div className="pv-shell py-8 md:py-10">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Bar className="h-8 w-48" />
          <Bar className="h-4 w-32" />
        </div>
        <Bar className="h-10 w-32 rounded-lg" />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-4">
            <Bar className="h-4 w-20" />
            <Bar className="mt-2 h-7 w-16" />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Bar className="h-10 w-full max-w-md rounded-lg" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <Bar className="h-5 w-32" />
          <div className="mt-4 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <Bar className="h-4 w-40" />
                  <Bar className="h-3 w-24" />
                </div>
                <Bar className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <Bar className="h-5 w-28" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bar key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
