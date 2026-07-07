import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const metadata = {
  title: "API Documentation | PawVault",
  description:
    "Reference for the PawVault REST API: authentication, products, cart, checkout, orders, licenses, reviews, notifications, and search.",
}

type Method = "GET" | "POST" | "PUT" | "DELETE"

interface Endpoint {
  method: Method
  path: string
  description: string
  auth?: boolean
  example?: string
}

const groups: { title: string; id: string; endpoints: Endpoint[] }[] = [
  {
    title: "Authentication",
    id: "auth",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/register",
        description: "Create an account with email, username, and password. Sends a verification email.",
        example: `{
  "email": "buyer@email.com",
  "username": "buyer",
  "password": "s3cret!",
  "confirmPassword": "s3cret!"
}`,
      },
      {
        method: "POST",
        path: "/api/auth/forgot-password",
        description: "Send a password-reset token to the user's email.",
      },
      {
        method: "POST",
        path: "/api/auth/reset-password",
        description: "Complete a password reset using the emailed token.",
      },
      {
        method: "GET",
        path: "/api/auth/verify-email?token=...",
        description: "Verify an email address from the link sent during registration.",
      },
      {
        method: "POST",
        path: "/api/auth/logout",
        description: "End the current session and clear the auth cookie.",
      },
      {
        method: "GET",
        path: "/api/auth/session",
        description: "Return the current session (NextAuth). Used by the client to know if a user is signed in.",
      },
    ],
  },
  {
    title: "Users & Profile",
    id: "users",
    endpoints: [
      {
        method: "GET",
        path: "/api/user/profile",
        auth: true,
        description: "Get the authenticated user's profile.",
      },
      {
        method: "PUT",
        path: "/api/user/profile",
        auth: true,
        description: "Update display name, bio, social links, and privacy settings.",
      },
      {
        method: "GET",
        path: "/api/user/wishlist",
        auth: true,
        description: "List the user's wishlisted products.",
      },
      {
        method: "POST",
        path: "/api/user/wishlist",
        auth: true,
        description: "Add a product to the wishlist. Body: { productId }.",
      },
      {
        method: "DELETE",
        path: "/api/user/wishlist?productId=...",
        auth: true,
        description: "Remove a product from the wishlist.",
      },
    ],
  },
  {
    title: "Products",
    id: "products",
    endpoints: [
      {
        method: "GET",
        path: "/api/products",
        description:
          "List published products with filters. Query: category, search, sort, page, limit, priceMin, priceMax, rating, tags, free, onSale, creator.",
        example: `GET /api/products?category=avatars&sort=price-asc&page=1&limit=24
{
  "products": [ { "id": "cld...", "title": "Neon Fox", "price": 12.0, "rating": 4.7 } ],
  "pagination": { "page": 1, "limit": 24, "total": 318, "totalPages": 14 }
}`,
      },
      {
        method: "GET",
        path: "/api/products/[slug]",
        description: "Get full product details including media, files, reviews, and creator.",
      },
      {
        method: "POST",
        path: "/api/products",
        auth: true,
        description: "Create a product (creator only). Handles slug generation and tag upserts.",
      },
      {
        method: "GET",
        path: "/api/products/featured",
        description: "Admin-curated featured products for the homepage.",
      },
      {
        method: "GET",
        path: "/api/products/[slug]/reviews",
        description: "Paginated, verified reviews for a product with average rating.",
      },
    ],
  },
  {
    title: "Uploads & Media",
    id: "uploads",
    endpoints: [
      {
        method: "POST",
        path: "/api/media/upload",
        auth: true,
        description: "Upload images/videos. Returns a CDN URL and generates a thumbnail.",
      },
      {
        method: "POST",
        path: "/api/products/files",
        auth: true,
        description: "Attach downloadable files to a product (drag-and-drop, resumable).",
      },
      {
        method: "DELETE",
        path: "/api/media/[id]",
        auth: true,
        description: "Delete a media asset.",
      },
    ],
  },
  {
    title: "Cart & Checkout",
    id: "cart",
    endpoints: [
      {
        method: "GET",
        path: "/api/cart",
        description: "Get the current cart (user or guest session).",
      },
      {
        method: "POST",
        path: "/api/cart",
        description: "Add a product to the cart. Body: { productId, quantity }.",
      },
      {
        method: "PUT",
        path: "/api/cart/items/[id]",
        description: "Update an item's quantity (min 1, max 100).",
      },
      {
        method: "DELETE",
        path: "/api/cart/items/[id]",
        description: "Remove an item from the cart.",
      },
      {
        method: "POST",
        path: "/api/cart/coupon",
        description: "Apply a coupon code. Body: { code }.",
      },
      {
        method: "POST",
        path: "/api/checkout",
        description: "Create a Stripe Checkout session for the cart. Returns orderId and Stripe URL.",
        example: `POST /api/checkout
{ "cartId": "cld...", "couponCode": "SUMMER10" }
→ { "orderId": "ord...", "url": "https://checkout.stripe.com/..." }`,
      },
    ],
  },
  {
    title: "Orders & Refunds",
    id: "orders",
    endpoints: [
      {
        method: "GET",
        path: "/api/orders",
        auth: true,
        description: "List the user's orders with items, payments, and licenses.",
      },
      {
        method: "POST",
        path: "/api/orders/[id]/refund",
        auth: true,
        description: "Request a refund. Body: { reason, items? }. Creates a PENDING refund and notifies the buyer.",
      },
    ],
  },
  {
    title: "Licenses",
    id: "licenses",
    endpoints: [
      {
        method: "GET",
        path: "/api/licenses",
        auth: true,
        description: "List the user's (or, for admins, all) license keys with product info.",
      },
      {
        method: "POST",
        path: "/api/licenses/generate",
        auth: true,
        description: "Generate a license for a completed order. Body: { productId, orderId, userId?, expiresAt? }.",
      },
      {
        method: "GET",
        path: "/api/licenses/validate?key=XXX",
        description: "Public validation. Checks existence, revocation, and expiry. Rate-limited to 100 req/min.",
        example: `GET /api/licenses/validate?key=PV-AB12-CD34-EF56
{
  "valid": true,
  "license": { "key": "PV-AB12-CD34-EF56", "status": "ACTIVE", "product": { "slug": "neon-fox" } }
}`,
      },
    ],
  },
  {
    title: "Reviews",
    id: "reviews",
    endpoints: [
      {
        method: "POST",
        path: "/api/reviews",
        auth: true,
        description: "Create a review. Verified flag is set if the user owns the product. Body: { productId, rating, title?, content? }.",
      },
      {
        method: "PUT",
        path: "/api/reviews/[id]",
        auth: true,
        description: "Edit your review (within 30 days).",
      },
      {
        method: "DELETE",
        path: "/api/reviews/[id]",
        auth: true,
        description: "Delete your review (within 30 days).",
      },
    ],
  },
  {
    title: "Notifications",
    id: "notifications",
    endpoints: [
      {
        method: "GET",
        path: "/api/notifications",
        auth: true,
        description: "List the user's notifications plus an unreadCount. Add ?unread=true to filter.",
      },
      {
        method: "PUT",
        path: "/api/notifications/[id]/read",
        auth: true,
        description: "Mark a notification as read.",
      },
      {
        method: "DELETE",
        path: "/api/notifications/[id]",
        auth: true,
        description: "Delete a notification.",
      },
    ],
  },
  {
    title: "Search & Discovery",
    id: "search",
    endpoints: [
      {
        method: "GET",
        path: "/api/search?q=...",
        description: "Full-text search across products and creators. Query: q, type (all|products|creators), limit, offset.",
        example: `GET /api/search?q=fox&limit=5
{
  "products": [ { "title": "Neon Fox", "slug": "neon-fox" } ],
  "creators": [ { "username": "foxtail" } ]
}`,
      },
      {
        method: "GET",
        path: "/api/creators/trending",
        description: "Top creators ranked by recent sales and followers.",
      },
      {
        method: "GET",
        path: "/api/categories",
        description: "All categories with product counts.",
      },
      {
        method: "GET",
        path: "/api/categories/[slug]",
        description: "A single category with its products and subcategories.",
      },
      {
        method: "GET",
        path: "/api/stores/[slug]",
        description: "Public storefront data: products, collections, and reviews summary.",
      },
    ],
  },
]

const methodColors: Record<Method, string> = {
  GET: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  POST: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  PUT: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 gradient-text">API Documentation</h1>
          <p className="text-muted-foreground max-w-2xl">
            The PawVault REST API is organized around resource-oriented URLs and
            returns JSON. Most write endpoints require an authenticated session
            (marked <Badge variant="outline" className="ml-1">auth</Badge>).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <nav className="lg:col-span-1">
            <div className="sticky top-4 space-y-1">
              {groups.map((g) => (
                <a
                  key={g.id}
                  href={`#${g.id}`}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-white dark:hover:bg-gray-900 hover:text-foreground"
                >
                  {g.title}
                </a>
              ))}
            </div>
          </nav>

          {/* Endpoints */}
          <div className="lg:col-span-3 space-y-10">
            {groups.map((g) => (
              <section key={g.id} id={g.id}>
                <h2 className="text-2xl font-bold mb-4">{g.title}</h2>
                <div className="space-y-4">
                  {g.endpoints.map((e) => (
                    <Card key={e.method + e.path}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${methodColors[e.method]}`}
                          >
                            {e.method}
                          </span>
                          <code className="text-sm font-mono">{e.path}</code>
                          {e.auth && (
                            <Badge variant="outline" className="text-xs">
                              auth
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">{e.description}</p>
                        {e.example && (
                          <pre className="mt-3 rounded-md bg-gray-900 text-gray-100 text-xs p-3 overflow-x-auto">
                            <code>{e.example}</code>
                          </pre>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}

            <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-1">Rate limiting</h3>
                <p className="text-sm text-muted-foreground">
                  Public endpoints are rate-limited per IP (e.g. license validation
                  at 100 req/min). Authenticated requests include{" "}
                  <code>X-RateLimit-Remaining</code> headers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="text-sm text-purple-600 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
