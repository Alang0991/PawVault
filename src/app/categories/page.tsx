export const dynamic = "force-dynamic"

import { prisma } from "@/lib/db"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

async function getCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          products: {
            where: { isPublished: true },
          },
        },
      },
    },
  })
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-slate-600 to-slate-500 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white">Categories</h1>
          <p className="text-blue-100 mt-2 text-lg">Browse VRChat assets by category</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        {categories.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No categories yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
              >
                <div className="p-6 rounded-xl border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all bg-card hover:-translate-y-1">
                  <h3 className="font-semibold text-center text-lg">{category.name}</h3>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                     {category._count.products} assets
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
