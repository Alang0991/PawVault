/** Compact counts for stats rows: 1200 -> "1.2K", 3_400_000 -> "3.4M". */
export function formatCount(value: number): string {
  if (!Number.isFinite(value)) return "0"
  const abs = Math.abs(value)
  if (abs < 1000) return String(value)

  const units: [number, string][] = [
    [1_000_000_000, "B"],
    [1_000_000, "M"],
    [1000, "K"],
  ]

  for (const [threshold, suffix] of units) {
    if (abs >= threshold) {
      const scaled = value / threshold
      // One decimal below 10, rounded above, so columns stay aligned.
      return `${Math.abs(scaled) >= 10 ? Math.round(scaled) : Math.round(scaled * 10) / 10}${suffix}`
    }
  }

  return String(value)
}

/** "1 product" / "2 products" without pulling in a pluralisation library. */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${formatCount(count)} ${count === 1 ? singular : plural}`
}
