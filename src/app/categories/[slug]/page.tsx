export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ProductGrid } from "@/components/product-grid"
import { SectionHeader } from "@/components/section-header"
import { CategoryCard } from "@/components/category-card"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"

async function getCategory(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: {
        include: {
          _count: {
            select: {
              products: {
                where: { isPublished: true },
              },
            },
          },
        },
      },
      _count: {
        select: {
          products: {
            where: { isPublished: true },
          },
        },
      },
    },
  })

  if (!category) {
    notFound()
  }

  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      isPublished: true,
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          isVerified: true,
        },
      },
      media: {
        where: { isThumbnail: true },
        take: 1,
      },
      reviews: {
        select: { rating: true },
      },
      _count: {
        select: { favorites: true, reviews: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const productsWithRating = products.map((p: any) => {
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length
        : 0
    return { ...p, rating: avgRating, reviewCount: p.reviews.length }
  })

  return { category, products: productsWithRating }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { category } = await getCategory(params.slug)
  return {
    title: `${category.name} - Category | PawVault`,
    description: category.description || `Browse ${category.name} on PawVault.`,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  const { category, products } = await getCategory(params.slug)
  const productName = category._count.products === 1 ? "product" : "products"

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            {category.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <Badge variant="subtle">{category._count.products} {productName}</Badge>
            {category.description && (
              <span>{category.description}</span>
            )}
          </div>
        </div>

        {category.children.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Subcategories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {category.children.map((child) => (
                <CategoryCard key={child.id} category={child} />
              ))}
            </div>
          </section>
        )}

        <SectionHeader
          title="Products"
          subtitle={`${category._count.products} ${productName} in this category`}
        />

        <ProductGrid
          products={products}
          emptyMessage="No products in this category yet. Check back soon."
        />
      </div>
    </div>
  )
}
