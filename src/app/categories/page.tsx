export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { SectionHeader } from "@/components/section-header"
import { CategoryCard } from "@/components/category-card"
import { Package } from "lucide-react"

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <SectionHeader
          title="Categories"
          subtitle="Browse assets by category"
          icon={<Package className="h-5 w-5 text-text-muted" />}
        />

        {categories.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No categories yet. New sections are added as the marketplace grows.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
