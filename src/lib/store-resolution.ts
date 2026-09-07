import { prisma } from "@/lib/prisma"

export type StoreResolutionResult =
  | { status: "STORE_FOUND"; store: { id: string; slug: string; name: string; visibility: string } }
  | { status: "STORE_NOT_FOUND" }
  | { status: "NOT_AUTHENTICATED" }
  | { status: "NOT_CREATOR" }
  | { status: "CREATOR_NOT_APPROVED"; creatorStatus: string }
  | { status: "CREATOR_SUSPENDED" }
  | { status: "STORE_SUSPENDED" }
  | { status: "USER_SUSPENDED" }
  | { status: "USER_BANNED" }
  | { status: "DATABASE_ERROR"; error: string }

export async function resolveCreatorStore(userId: string): Promise<StoreResolutionResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        status: true,
        creatorStatus: true,
        store: {
          select: {
            id: true,
            slug: true,
            name: true,
            visibility: true,
          },
        },
      },
    })

    if (!user) {
      return { status: "NOT_AUTHENTICATED" }
    }

    if (user.status === "BANNED") {
      return { status: "USER_BANNED" }
    }

    if (user.status === "SUSPENDED") {
      return { status: "USER_SUSPENDED" }
    }

    if (!["APPROVED", "SUSPENDED", "BANNED"].includes(user.creatorStatus)) {
      return { status: "CREATOR_NOT_APPROVED", creatorStatus: user.creatorStatus }
    }

    if (user.creatorStatus === "SUSPENDED") {
      return { status: "CREATOR_SUSPENDED" }
    }

    if (!user.store) {
      return { status: "STORE_NOT_FOUND" }
    }

    if (user.store.visibility === "SUSPENDED") {
      return { status: "STORE_SUSPENDED" }
    }

    return {
      status: "STORE_FOUND",
      store: user.store,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return { status: "DATABASE_ERROR", error: message }
  }
}

export async function resolveCreatorStoreByUserId(
  userId: string
): Promise<StoreResolutionResult> {
  return resolveCreatorStore(userId)
}

export function isCreatorApproved(creatorStatus: string | null | undefined): boolean {
  return creatorStatus === "APPROVED"
}

export function canCreateStore(creatorStatus: string | null | undefined): boolean {
  return creatorStatus === "APPROVED"
}

export function getCreatorStatusMessage(result: StoreResolutionResult): string | null {
  switch (result.status) {
    case "NOT_AUTHENTICATED":
      return "You need to sign in first."
    case "NOT_CREATOR":
      return "You are not registered as a creator."
    case "CREATOR_NOT_APPROVED":
      return `Your creator application is "${result.creatorStatus}". Please wait for approval.`
    case "CREATOR_SUSPENDED":
      return "Your creator account is suspended."
    case "USER_SUSPENDED":
      return "Your account is suspended."
    case "USER_BANNED":
      return "Your account is banned."
    case "STORE_SUSPENDED":
      return "Your store is suspended."
    case "DATABASE_ERROR":
      return `Unable to load store: ${result.error}`
    case "STORE_NOT_FOUND":
      return null
    case "STORE_FOUND":
      return null
    default:
      return "Unknown error occurred."
  }
}

export function getStoreUrl(result: StoreResolutionResult): string | null {
  if (result.status === "STORE_FOUND") {
    return `/store/${result.store.slug}`
  }
  return null
}

export function getStoreCreationUrl(): string {
  return "/store/create"
}
