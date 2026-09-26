import { prisma } from "@/lib/prisma"
import { enrichProducts } from "./enrich"

export interface CatalogFilter {
  category?: string
  priceMin?: number
  priceMax?: number
  rating?: number
  tags?: string[]
  free?: boolean
  onSale?: boolean
  featured?: boolean
  creator?: string
  q?: string
  sort?: string
  page?: number
  pageSize?: number
}

export interface CatalogResult {
  products: any[]
  total: number
  categories: any[]
  popularTags: any[]
}

export async function getCatalogProducts(
  filters: CatalogFilter = {},
): Promise<{ products: any[]; total: number }> {
  const page = Math.max(1, filters.page || 1)
  const pageSize = filters.pageSize || 24
  const skip = (page - 1) * pageSize

  const where: any = {
    isPublished: true,
    status: "PUBLISHED",
    creator: {
      creatorStatus: "APPROVED",
      status: "ACTIVE",
      isInternal: false,
      store: { visibility: "PUBLISHED" },
    },
  }

  if (filters.category) {
    where.category = { slug: filters.category }
  }
  if (filters.free) {
    where.isFree = true
  }
  if (filters.onSale) {
    where.isOnSale = true
  }
  if (filters.featured) {
    where.isFeatured = true
  }
  if (filters.creator) {
    where.creator = {
      ...where.creator,
      OR: [
        { username: { contains: filters.creator, mode: "insensitive" } },
        { displayName: { contains: filters.creator, mode: "insensitive" } },
      ],
    }
  }
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ]
  }
  if (filters.priceMin !== undefined) {
    where.price = { ...where.price, gte: filters.priceMin }
  }
  if (filters.priceMax !== undefined) {
    where.price = { ...where.price, lte: filters.priceMax }
  }
  if (filters.tags?.length) {
    where.tags = { some: { tag: { slug: { in: filters.tags } } } }
  }
  if (filters.rating !== undefined && !Number.isNaN(filters.rating)) {
    where.rating = { gte: filters.rating }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        creator: { select: { id: true, username: true, displayName: true, avatar: true } },
        media: { where: { isThumbnail: true }, take: 1 },
        reviews: { select: { rating: true } },
        _count: { select: { favorites: true, reviews: true } },
      },
      orderBy: getSortOrder(filters.sort),
      take: pageSize,
      skip,
    }),
    prisma.product.count({ where }),
  ])

  return { products: enrichProducts(products), total }
}

function getSortOrder(sort?: string): any {
  switch (sort) {
    case "popular":
      return { favorites: { _count: "desc" } }
    case "newest":
      return { createdAt: "desc" }
    case "price-asc":
      return { price: "asc" }
    case "price-desc":
      return { price: "desc" }
    case "rating":
      return { rating: "desc" }
    default:
      return { createdAt: "desc" }
  }
}

export async function getSearchResults(
  query: string,
  limit: number = 24,
): Promise<{ products: any[]; creators: any[]; categories: any[]; tags: any[] }> {
  const trimmed = query.trim()

  const [products, creators, categories, tags] = await Promise.all([
    prisma.product.findMany({
      where: {
        isPublished: true,
        creator: { isInternal: false },
        OR: [
          { title: { contains: trimmed, mode: "insensitive" } },
          { subtitle: { contains: trimmed, mode: "insensitive" } },
        ],
      },
      include: {
        creator: { select: { id: true, username: true, displayName: true, avatar: true } },
        media: { where: { isThumbnail: true }, take: 1 },
        reviews: { select: { rating: true } },
        _count: { select: { favorites: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.user.findMany({
      where: {
        role: { in: ["CREATOR", "VERIFIED_CREATOR"] },
        creatorStatus: "APPROVED",
        status: "ACTIVE",
        isInternal: false,
        store: { visibility: "PUBLISHED" },
        OR: [
          { username: { contains: trimmed, mode: "insensitive" } },
          { displayName: { contains: trimmed, mode: "insensitive" } },
        ],
      },
      select: {
        id: true, username: true, displayName: true, avatar: true,
        salesCount: true, rating: true, isVerified: true,
        store: { select: { name: true, slug: true } },
      },
      orderBy: { salesCount: "desc" },
      take: Math.min(12, limit),
    }),
    prisma.category.findMany({
      where: { name: { contains: trimmed, mode: "insensitive" } },
      take: Math.min(8, limit),
    }),
    prisma.tag.findMany({
      where: { name: { contains: trimmed, mode: "insensitive" } },
      take: Math.min(12, limit),
    }),
  ])

  return {
    products: enrichProducts(products),
    creators,
    categories,
    tags,
  }
}
