# PawVault — What Needs To Be Implemented

> Derived from `docs/PawVault_DOCUMENTATION_IMPLEMENTATION_AUDIT.md` (dated 2026-09-12).
> Source audit is **946 lines**. This document lists everything still unimplemented or incomplete, grouped by priority.
> Specs `03`, `04`, `06`, `07`, `08`, `09`, `10` are marked **fully implemented** in the audit; their FUTURE subsections remain open.

---

## 1. CRITICAL — Production Database Alignment (Blocking)

These items crash production routes every time the affected query runs. They are NOT code bugs — they require applying `prisma/migration_drift_fix.sql` to the live database.

| # | Model / Table | Missing Object | Affected Route(s) | Error |
|---|---------------|----------------|-------------------|-------|
| 1 | `ProductVersion` | `isCurrent`, `isPrerelease` columns | `/product/[slug]` | P2022 column does not exist |
| 2 | `Announcement` | Entire table | `/` (homepage) | P2021 table does not exist |
| 3 | `SiteSetting` | Entire table | `/api/admin/settings` | P2021 table does not exist |
| 4 | `ModerationNote` | Entire table | `/moderation/*` | P2021 table does not exist |
| 5 | `PrivacySettings` | Entire table | `/settings`, privacy pages | P2021 table does not exist |
| 6 | `RecentlyViewed` | Entire table | `/api/user/recently-viewed`, `/wishlist` | P2021 table does not exist |

**Required actions:**
1. Apply `prisma/migration_drift_fix.sql` to production.
2. Verify `prisma_migrations` table lists the migration.
3. Verify StaffPick migration `20260908000000_add_missing_schema_objects` is applied.
4. Smoke-test: `/`, `/browse`, `/creators`, `/product/[slug]`, `/search`, `/store/[slug]`, `/admin`, `/moderation`.

---

## 2. CRITICAL — Deployment Process Gate (Prevents Recurrence)

| Issue | Source | Fix |
|-------|--------|-----|
| Code was deployed (`bd0c2d3`) that queries schema objects before production had them | `00_CURRENT_REPAIR_FOUNDATION.md §38-39` | Add a pre-deploy gate: `prisma db pull` + diff check against production before any deploy that changes Prisma schema. |

---

## 3. IMPORTANT — Current-Platform Gaps (Spec-Required) — IMPLEMENTATION STARTED

### ✅ Implemented (2026-09-13)

| # | Feature | Spec | Gap | Resolution |
|---|---------|------|-----|------------|
| 1 | Route-level error boundaries | Multiple | Only root `error.tsx` exists | ✅ Added `error.tsx` for `/dashboard`, `/account`, `/orders`, `/creator` |
| 3 | Announcement display on homepage | `08_publishing_...` | Model + admin API built; rendering blocked until migration | Codebase already fetches & renders announcements with try/catch resilience. Blocked only by DB migration. |
| 4 | Public-facing site settings UI | `06_founder_hub.md` | No public settings page | ✅ Created `/site-settings` page + `/api/site-settings` public API (exposes brand name, colors, currencies, languages, maintenance mode) |
| 5 | Moderation notes UI | `07_permissions_...` | `ModerationNote` model exists; no staff UI | ✅ Created `/api/admin/moderation/notes` (GET/POST) + `/admin/founder/moderation/notes` page. Integrated notes into user detail page (`/admin/founder/users/[id]`) and moderation queue (report rows link to notes) |
| 6 | Product versioning UI | `02_marketplace...`, `03_creator_system.md` | `ProductVersion` model + API exist; no creator UI | ✅ Created `/creator/products/[id]/versions` page. Added Versions button to product row in `/creator/products`. Added DELETE endpoint to versions API. |
| 11 | Search suggestions / autocomplete | `02_marketplace...` | Basic search exists; no suggestions | ✅ Created `/api/search/suggestions` endpoint. Returns product/creator/category suggestions + popular queries from SearchAnalytics. Spelling tolerance still FUTURE. |

### ⚠️ Still Open

| # | Feature | Spec | Gap |
|---|---------|------|-----|
| 2 | Homepage query resilience | `00_CURRENT_REPAIR_FOUNDATION.md §10` | Already has try/catch on all sections — verified resilient. Needs production verification. |
| 7 | Creator-facing product approval/rejection flow | `07_permissions_...` | Basic moderation API exists; no creator-facing status flow UI |
| 8 | Moderation history UI | `07_permissions_...` | No user/action history timeline beyond existing `UserModeration` list on user detail page |
| 9 | Permission loading race verification | `PawVault_TESTER_PRIVACY_... §21` | Needs production verification |
| 10 | Marketplace "No products yet" diagnosis | `02_marketplace...`` | `/browse` shows "no products" while homepage shows products — needs production log correlation |
| 12 | Tabler icon integration | `PawVault_Icon_Pack/README.md` | Icon pack available; not yet integrated

---

## 4. FUTURE — Sections 10–12 (Out of Current-Platform Scope)

Per audit key finding #7: "Future features are well-documented but explicitly out of scope. Sections 10-12 of the documentation are labeled as future/backlog and should not be implemented now."

### 4A. Legal Pages
| Item | Spec | Status |
|------|------|--------|
| Terms of Service | `11_future_...` | FUTURE — not implemented |
| Privacy Policy | `11_future_...` | FUTURE — not implemented |
| Cookie Policy | `11_future_...` | FUTURE — not implemented |
| Copyright / DMCA | `11_future_...` | FUTURE — not implemented |
| Creator Agreement | `11_future_...` | FUTURE — not implemented |
| Marketplace Guidelines | `11_future_...` | FUTURE — not implemented |

### 4B. Commerce & Social Features
| Item | Spec | Status |
|------|------|--------|
| Gift card purchase flow (checkout integration) | `11_future_...` | FUTURE — GiftCard model built, checkout integration pending |
| Creator bundles UI | `11_future_...` | FUTURE — partial models exist |
| Marketplace bundles UI | `11_future_...` | FUTURE — partial models exist |
| Like products | `11_future_...` | FUTURE — not implemented |
| Public/private wishlist sharing | `11_future_...` | FUTURE — wishlist exists but social sharing not built |
| Creator announcements system | `11_future_...` | FUTURE — not implemented |
| Product discussions / comments | `11_future_...` | FUTURE — not implemented |
| Creator collections (follow) | `11_future_...` | FUTURE — basic follow exists, collections/social follow pending |

### 4C. Platform & Ecosystem
| Item | Spec | Status |
|------|------|--------|
| Seasonal system auto-scheduling | `05_localization_and_themes.md`, `11_future_...` | FUTURE — 9 built-in themes exist, auto-scheduling not built |
| Modular website system | `12_future_platform_architecture.md` | FUTURE — not implemented |
| Full internationalization (i18n) | `05_localization_and_themes.md`, `12_future_...` | FUTURE — language/currency system built (8 langs, 12 currencies), full i18n pending |
| PWA / mobile app | `11_future_...` | FUTURE — not implemented |
| Partnerships / affiliate system | `11_future_...` | FUTURE — not implemented |
| Developer / API ecosystem | `11_future_...` | FUTURE — basic API docs built, full ecosystem pending |
| Public roadmap | `11_future_...` | FUTURE — not implemented |
| Beta program | `11_future_...` | FUTURE — not implemented |
| Trust & safety centre | `11_future_...` | FUTURE — not implemented |
| Download security (expiring URLs, limits) | `11_future_...` | FUTURE — not implemented |

### 4D. Infrastructure (External Services Required)
| Item | Spec | Status |
|------|------|--------|
| Staging environment | `08_publishing_...` | FUTURE — requires external infrastructure |
| Uptime tracking | `08_publishing_...` | FUTURE — requires external infrastructure |

### 4E. Remaining Advanced Features (_spec 09)
| Item | Spec | Status |
|------|------|--------|
| Trending system | `09_advanced_...` | FUTURE — not implemented |
| Creator rankings | `09_advanced_...` | FUTURE — not implemented |
| Product video previews | `09_advanced_...` | FUTURE — not implemented |
| Better product galleries | `09_advanced_...` | FUTURE — not implemented |
| Automatic file scanning | `09_advanced_...` | FUTURE — not implemented |
| Automatic image optimization | `09_advanced_...` | FUTURE — not implemented |
| Custom creator storefront URLs | `09_advanced_...` | FUTURE — not implemented |
| Full recommendations engine | `09_advanced_...` | Partially built — basic version exists |

---

## 5. Summary

| Priority | Count | Description |
|----------|-------|-------------|
| Critical | 6 items + 2 process fixes | Apply production migration; add deploy gate |
| Important | 6 implemented + 6 remaining | Error boundaries, resilience, UIs, verification |
| Future | 30+ items | Sections 10–12 specs; infrastructure; advanced features |

**Bottom line:** The only blocker for production is the unapplied `prisma/migration_drift_fix.sql`. Codebase implementation of current-platform gaps is progressing — 6 of 12 Important items were implemented on 2026-09-13 (error boundaries, public site settings, moderation notes UI, product versioning UI, search suggestions). The remaining 6 (homepage resilience verification, creator product approval flow, moderation history, permission race verification, `/browse` diagnosis, Tabler icon integration) require production DB access or external integration. The FUTURE specs (30+ items) remain out of scope per audit key finding #7.

---

## 6. Implementation Details (Completed 2026-09-13)

### 6.1 Route-Level Error Boundaries
Created `error.tsx` files (following existing pattern from `browse/error.tsx`, `moderation/error.tsx`, etc.) for four routes that previously had no route-level error boundary:

| Route | File | Description |
|-------|------|-------------|
| `/dashboard` | `src/app/dashboard/error.tsx` | Friendly error with "Try Again" and "Return Home" |
| `/account` | `src/app/account/error.tsx` | Same pattern, account-specific message |
| `/orders` | `src/app/orders/error.tsx` | Same pattern, orders-specific message |
| `/creator` | `src/app/creator/error.tsx` | Same pattern, creator-area message |

### 6.2 Moderation Notes System
**API:** `src/app/api/admin/moderation/notes/route.ts`
- `GET` — List notes filtered by `userId`, `productId`, or `reportId` query params
- `POST` — Create a note (requires `REPORTS_RESOLVE` permission)
- Uses `requirePermission` auth pattern from existing `/api/admin/moderation/route.ts`
- Logs `MODERATION_NOTE_ADDED` audit action

**UI:** `src/app/admin/founder/moderation/notes/page.tsx`
- Lists all notes with author, timestamp, and entity references
- Search by note body text
- "Mod Notes" button on each report in the moderation queue
- Notes section on user detail page (`/admin/founder/users/[id]`)

**Modified files:**
- `src/app/admin/founder/moderation/page.tsx` — Added "Mod Notes" link per report row
- `src/app/admin/founder/users/[id]/page.tsx` — Added moderation notes query + section with note creation form
- `src/lib/audit-logger.ts` — Added `MODERATION_NOTE_ADDED` to `AuditActions`

### 6.3 Product Versioning UI
**Page:** `src/app/creator/products/[id]/versions/page.tsx`
- Lists all versions for a product (newest first)
- Shows version number, changelog, release notes, current/prerelease badges
- "Create New Version" form (POST to existing `/api/creator/products/[id]/versions`)
- Delete version (DELETE endpoint added to existing API)
- "Versions" button added to product row in `/creator/products/products-list.tsx`

**API changes:** Added `DELETE` method to `src/app/api/creator/products/[id]/versions/route.ts` (deletes by `versionId` in body)

### 6.4 Search Suggestions API
**Endpoint:** `src/app/api/search/suggestions/route.ts`
- `GET` with `q` and optional `limit` params
- Returns suggestions for products, creators (approved creators only), and categories
- Returns popular matching queries from `SearchAnalytics` table
- Rate-limited (60 req/min)
- Returns empty results for queries < 2 chars

### 6.5 Public Site Settings
**API:** `src/app/api/site-settings/route.ts`
- Public endpoint (no auth required)
- Returns: brand name, logo/favicon URLs, primary/secondary colors, maintenance mode status
- Returns: enabled currencies (from DB or fallback to 12 supported), base currency, supported languages
- Returns: safe subset of SiteSetting key-value pairs (filtered by `PUBLIC_KEYS` set)

**Page:** `src/app/site-settings/page.tsx`
- Displays brand, localization, platform settings, and legal links
- Shows maintenance banner when maintenance mode is active

**Modified files:**
- `src/components/footer.tsx` — Added "Site Settings" link in Legal section

### 6.6 Build Verification
- `npx tsc --noEmit` — No TypeScript errors
- `npx next lint` — No new errors (only pre-existing warnings in other files)
- `npx next build` — All routes compiled successfully including all new endpoints