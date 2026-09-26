import { prisma } from "@/lib/prisma"

export async function validateTaxonomy(categoryId?: string, tagNames?: string[]) {
  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, slug: true, parentId: true, isActive: true },
    })

    if (!category) {
      return { valid: false, error: "CATEGORY_NOT_FOUND", message: "The selected category does not exist." }
    }

    if (!category.isActive) {
      return { valid: false, error: "CATEGORY_INACTIVE", message: "The selected category is no longer available." }
    }
  }

  if (tagNames && tagNames.length > 0) {
    const tags = await prisma.tag.findMany({
      where: {
        OR: tagNames.map((name) => ({
          OR: [
            { name: { equals: name, mode: "insensitive" } },
            { slug: { equals: name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, ""), mode: "insensitive" } },
          ],
        })),
      },
      select: { id: true, name: true, slug: true, isActive: true },
    })

    const invalidTags = tagNames.filter((name) => {
      const normalized = name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "")
      return !tags.some((t) => t.name.toLowerCase() === name.toLowerCase() || t.slug.toLowerCase() === normalized)
    })

    if (invalidTags.length > 0) {
      return {
        valid: false,
        error: "INVALID_TAGS",
        message: `One or more tags are invalid: ${invalidTags.join(", ")}`,
        invalidTags,
      }
    }

    const inactiveTags = tags.filter((t) => !t.isActive)
    if (inactiveTags.length > 0) {
      return {
        valid: false,
        error: "TAGS_INACTIVE",
        message: `One or more tags are no longer available: ${inactiveTags.map((t) => t.name).join(", ")}`,
        invalidTags: inactiveTags.map((t) => t.name),
      }
    }
  }

  return { valid: true }
}

export async function getCanonicalTagIds(tagNames: string[]): Promise<string[]> {
  const tags = await prisma.tag.findMany({
    where: {
      OR: tagNames.map((name) => ({
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          { slug: { equals: name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, ""), mode: "insensitive" } },
        ],
      })),
    },
    select: { id: true },
  })

  return tags.map((t) => t.id)
}

export async function validateSubcategory(categoryId: string, parentId?: string) {
  if (!categoryId || !parentId) return { valid: true }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, parentId: true, isActive: true },
  })

  if (!category) {
    return { valid: false, error: "SUBCATEGORY_NOT_FOUND", message: "The selected subcategory does not exist." }
  }

  if (!category.isActive) {
    return { valid: false, error: "SUBCATEGORY_INACTIVE", message: "The selected subcategory is no longer available." }
  }

  if (category.parentId !== parentId) {
    return { valid: false, error: "SUBCATEGORY_MISMATCH", message: "The selected subcategory does not belong to the chosen category." }
  }

  return { valid: true }
}
