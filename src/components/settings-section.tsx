import { cn } from "@/lib/utils"

/**
 * One settings section: a heading, optional supporting line, content.
 *
 * The settings page previously drew its own icon-prefixed heading for
 * each block, which meant the same icon appeared for two different
 * sections. The heading is now just a heading — see the design
 * direction §12 for the type scale.
 */
export function SettingsSection({
  title,
  description,
  tone = "default",
  children,
  className,
}: {
  title: string
  description?: string
  /** "danger" is reserved for destructive sections like account deletion. */
  tone?: "default" | "danger"
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "border-t border-border pt-8 first:border-t-0 first:pt-0",
        tone === "danger" && "border-destructive/30",
        className
      )}
    >
      <h2
        className={cn(
          "text-xl font-bold tracking-tight",
          tone === "danger" ? "text-destructive" : "text-text-primary"
        )}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-text-muted">{description}</p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  )
}
