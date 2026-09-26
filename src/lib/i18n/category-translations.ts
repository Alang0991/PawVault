import type { TranslationKeys } from "./translations/en"

export const categoryTranslationKeys: Record<string, keyof TranslationKeys["home"]> = {
  "3d-assets": "threeDAssets",
  "animation-expressions": "animationExpressions",
  avatars: "avatars",
  "clothing-accessories": "clothingAccessories",
  "creator-resources": "creatorResources",
  "materials-textures": "materialsTextures",
  "particles-vfx": "particlesVfx",
  free: "free",
}

export function getCategoryTranslationKey(slug: string): keyof TranslationKeys["home"] | null {
  return categoryTranslationKeys[slug.toLowerCase()] ?? null
}

export function getCategoryTranslationKeyOrFallback(slug: string): string {
  return categoryTranslationKeys[slug.toLowerCase()] ?? slug
}

export function translateCategory(
  translations: TranslationKeys,
  slug: string,
  fallbackName: string,
): string {
  const key = getCategoryTranslationKey(slug)
  if (key) {
    const value = translations.home[key]
    if (typeof value === "string") return value
  }
  return fallbackName
}