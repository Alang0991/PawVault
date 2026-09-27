import { prisma } from "@/lib/prisma"
import type { CommissionListing } from "@/components/storefront/commission-card"

/**
 * A creator's commission offerings, normalised across the three
 * commission models so the storefront renders one consistent list.
 *
 * The schema models commissions three ways — ServiceProvider,
 * AvatarCommissioner and ArtCommissioner — so this is the one place
 * that knows about the difference. See the design direction §10.
 */
export async function getCreatorCommissions(userId: string): Promise<CommissionListing[]> {
  const [providers, avatar, art] = await Promise.all([
    prisma.serviceProvider.findMany({
      where: { userId, isActive: true },
      orderBy: [{ isFeatured: "desc" }, { rating: "desc" }],
    }),
    prisma.avatarCommissioner.findUnique({
      where: { userId },
      include: { pricing: true },
    }),
    prisma.artCommissioner.findUnique({
      where: { userId },
      include: { pricing: true },
    }),
  ])

  const listings: CommissionListing[] = []

  for (const provider of providers) {
    listings.push({
      id: provider.id,
      title: provider.title,
      description: provider.description,
      whatTheyMake: [provider.serviceCategory, provider.serviceType].filter(Boolean),
      startingPrice: provider.startingPrice,
      priceLabel: provider.startingPrice
        ? `From ${formatPrice(provider.startingPrice, provider.currency)}`
        : null,
      turnaroundDays: provider.turnaroundDays,
      portfolioImages: provider.portfolioImages ?? [],
      rating: provider.rating,
      reviewCount: provider.reviewCount,
      completedOrders: provider.completedOrders,
      availability: provider.availability,
      tags: provider.tags ?? [],
    })
  }

  if (avatar?.isActive) {
    listings.push({
      id: avatar.id,
      title: "Avatar commissions",
      description: avatar.bio,
      whatTheyMake: avatar.commissionTypes.length > 0 ? avatar.commissionTypes : avatar.categories,
      priceLabel: minPricingLabel(avatar.pricing),
      turnaroundDays: avatar.turnaroundDays,
      portfolioImages: avatar.portfolioImages ?? [],
      rating: avatar.rating,
      reviewCount: avatar.reviewCount,
      completedOrders: avatar.completedCommissions,
      availability: avatar.availability,
      openSlots: avatar.openSlots,
      tags: avatar.tags ?? [],
    })
  }

  if (art?.isActive) {
    listings.push({
      id: art.id,
      title: "Art commissions",
      description: art.bio,
      whatTheyMake: art.commissionTypes.length > 0 ? art.commissionTypes : art.categories,
      priceLabel: minPricingLabel(art.pricing),
      turnaroundDays: art.turnaroundDays,
      portfolioImages: art.portfolioImages ?? [],
      rating: art.rating,
      reviewCount: art.reviewCount,
      completedOrders: art.completedCommissions,
      availability: art.availability,
      openSlots: art.openSlots,
      tags: art.tags ?? [],
    })
  }

  return listings
}

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${amount}`
  }
}

/** "From £40" across the tiered pricing rows a commissioner defines. */
function minPricingLabel(
  pricing: { minPrice: number; currency: string }[] | undefined
): string | null {
  if (!pricing || pricing.length === 0) return null
  const lowest = pricing.reduce((min, tier) =>
    tier.minPrice < min.minPrice ? tier : min
  )
  return `From ${formatPrice(lowest.minPrice, lowest.currency)}`
}

/**
 * Buyer reviews for a creator's work.
 *
 * Reviews are recorded against products, not against creators, so this
 * aggregates the reviews left across a creator's published catalogue.
 * That is the honest signal available — the storefront shows it as
 * product reviews rather than pretending there is a separate creator
 * review record.
 */
export async function getCreatorReviews(userId: string, take = 8) {
  return prisma.review.findMany({
    where: {
      isReported: false,
      product: { creatorId: userId, isPublished: true },
    },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      rating: true,
      title: true,
      content: true,
      isVerified: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
        },
      },
      product: {
        select: { title: true, slug: true },
      },
    },
  })
}
