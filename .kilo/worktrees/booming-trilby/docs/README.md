# Pawvault (local development)

## OAuth provider setup

1. Register applications in Google and Discord developer consoles.
2. Set the callback/redirect URIs to (use the dev port your app runs on, default 3000 or fallback 3001):

- `https://pawvault.co.uk/api/auth/callback/google`
- `https://pawvault.co.uk/api/auth/callback/discord`

If you are using local development, use `http://localhost:3000` or your local port in the provider dashboard and in your `.env`.

## .env entries

Add these to your `.env` (or `.env.local`) for production or hosted deployments:

```
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
NEXTAUTH_URL="https://pawvault.co.uk"
NEXTAUTH_SECRET="<generate-a-secret>"
```

Also see `.env.example` for other optional settings used by the project.

## Moderation access

- The `/moderation` page is server-protected. Only users with `role` equal to `ADMIN` or `MODERATOR` may access it.
- Roles are stored on the user record in the database and propagated to the session JWT.

To assign a moderator, update the `role` field for the user in the database (via Prisma or your admin UI).

## Phase 3 — Adult / NSFW content support

Adult content is **allowed** on PawVault, but is presented with user-controlled blur previews so viewers are never shown explicit imagery by accident.

### Content rating (per product)

Every product has a `contentRating` field with one of:

- `SFW` — safe for general audiences
- `MATURE` — mature or suggestive themes
- `NSFW` — adult-oriented content

Creators set the rating in the Product Editor. NSFW products are *not* hidden from the marketplace, search, or storefronts — they simply get a blurred preview by default. There is no automatic rejection of legitimate adult content.

### Blurred previews

- A reusable `AdultContentPreview` component (`src/components/adult-content-preview.tsx`) is the single source of truth for product images, gallery thumbnails, search results, category pages, collection pages and storefronts.
- For NSFW images, the original storage URL is **never** exposed to viewers without authorization. Instead the UI requests `/api/preview/<mediaId>`, which:
  - serves the original (via 302) when the viewer is signed in **and** has adult content enabled
  - otherwise returns a server-rendered blurred SVG (gradient + 18+ badge + product initials) so the original asset URL is not leaked
- Each NSFW preview has a `Show preview` button (if adult content is enabled) or `Enable adult content` / `Sign in` (if not).
- The 18+ badge is shown on every revealed adult image as well.

### User preferences

- `UserPreference` model (`/api/account/preferences`, `PATCH /api/account/preferences/update`) stores `showAdultContent` and `blurNsfwPreviews`.
- The default is conservative: `showAdultContent = false`, `blurNsfwPreviews = true`.
- Enabling adult content requires an explicit `confirm: true` flag and stores `adultConfirmedAt`.
- A dedicated UI lives at `/account/content-settings` and is linked from `/account/settings`.
- Preferences are cached client-side for 30s to avoid hammering the API on every product card render.

### Downloads

- The existing `/api/products/files/[id]/download` route (auth + ownership / purchase check) is **not** modified. NSFW products download normally for legitimate buyers.
- File access, version access, licenses and updates are unaffected by content rating.

### Database

Migration: `prisma/migrations/20260904130000_add_content_rating_and_preferences/`

- New enum `ContentRating` (`SFW | MATURE | NSFW`)
- `Product.contentRating` (default `SFW`) with index
- New `UserPreference` model (1:1 with `User`), cascade delete

### What was NOT changed

- Payments / Stripe
- Moderation dashboard
- Public marketplace layout
- Existing SFW product behavior — unchanged
- Existing reviews, wishlist, cart, collections

### Known issues / future work

- The blurred preview is a generated SVG (no actual server-side image manipulation). Right-click → open in new tab on a blurred card still hits `/api/preview/<mediaId>`, which correctly returns the SVG for unauthorized users. This is the security boundary.
- A future `MATURE` tier could apply a lighter blur (or a warning badge without a blur).
- A proper age verification flow (e.g. third-party KYC) can be added by extending the `adultConfirmedAt` flow without schema changes.
