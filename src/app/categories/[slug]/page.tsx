export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import { notFound } from "next/navigation"

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
        select: { favorites: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const productsWithRating = products.map((product) => {
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0

    return {
      ...product,
      rating: avgRating,
      reviewCount: product.reviews.length,
    }
  })

  return { category, products: productsWithRating }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { category } = await getCategory(params.slug)
  return {
    title: `${category.name} - Category`,
    description: category.description || `Browse ${category.name} assets on Furmarket`,
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { category, products } = await getCategory(params.slug)

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-slate-600 to-slate-500 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white">{category.name}</h1>
          <p className="text-blue-100 mt-2">
            {category._count.products} assets in this category
          </p>
          {category.description && (
            <p className="mt-2 text-blue-100">{category.description}</p>
          )}
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {category.children.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Subcategories</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/category/${child.slug}`}
                  className="block p-4 rounded-lg border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all bg-card hover:-translate-y-1"
                >
                  <h3 className="font-medium">{child.name}</h3>
                  <p className="text-sm text-muted-foreground">{child._count.products} assets</p>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {products.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No assets in this category yet yet.</p>
        )}
      </div>
    </div>
  )
}
