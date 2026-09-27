import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

/**
 * Trending is calculated, not curated.
 *
 * A single weighted score over the signals that actually indicate
 * demand — recent paid sales, recent downloads, favourites, recent
 * views, plus a small freshness term so a quiet catalogue still has
 * something to show. See the design direction §5: PawVault should not
 * need staff maintaining a picks shelf, and §7 lists Trending as the
 * marketplace default sort.
 *
 * Ranking happens in SQL, then products are hydrated through Prisma so
 * the product card still gets its creator, thumbnail and review data.
 */

/**
 * Returns product ids ordered by trending score, highest first.
 *
 * @param limit     how many ranked ids to return
 * @param excludeIds ids to leave out (already shown in another section)
 * @param onlyIds   restrict ranking to a candidate set (used by Explore,
 *                  where the caller's own filters define the candidate pool)
 */
export async function getTrendingProductIds(
  limit: number,
  excludeIds: string[] = [],
  onlyIds?: string[],
): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ id: string; score: number }[]>(Prisma.sql`
    WITH recent_sales AS (
      SELECT oi."productId" AS id, COUNT(*)::int AS n
      FROM "OrderItem" oi
      JOIN "Order" o ON o.id = oi."orderId"
      WHERE o."paidAt" IS NOT NULL
        AND o."paidAt" >= NOW() - INTERVAL '30 days'
      GROUP BY oi."productId"
    ),
    recent_downloads AS (
      SELECT d."productId" AS id, COUNT(*)::int AS n
      FROM "Download" d
      WHERE d."downloadedAt" >= NOW() - INTERVAL '30 days'
      GROUP BY d."productId"
    ),
    total_favorites AS (
      SELECT f."productId" AS id, COUNT(*)::int AS n
      FROM "Favorite" f
      GROUP BY f."productId"
    ),
    recent_views AS (
      SELECT rv."productId" AS id, COUNT(*)::int AS n
      FROM "RecentlyViewed" rv
      WHERE rv."viewedAt" >= NOW() - INTERVAL '7 days'
      GROUP BY rv."productId"
    )
    SELECT
      p.id AS id,
      (
        COALESCE(rs.n, 0) * 5
        + COALESCE(rd.n, 0) * 2
        + COALESCE(tf.n, 0) * 2
        + COALESCE(rv.n, 0)
        + CASE
            WHEN p."createdAt" >= NOW() - INTERVAL '7 days'  THEN 5
            WHEN p."createdAt" >= NOW() - INTERVAL '30 days' THEN 3
            WHEN p."createdAt" >= NOW() - INTERVAL '90 days' THEN 1
            ELSE 0
          END
      )::float AS score
    FROM "Product" p
    JOIN "User" c ON c.id = p."creatorId"
    LEFT JOIN recent_sales rs ON rs.id = p.id
    LEFT JOIN recent_downloads rd ON rd.id = p.id
    LEFT JOIN total_favorites tf ON tf.id = p.id
    LEFT JOIN recent_views rv ON rv.id = p.id
    WHERE p."isPublished" = true
      AND c."isInternal" = false
      AND NOT (p.id = ANY(${excludeIds}::text[]))
      ${onlyIds ? Prisma.sql`AND p.id = ANY(${onlyIds}::text[])` : Prisma.empty}
    ORDER BY score DESC, p."createdAt" DESC
    LIMIT ${limit}
  `)

  return rows.map((row) => row.id)
}
