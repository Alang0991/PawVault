# PawVault — Complete Repair & Overhaul Implementation Plan

> Synthesizes all 15 documents in `docs/PawVault_Complete_Repair_Overhaul_UPDATED/` (00–14) plus
> `docs/PawVault_ALL_SEPARATE_MDs/00_CURRENT_REPAIR_FOUNDATION.md`,
> `docs/PawVault_ALL_SEPARATE_MDs/need_to_implement.md`,
> `docs/PawVault_DOCUMENTATION_IMPLEMENTATION_AUDIT.md`, and `docs/PawVault_TESTER_PRIVACY_AND_MANAGER_NAVIGATION_REPAIR.md`.

## 0. Project Context (verified from repo)

- **Framework:** Next.js 14.2.0 App Router + React 18.3 + TypeScript
- **Database:** PostgreSQL via Prisma 5.10 (`prisma/schema.prisma`)
- **Auth:** NextAuth 4.24 (`/api/auth/session`) + custom `/api/account/state`
- **Styling:** Tailwind CSS 3.4 + Radix UI primitives + lucide-react
- **Key schema facts:** `User` already has `role` (String), `isInternal`, `language`, `currency`, `theme`, `accentColor`, `reduceMotion`, `customPermissions`; `ProductStatus`, `StoreVisibility`, `CreatorStatus`, `UserStatus` enums exist; `PrivacySettings`, `PublishingDraft`, `CreditTransaction`/`StoreCredit`, `HomepageSection` tables are present or added by `prisma/migration_drift_fix.sql`.
- **The drift-fix SQL** (`prisma/migration_drift_fix.sql`) addresses column type mismatches, adds missing columns (`User.accentColor/mfaSecret/...`, `Session` device tracking, `Payout.currency/stripePayoutId/availableAt`), and creates new tables (`PrivacySettings`, `RecentlyViewed`, `HomepageSection`, `PublishingDraft`, `SystemMetric`, `SystemAlert`, `Backup`, `ErrorLog`, `CreditTransaction` is referenced in audit but not yet confirmed). **It must be applied to production** to resolve the P2021/P2022 class crashes.
- **Live-site findings to repair:** Browse renders a listing while product navigation produces route/fetch failures; Creators page exposes a `Test Creator` that violates Founder-only Tester privacy; Help Center links resolve but several article destinations 404; Support page shows a stuck `Loading...` state.

---

## 1. Phase 1 — Production Database / Schema / Crash Consistency (Weeks 1, day 1–3)

**Source docs:** `00_MASTER_REPAIR_PLAN.md` §§1–4,10–12; `09_DATA_API_SCHEMA_AND_REAL_DATA.md`; `need_to_implement.md` §1; `00_CURRENT_REPAIR_FOUNDATION.md` §§1–3.

### Step 1.1 — Inventory and verify
Produce the audit report required by `11_KILO_IMPLEMENTATION_AND_REGRESSION.md` §40:
- **Production error inventory:** digest `4001367242` (P2021 `StaffPick`), digest `1854994147`, plus any P2022/P2002/P2025 occurrences — list model, table, route, frequency, root cause.
- **Database inventory:** Prisma models vs production tables; missing tables (`Announcement`, `PrivacySettings`, `RecentlyViewed`, `HomepageSection`, `PublishingDraft`, `SystemMetric`, `SystemAlert`); missing columns (`ProductVersion.isCurrent/isPriline`, `User` display prefs); enum mismatches; pending/failed migrations.
- **Route inventory:** every route, its server loader, Prisma + API + external deps, auth, current failure handling.
- **Permission inventory:** every role → permission → route/middleware/server/API/UI mapping and current vs expected behavior.
- **Tester inventory:** Tester representation (`User.isInternal=true`), every public-exposure path (creator dir, Browse, Search, Categories, Staff Picks, Recommendations, Collections, Posts, Reviews, sitemap, public APIs, direct URLs), Founder vs non-Founder behavior.
- **Manager navigation inventory:** every "Manage"/"Manager" button — current page, expected route, actual route, required permission, redirect source.

### Step 1.2 — Apply the production migration (no reset)
- Deploy `prisma/migration_drift_fix.sql` to production **as a normal idempotent migration** (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, guarded `DO $$` foreign keys).
- Verify `prisma_migrations` lists the migration and that `StaffPick` table exists.
- **Absolute prohibitions (from §49/50):** do NOT `prisma migrate reset`, do NOT drop/recreate/replace production data, do NOT delete creators/products/orders/licenses/payouts/moderation history.

### Step 1.3 — Resolve every missing-table / missing-column crash
- For each model, confirm production has the table, columns, relations, indexes, enums.
- Do not manually hand-create partial tables to silence Prisma; use the canonical migration.
- Add a **deployment gate** (`need_to_implement.md` §2): before any deploy that changes Prisma schema, run `prisma db pull` + diff check against production so code requiring new schema never ships before the schema exists.

### Step 1.4 — Homepage resilience (do NOT swallow errors globally)
- `09` requires per-section try/catch with a **controlled fallback**, not global `catch { return [] }`. The Staff Picks failure must degrade only Staff Picks, not the whole homepage.
- Confirm `/` returns HTTP 200 with empty-state fallbacks for Staff Picks/Announcements when absent.

### Acceptance (Phase 1)
- `digrep`/production: digest `4001367242` stopped recurring; homepage = 200; `/`, `/browse`, `/creators`, `/product/[slug]`, `/search`, `/store/[slug]`, `/admin`, `/moderation` all return 200 (or controlled 403/404).
- Every Prisma model used by a route has matching production structure; no P2021/P2022 in logs.

---

## 2. Phase 2 — Auth / Session Reliability (Week 1, day 3–5)

**Source docs:** `04_AUTH_SESSIONS_AND_ACCOUNT_STATE.md`; `need_to_implement.md` §1; `00_CURRENT_REPAIR_FOUNDATION.md` §§15–16, 18; `13_MONEY_CURRENCY_AND_FINANCIAL_DISPLAY.md` §45 ("fail safely"), `14_LANGUAGE_LOCALIZATION_SYSTEM.md` §44 ("sessions remain stable").

### Step 2.1 — Canonical session source of truth
- Single source for session, current user, role, permissions, account state (`/api/auth/session` + `/api/account/state`).
- **Distinct states:** session loading, authenticated, unauthenticated, expired, missing-user, disabled account, role loading, permission loading.
- **Do not log out users** because an unrelated API failed, a profile field is missing, or a permission is denied.

### Step 2.2 — Cookie hardening
- Verify `httpOnly`, `Secure`, `SameSite`, `domain`, `path`, `expiry` in production for the next-auth session and any custom cookies.

### Step 2.3 — Permission-loading race fix
- Replace the `permission === undefined → treated as unauthorized → /dashboard` pattern (§18) with: `Session loading → Role loading → Permission loading → Loading UI → resolved → Allow/Deny`.
- Never deny a valid user merely because authorization data is still loading.

### Step 2.4 — Server-side identity
- Protected APIs resolve identity server-side; never trust client user IDs or roles (§28/34, `06` §36, `08` §27).

### Step 2.5 — Role-change propagation
- Role changes refresh canonical permission state without requiring logout/login.

### Acceptance (Phase 2)
- Sign-in → refresh → refresh persists; `/ → /browse → /creators → /product/[slug]` navigation never logs out or false-redirects to Dashboard.
- Moderator with valid session reaches moderation tools (§16) without being treated as Administrator (§17).
- No permission loading race produces false Access Denied.

---

## 3. Phase 3 — Product Routes & Click Flows (Week 1, day 5–7)

**Source document:** `03_PRODUCT_ROUTES_AND_CLICK_ERRORS.md`.

### Step 3.1 — Canonical product route
- Audit `/product/[slug]` vs `/products/[slug]`; **select one canonical public product route** and update every link generator to use it. No competing product systems.
- Audit link sources: Browse, Categories, Search, Creators, Stores, Wishlist, Cart, Orders, Notifications, Recommendations, Staff Picks, Collections.

### Step 3.2 — Product page safety
- Product pages must safely handle **missing** creator/store/category/media/thumbnail/reviews/tags/files.
- Handle all **states**: free, paid, sale, suspended, unpublished, removed.
- Missing products → controlled **404**, not a server exception.
- Paid listings may be public; **paid-file/download entitlement stays protected** until confirmed access. Free acquisition works without fake payment.

### Step 3.3 — Tests
- Every product card opens the intended route; direct URLs work; refresh works; Back/Forward works; no product click creates a server crash.

### Acceptance (Phase 3)
- No HTTP 500 on any product click. Direct `/product/[slug]` URLs and refreshes resolve. Product cards in Browse/Categories/Search/Recommendations/Staff Picks/Cart/Orders/Wishlist all point to the canonical route.

---

## 4. Phase 4 — Shared API / Data Layer (Week 2, day 1–3)

**Source documents:** `09_DATA_API_SCHEMA_AND_REAL_DATA.md`; `02_DUPLICATE_UI_AND_DOUBLE_RENDERING.md` §§1,3–5.

### Step 4.1 — Audit shared data services
- Catalog: Product queries, Creator queries, Store resolution, Category resolution, Session resolution, Role/permission resolution, Media resolution, Notifications, Cart, Orders, Licenses, Search, Discovery.
- Repair each **once** at the source instead of adding page-specific hacks.

### Step 4.2 — Data duplication root-cause analysis
Search for duplicate Header/Nav/Footer, ProductCard, CreatorCard, Modal, Toast, Filter, Search, Breadcrumb, Sidebar, page-title rendering. Check: nested layouts, Server+Client duplicate rendering, React hydration, Strict-Mode effects, duplicate API calls, duplicated pagination, cache concatenation, realtime subscriptions, event listeners, repeated fetch/subscription effects.
- Use canonical IDs for legitimate dedup **only after** the duplication source is understood. Do not blindly hide.
- Clean up listeners; prevent repeated requests; ensure pagination cannot append the same page twice.

### Step 4.3 — Cache invalidation policy
Invalidate caches after: permissions change, tester visibility changes, moderation actions, content changes. Stale caches must not re-expose hidden Tester data or suspended products.

### Step 4.4 — External-service isolation
Failures in Stripe, Storage, Email, Search, Analytics, other external APIs must not crash unrelated marketplace pages (e.g. email unavailable → product page still renders). Use controlled degraded states.

### Acceptance (Phase 4)
- Header/footer/sidebar render exactly once. Product/creator records render exactly once with canonical IDs. Notifications do not duplicate. Every shared service is crash-resilient to optional/external failures.

---

## 5. Phase 5 — Creator-Controlled Publishing (Week 2, day 3–5)

**Source documents:** `07_CREATOR_PUBLISHING_OWNERSHIP_AND_MODERATION.md`; `need_to_implement.md` §3 (implemented: product versioning UI), `11_KILO` §§1,36.

### Step 5.1 — State machine (creators control publishing)
Normal flow: `Draft → Creator validates → Creator publishes → Published`.
**Routine creator publication must NOT require Founder/Admin/Moderator approval.**

### Step 5.2 — Staff enforcement (separate from ownership)
Founder/Admin/Moderator (per explicit permission) may: Review reports; Suspend a product; Remove/hide a product; Request changes (where the moderation workflow supports it); Record a reason; Preserve evidence; Handle safety/copyright/fraud issues.

### Step 5.2.1 — Staff must NOT routinely
Publish on creator's behalf, change creator pricing arbitrarily, replace creator files, rewrite creator licenses, transfer ownership, make a paid product free, take ownership of creator content.

### Step 5.3 — Suspension/removal (non-destructive)
Every action requires: actor, reason, timestamp, target, previous state, new state. Prefer marketplace removal/suspension over destructive deletion so orders/licenses/audit history remain intact.

### Step 5.4 — Permissions
Creator = own content management. Moderator = moderation enforcement. Administrator = platform administration within scope. Founder = highest platform authority. These roles are **not interchangeable**.

### Acceptance (Phase 5)
- Creator publishes own product end-to-end without staff approval.
- Every moderation action is recorded with actor/reason/timestamp/previous+new state.
- No destructive deletion of creator content; removal preserves orders/licenses.

---

## 6. Phase 6 — Moderation Actions & Audit (Week 2, day 5–7)

**Source documents:** `08_MODERATION_ACTIONS_AND_REASON_AUDIT.md`; `07_CREATOR_PUBLISHING_OWNERSHIP_AND_MODERATION.md` §5; `need_to_implement.md` §3 (partially implemented: moderation notes UI).

### Step 6.1 — Action set
Support the actual permitted workflow: **Review, Request Changes, Suspend, Remove, Restore, Dismiss Report, Escalate.** Only show actions granted to the current role.

### Step 6.2 — Reasons
Suspension/removal requires a reason. Store creator-facing explanation separately from private internal notes.

### Step 6.3 — Audit log
Record: actor, role, target, action, reason, previous state, new state, timestamp, evidence/reference. (AuditLog model + `AuditActions` enum already exist — add moderation-specific actions.)

### Step 6.4 — Restore/appeals
Restores and appeal decisions create **new** audit entries; never overwrite history.

### Step 6.5 — Security
Moderator is not Administrator; Founder authority is highest but auditable; no destructive mystery actions.

### Acceptance (Phase 6)
- Every permitted moderation action is available in UI only to roles that may perform it.
- Each moderation action produces an immutable audit entry with full context.
- Tester account (Moderator) cannot perform Founder-only actions.

---

## 7. Phase 7 — Tester Privacy (Founder-only) (Week 3, day 1–2)

**Source documents:** `10_TESTER_PRIVACY_AND_PUBLIC_VISIBILITY.md`; `need_to_implement.md` §3; `00_CURRENT_REPAIR_FOUNDATION.md` §§24–35.

### Step 7.1 — Canonical flag
The `User.isInternal` field already exists; use it as the canonical Tester/internal flag. Do not create a second account system. Do not hardcode a Tester email into dozens of queries.

### Step 7.2 — Server-side rule applied everywhere
```
If account is internal Tester:
    if viewer is Founder: allow
    else: exclude
else: normal visibility
```
Founder status comes from the **server-side** session/permission system; never trust `isFounder`/`role=Founder` from the client.

### Step 7.3 — Exposure paths to audit & exclude for non-Founder
Creator directory, Browse, Search, Categories, Stores, Products, Recommendations, Staff Picks, Collections, Posts, Reviews, public APIs, sitemap, SEO, public counts, direct URLs.
- Do **not** use `display: none` / React-only filtering. The **server/data layer** must exclude Tester.
- Direct Tester URLs (e.g. `/creators/tester`, `/store/tester`, `/product/<tester-slug>`) must return a privacy-preserving **404** for non-Founders that does not reveal Tester existence, ID, email, slug, or product names.
- Public counts (creator/product/category/search/recommendation counts) must exclude Tester records for non-Founder viewers — computed from real visible data, not hardcoded replacements.
- Cache invalidation after the visibility rule is implemented.

### Step 7.4 — Finder
Fix the live-site finding: the Creators page currently exposes `Test Creator`. That record must disappear for non-Founder users immediately.

### Acceptance (Phase 7)
- Creator count = 1 (`Bluey Barks`) for non-Founder; 2 for Founder.
- No non-Founder can discover Tester via any listed path, direct URL, sitemap, SEO, or public API.
- Founder still sees all Tester data per Founder authority.

---

## 8. Phase 8 — Credits / Grants Ledger (Week 3, day 2–4)

**Source documents:** `06_CREDITS_GRANTS_AND_USER_ENTITLEMENTS.md`; `need_to_implement.md`; `10_future_pages_and_navigation.md` (credits — FUTURE, but current-platform requirement).

### Step 8.1 — Auditable ledger (not just `user.credits`)
Model `CreditTransaction`: Credit account/balance; transaction; amount; actor; recipient; reason; timestamp; optional expiry; reference; before/after balance.

### Step 8.2 — Permissions
Founder: full grant authority. Administrator: only if explicitly granted. Moderator: not automatically. Creator/User: none.

### Step 8.3 — UI
Authorized staff see recipient, current balance, amount, reason, confirmation. Prevent duplicate submissions (idempotency).

### Step 8.4 — Security
Resolve actor and permission **server-side**. Never trust client actor IDs or roles.

### Step 8.5 — Financial safety
Credits must not silently make creator products free, bypass paid-file access, or alter creator revenue rules. Credit redemption respects normal product/entitlement rules.

### Acceptance (Phase 8)
- Authorized staff can grant credits; every grant is auditable; users can view balance/history; duplicate grants prevented; unauthorized users cannot grant; redemption respects entitlement rules.

---

## 9. Phase 9 — Help Center Content & Routing (Week 3, day 4–6)

**Source documents:** `05_HELP_CENTER_CONTENT_AND_ROUTING.md`; `12_HELP_CENTER_CONTENT_MAP.md`.

### Step 9.1 — Canonical content model
Each article: ID, slug, category, title, summary, body, status, published/updated dates, related articles, search keywords. States: Draft, Scheduled, Published, Archived. Only Published content is public.

### Step 9.2 — Routing repair
Crawl **every** Help Center link; produce a broken-link report; remove or repair links to missing articles. Every visible article must resolve to a real article.

### Step 9.3 — Real content (no fake placeholders)
Build real, useful documentation per the content map (Getting Started, Buying & Downloads, Selling/Creators, Security, Moderation/Safety, Technical). No fake/placeholder articles to fill space.

### Step 9.4 — Search & UX
Search real published content only. Article pages need: breadcrumb, title, summary, content, update date, related articles, Support action. Empty search needs a useful state, not a blank screen.

### Step 9.5 — Support page
Audit the `Loading...` state in the crawled Support output; fix client/data loading so it fails safely and renders a real state.

### Acceptance (Phase 9)
- Every Help Center link resolves to a published article (0 broken links).
- Search returns only published content; empty search shows a helpful state.
- Support page loads without stuck `Loading...`.

---

## 10. Phase 10 — Money / Currency & Financial Display (Week 4, day 1–3)

**Source document:** `13_MONEY_CURRENCY_AND_FINANCIAL_DISPLAY.md`.

### Step 10.1 — Real persistent preference
Money/Currency settings tab must: open; load current preference; allow a supported currency; save; persist after refresh/navigation/sessions; fail safely without logging users out. Use the canonical user/profile/settings system (`User.currency`); do **not** create a second preferences database.

### Step 10.2 — Display vs transaction currency
Changing display preference must **never** rewrite creator prices, historical orders, refunds, payouts, Stripe records, or accounting. If conversion is supported, use a defined exchange-rate source + timestamp; if not, never pretend the payable amount was converted.

### Step 10.3 — Central formatting
One currency formatter for product cards, product pages, cart, checkout, orders, refunds, credits, creator earnings, payouts, sales history. Validate supported currency codes server-side.

### Step 10.4 — Creator ownership
A buyer's display currency must not change a creator's stored product price.

### Step 10.5 — Stripe
Do not change Stripe transaction currency because a user changed their display preference. Checkout uses the actual supported transaction currency.

### Step 10.6 — Failure behavior
If saving fails: controlled retryable message. No crash, no logout, no reset of unrelated settings, no redirect to Dashboard.

### Acceptance (Phase 10)
- Persistence test: Change currency → Save → Refresh → still selected; works through Browse → Product → Cart → Orders.
- Historical transactions unchanged; creator pricing unchanged; checkout financially correct.

---

## 11. Phase 11 — Language / Localization System (Week 4, day 3–5)

**Source document:** `14_LANGUAGE_LOCALIZATION_SYSTEM.md`.

### Step 11.1 — Real persistent preference
Languages tab must: open; show current language; allow supported languages; save; persist after refresh/navigation/sessions; fail safely. Use canonical account settings (`User.language`).

### Step 11.2 — One i18n layer
One localization layer for navigation, buttons, settings, account pages, Creator Hub, moderation/admin UI, Help Center UI, empty/error/loading states, validation, notifications, emails. Do not scatter translations through components.

### Step 11.3 — Supported-language registry
Explicit registry: locale code, display name, translation availability, formatting locale, text direction. Reject arbitrary client locale values.

### Step 11.4 — Fallback
Missing translations fall back safely; never render `undefined`, raw keys, or crash.

### Step 11.5 — User content isolation
Changing interface language must NOT silently translate creator-owned product titles/descriptions/store names/posts/reviews.

### Step 11.6 — Dates/numbers/currency
Centralize locale-aware date/time/number formatting; language + currency preferences work together without changing financial records.

### Step 11.7 — Session safety
Language changes must not cause logout/session replacement/redirect loops/Dashboard redirects/auth failures.

### Step 11.8 — URL strategy
One canonical routing strategy (avoid duplicate routes). Otherwise persist through canonical account settings.

### Step 11.9 — Accessibility
Proper label, keyboard access, clear selected state, screen-reader-friendly names.

### Acceptance (Phase 11)
- Persistence test: Change language → Save → Refresh → still selected; works through Browse → Product → Help Center → Creator Hub → Settings.
- No logout/session reset on language change.

---

## 12. Phase 12 — Massive UI/UX Overhaul (Week 4, day 5–7 → Week 5)

**Source documents:** `01_UI_UX_MASSIVE_OVERHAUL.md`; `02_DUPLICATE_UI_AND_DOUBLE_RENDERING.md`.

### Step 12.1 — Shared design system
One reusable system for typography, spacing, buttons, inputs, selects, tabs, cards, badges, alerts, dialogs, drawers, dropdowns, tooltips, tables, breadcrumbs, skeletons, empty states, error states, pagination.

### Step 12.2 — Marketplace hierarchy
Prioritize: product image, title, creator, price/free state, rating, category/tags, primary action. Do **not** fill public marketplace screens with admin controls.

### Step 12.3 — Navigation (de-duplicated)
Public: Browse, Categories, Creators, Search, Help/Support. Authenticated: Account, Wishlist, Cart, Orders/Downloads. Creator: Creator Hub, Products, Store, Orders, Customers, Payouts. Staff: according to permission. Do **not** render navigation twice through nested layouts.

### Step 12.4 — States
Every data-heavy screen needs: Loading, Success, Empty, Error, Unauthorized, Forbidden, Not Found. Never leave `Loading...` forever. (Support page `Loading...` state fixed in Phase 9.)

### Step 12.5 — Responsive / accessibility
Audit desktop/tablet/mobile: no horizontal overflow or clipped controls; keyboard navigation; focus states; labels; contrast; reduced-motion; correct semantics.

### Step 12.6 — Root cause (not visual patches)
Do not hide structural bugs behind visual patches. Fix the component/data source causing duplicated or broken UI.

### Acceptance (Phase 12)
- Header/footer/sidebar appear once; product/creator records once; notifications not duplicated; no stuck `Loading...` states; responsive on all viewports; full keyboard/accessibility support; marketplace screens are marketplace-first (no admin clutter).

---

## 13. Phase 13 — Manager Navigation & Dashboard Redirect Elimination (Week 5, day 1–3)

**Source documents:** `need_to_implement.md` §3 (verified: no broken redirects found, but needs production verification); `00_CURRENT_REPAIR_FOUNDATION.md` §§19–23, 27; `11_KILO` §40 (manager navigation inventory).

### Step 13.1 — Manager button audit (from Step 1.1 inventory)
For every "Manage/Manager/Management" button record: label, current page, expected destination, actual destination, required permission, redirect source.

### Step 13.2 — Eliminate universal Dashboard redirect
Trace `router.push()`, `router.replace()`, `<Link>`, navigation helpers, middleware, route guards, permission guards, `redirect()`, `notFound()`, layouts. Remove/fix logic like:
```ts
if (!hasPermission(...)) { redirect("/dashboard") }   // WRONG for authorized users
```
Authorized managers must reach the management page, not Dashboard.

### Step 13.3 — Correct 403 semantics
Unauthorized → management route → controlled **403 / Access Denied** (not Dashboard). Valid managers stay logged in, keep session/role/creator status, reach the requested page.

### Acceptance (Phase 13)
- Every Manager button → correct canonical management route → management page (refresh, direct URL, Back/Forward all work).
- Authorized → management page; unauthorized → controlled 403; never → Dashboard for an authorized user.

---

## 14. Phase 14 — Regression & Smoke Testing (Week 5, day 4–5)

**Source documents:** `11_KILO_IMPLEMENTATION_AND_REGRESSION.md` §§40,42–45; `need_to_implement.md` §3 (verification items).

### Step 14.1 — Database
Production migration status correct; every required Prisma model has production structure; required columns/relations/enums present; no pending required migration.

### Step 14.2 — Staff Picks
Query works; empty state works; populated state works; optional failure cannot destroy homepage; digest `4001367242` stops recurring.

### Step 14.3 — Navigation stress test (multiple roles × all states)
Test Home↔Browse, Browse↔Categories, Categories↔Creators, Creators↔Product, Product↔Creator, Creator Hub↔Product, Moderation↔Product, Admin↔Management. Plus: rapid clicks, Back, Forward, Refresh, direct URL, multiple tabs, mobile viewport, logged-out, logged-in, Creator, Moderator, Administrator, Founder.
- No HTTP 500, no raw application error, no unexpected Dashboard redirect, no unexpected login, no session reset, no false Access Denied.

### Step 14.4 — Tester privacy tests
Founder: creator directory → Tester visible; search → visible; tester profile/store/products → accessible.
Everyone else: creator directory → hidden; search → hidden; tester profile/store/products → protected; public API → excluded; sitemap → excluded; counts → excluded.

### Step 14.5 — Manager navigation tests
For every Manager button: click → destination; refresh; direct URL; Back; Forward; new tab; correct role; incorrect role; expired session.
- Authorized → management page; unauthorized → controlled 403.

### Step 14.6 — Remaining verification items (from `need_to_implement.md` §3)
- Homepage resilience — production verification.
- Creator-facing product approval/rejection flow.
- Moderation history timeline.
- Permission-loading race — production verification.
- `/browse` "no products" diagnosis — production log correlation (may be a caching/filtering issue exposed by Phase 4 cache work).
- Tabler icon integration (`docs/PawVault_Icon_Pack/README.md`).

### Step 14.7 — Build gate (`11_KILO` §39)
Before production deployment: `prisma validate` + migration validation + migration status + database compatibility check + `prisma generate` + `next build` + `tsc --noEmit` + `next lint` + route smoke tests.

### Acceptance (Phase 14)
- Deploy gate passes. All test matrices green. No raw server exceptions reach the user; `00`/homepage returns 200; all crash digests resolved.

---

## 15. Cross-Cutting Guardrails (append-only rules — never violate)

Taken verbatim from the architecture rules (`00` §3) and the absolute/security/data rules (`00_CURRENT_REPAIR` §§46–49, `11_KILO` §48):

1. One canonical auth/session system.
2. One canonical role/permission system.
3. One canonical creator/store/product ownership system.
4. One canonical moderation system.
5. One canonical Help Center content system.
6. One canonical credits/grants ledger.
7. One canonical currency display system; one canonical i18n system; one canonical theme system.
8. No frontend-only authorization/privacy.
9. No fake marketplace data.
10. No production reset / no destructive production data changes.
11. No duplicate route systems.
12. No universal Dashboard redirects.
13. Optional sections cannot crash whole pages.
14. Creators control their own publishing.
15. Staff enforce marketplace rules; moderation is not ownership.
16. Tester data is Founder-only.
17. Do not disable RLS; do not trust client roles/Founder flags; do not make Moderator an Administrator; do not create generic `manage_everything`.
18. Every fix targets the shared-system root cause — never a page-specific visual patch for a structural bug.

---

## 16. Execution Order Summary

```
Phase 1  → DB/Schema/Crash consistency   (apply migration_drift_fix.sql; inventory)
Phase 2  → Auth/Session reliability    (canonical session; permission-load race)
Phase 3  → Product routes & clicks     (canonical /product/[slug]; safe states)
Phase 4  → Shared data/API layer       (dedup; cache invalidation; external isolation)
Phase 5  → Creator-controlled publishing
Phase 6  → Moderation actions & audit
Phase 7  → Tester Founder-only privacy
Phase 8  → Credits/grants ledger
Phase 9  → Help Center content & routing
Phase 10 → Money/currency system
Phase 11 → Language/localization system
Phase 12 → UI/UX overhaul + design system
Phase 13 → Manager nav + Dashboard redirect elimination
Phase 14 → Full regression + smoke tests + deploy gate
```

> The order follows `00` §Repair order and `11_KILO` §Repair order: **Database/schema → sessions → product routes → shared data → creator publishing → moderation → Tester privacy → credits → Help Center → UI/UX → full regression.** Each phase's acceptance criteria must pass before the next begins.

---

## 17. Out of Scope (FUTURE — do not implement in this overhaul)

Confirmed out-of-scope per `need_to_implement.md` §4 and the audit: avatar commissioners, creator services hub, gift-card checkout integration, creator/marketplace bundles UI, product likes, social wishlist sharing, platform news/blog (already implemented), announcements system UI (model exists), product discussions/comments, creator collections follow, seasonal auto-scheduling, modular website system, full i18n (language/currency built; full translation of all UI strings staged), PWA/mobile app, partnerships/affiliate, public roadmap, beta program, trust & safety centre, download security (expiring URLs/limits), and all `10_future_…` / `11_future_…` / `12_future_…` specs.
