import { prisma } from "@/lib/prisma"
import { GiftCard } from "@/components/gift-card"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function GiftCardsPage() {
  const giftCards = await prisma.giftCard.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      type: true,
      value: true,
      currency: true,
      maxUses: true,
      usedCount: true,
      minPurchase: true,
      startsAt: true,
      endsAt: true,
      isActive: true,
      createdAt: true,
      createdById: true,
      createdBy: { select: { id: true, username: true, displayName: true } },
    },
  })

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gift Cards</h1>
          <p className="text-muted-foreground">
            Gift a PawVault product or store credit to friends and fellow creators.
          </p>
        </div>

        {giftCards.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold mb-1">No gift cards available</h3>
            <p className="text-sm text-muted-foreground">
              Gift cards will appear here once creators or founders create them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {giftCards.map((gc) => (
              <GiftCard key={gc.id} giftCard={gc} />
            ))}
          </div>
        )}

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Have a gift card code? <Link href="/checkout" className="text-blue-600 hover:underline">Redeem it at checkout</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
