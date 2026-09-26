export interface EnrichedProduct {
  id: string
  slug: string
  title: string
  price: number
  salePrice?: number | null
  isOnSale?: boolean
  isFree?: boolean
  rating?: number
  reviewCount: number
}

export function enrichProduct<T extends { reviews: Array<{ rating: number }> }>(
  product: T,
): T & { rating: number; reviewCount: number } {
  const reviews = product.reviews || []
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
    : 0
  return {
    ...product,
    rating: avgRating,
    reviewCount: reviews.length,
  }
}

export function enrichProducts<T extends { reviews: Array<{ rating: number }> }>(
  products: T[],
): (T & { rating: number; reviewCount: number })[] {
  return products.map(enrichProduct)
}
