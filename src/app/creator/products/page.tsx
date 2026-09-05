import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ProductsList } from "./products-list"

export const dynamic = "force-dynamic"

export default async function CreatorProductsPage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const user = await getServerUser()
  if (!user || !["CREATOR", "VERIFIED_CREATOR", "ADMIN", "OWNER"].includes(user.role)) {
    redirect("/auth/signin")
  }

  const filter = (searchParams.filter || "all").toLowerCase()

  const products = await prisma.product.findMany({
    where: { creatorId: user.id },
    include: {
      category: { select: { name: true } },
      media: {
        where: { isThumbnail: true },
        take: 1,
      },
      _count: {
        select: { reviews: true, files: true, media: true, orderItems: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  const counts = {
    all: products.length,
    drafts: products.filter((p) => !p.isPublished).length,
    published: products.filter((p) => p.isPublished).length,
  }

  const filtered = products.filter((p) => {
    if (filter === "drafts") return !p.isPublished
    if (filter === "published") return p.isPublished
    return true
  })

  const list = filtered.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice,
    isFree: p.isFree,
    isPublished: p.isPublished,
    isOnSale: p.isOnSale,
    category: p.category?.name ?? null,
    thumbnail: p.media[0]?.url ?? null,
    fileCount: p._count.files,
    mediaCount: p._count.media,
    salesCount: p._count.orderItems,
    reviewCount: p._count.reviews,
    updatedAt: p.updatedAt.toISOString(),
    createdAt: p.createdAt.toISOString(),
  }))

  return <ProductsList products={list} counts={counts} activeFilter={filter} />
}
