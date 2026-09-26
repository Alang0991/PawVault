# PawVault --- COMPLETE LATEST REPAIR MASTER

## Purpose

This document combines everything identified in the latest PawVault
debugging session:

1.  Production server crashes occurring across multiple pages.
2.  The confirmed `StaffPick` Prisma/database mismatch.
3.  Moderator accounts receiving incorrect Access Denied responses.
4.  Internal Tester account data being publicly exposed.
5.  Admin/Moderation Manager buttons incorrectly returning users to
    Dashboard.
6.  Page-switching/navigation exposing crashes and bad redirects.

**Do not fix these as isolated page bugs. Audit and repair the shared
systems underneath them.**

------------------------------------------------------------------------

# 1. CONFIRMED PRODUCTION CRASH

Production logs confirm:

``` text
PrismaClientKnownRequestError

Invalid `prisma.staffPick.findMany()` invocation:

The table `public.StaffPick` does not exist in the current database.

code: P2021
modelName: StaffPick
table: public.StaffPick
digest: 4001367242
```

The failing route is:

``` text
GET /
500
```

The stack shows:

``` text
Promise.all (index 7)
```

So the homepage is loading Staff Picks as one of several parallel data
operations.

### Confirmed chain

``` text
Homepage
↓
Homepage server loader
↓
prisma.staffPick.findMany()
↓
Production PostgreSQL
↓
public.StaffPick does not exist
↓
Prisma P2021
↓
Unhandled server exception
↓
HTTP 500
↓
PawVault error screen
```

This is a confirmed schema/application mismatch.

------------------------------------------------------------------------

# 2. THIS IS NOT ONLY A MODERATION BUG

The confirmed StaffPick crash occurs on `/`, not only on `/moderation`.

The user is also seeing crashes on multiple pages.

Therefore the correct scope is:

> **Global production application ↔ Prisma ↔ database consistency and
> crash-resilience audit.**

Do not stop after repairing the homepage.

Do not assume every crash has the same root cause.

StaffPick is one confirmed root cause. Other crashes must be inventoried
separately.

------------------------------------------------------------------------

# 3. GLOBAL PRISMA / DATABASE AUDIT

Audit:

``` text
prisma/schema.prisma
↓
prisma/migrations/*
↓
Prisma migration history
↓
Production PostgreSQL schema
↓
Generated Prisma Client
↓
Deployed Next.js build
↓
Runtime queries
```

These must agree.

For every Prisma model, determine:

``` text
Model
Expected table
Migration
Migration status
Production table exists?
Columns match?
Relations match?
Indexes match?
Enums match?
```

------------------------------------------------------------------------

# 4. STAFFPICK REPAIR

First determine whether Staff Picks is an active intended feature.

## If active

Find the canonical migration creating:

``` text
public.StaffPick
```

Verify:

-   Migration exists.
-   Migration is committed.
-   Migration is intended for production.
-   Migration is not already applied under conflicting state.
-   Production migration history is correct.
-   Required columns exist.
-   Required indexes exist.
-   Required foreign keys exist.
-   Required relations exist.
-   Required enums exist.

Apply the proper production migration using the existing deployment
process.

Do not manually create a partial table just to silence Prisma.

## If unfinished/deprecated

Remove or disable the Staff Picks dependency through the canonical
feature system.

Do not create fake Staff Picks merely to make the page render.

------------------------------------------------------------------------

# 5. NEVER RESET PRODUCTION

Never run:

``` bash
prisma migrate reset
```

against production.

Never:

-   Drop the production database.
-   Recreate the schema.
-   Delete production tables.
-   Delete creators.
-   Delete products.
-   Delete orders.
-   Delete licenses.
-   Delete payouts.
-   Delete moderation history.
-   Replace the production database.

All repairs must preserve real PawVault data.

------------------------------------------------------------------------

# 6. CHECK FOR OTHER MISSING TABLES

Search runtime code for:

``` text
prisma.<model>.findMany()
prisma.<model>.findUnique()
prisma.<model>.findFirst()
prisma.<model>.create()
prisma.<model>.update()
prisma.<model>.delete()
prisma.<model>.count()
prisma.<model>.aggregate()
prisma.<model>.groupBy()
```

Audit likely PawVault systems including:

-   StaffPick.
-   Moderation.
-   Creator approval.
-   Stores.
-   Creator profiles.
-   Products.
-   Product media.
-   Product files.
-   Categories.
-   Subcategories.
-   Tags.
-   Wishlist.
-   Cart.
-   Orders.
-   Licenses.
-   Reviews.
-   Notifications.
-   Posts.
-   Collections.
-   Stripe/Connect.
-   Payments.
-   Allocations.
-   Payouts.
-   Support.
-   Platform content.
-   Email/outbox.
-   Feature flags.

Do not assume StaffPick is the only mismatch.

------------------------------------------------------------------------

# 7. CHECK MISSING COLUMNS

Also audit for Prisma errors such as:

``` text
P2022
```

Check production against Prisma for recently added fields, including
areas such as:

``` text
ProductMedia.updatedAt
creator fields
store fields
moderation fields
approval fields
payout fields
content fields
```

Do not blindly add columns. Identify the canonical migration.

------------------------------------------------------------------------

# 8. CHECK RELATIONS AND ENUMS

Audit:

-   Foreign keys.
-   Join tables.
-   Required/optional relations.
-   Relation names.
-   Cascades.
-   Referential actions.
-   Product status.
-   Moderation status.
-   Approval status.
-   User roles.
-   Creator status.
-   Store status.
-   Order status.
-   Payment status.
-   License status.
-   Payout status.
-   Visibility.
-   Content state.

Do not casually rename/delete enum values used by production data.

------------------------------------------------------------------------

# 9. SHARED DATA SERVICES

Find shared services used by multiple pages:

-   Product queries.
-   Creator queries.
-   Store resolution.
-   Category resolution.
-   Session resolution.
-   Role/permission resolution.
-   Media resolution.
-   Notifications.
-   Cart.
-   Orders.
-   Licenses.
-   Search.
-   Discovery.

If a shared service expects missing schema or broken data, repair it
once instead of adding page-specific hacks.

------------------------------------------------------------------------

# 10. HOMEPAGE RESILIENCE

The homepage uses parallel data loading.

Optional sections should not be capable of destroying the whole page.

For example:

``` text
Homepage
├── Hero
├── Featured Products
├── Categories
├── Staff Picks
├── Creator Highlights
└── Other sections
```

If Staff Picks is optional:

``` text
Staff Picks fails
↓
Homepage remains available
↓
Staff Picks shows a controlled fallback
```

However, this does NOT replace fixing the missing production migration.

Do not globally swallow database errors with:

``` ts
catch {
  return []
}
```

That would hide real failures.

------------------------------------------------------------------------

# 11. ERROR BOUNDARIES

Verify:

-   Global error boundary.
-   Route error boundaries.
-   Not-found handling.
-   API error handling.
-   Server action error handling.
-   Component boundaries where useful.

Users should not routinely see:

``` text
Application error: a server-side exception has occurred
```

Prefer a controlled PawVault state such as:

``` text
Something went wrong

PawVault couldn't load this page correctly.

[Try Again]
[Return Home]
```

Internal logs must retain the real exception.

------------------------------------------------------------------------

# 12. GLOBAL ROUTE AUDIT

Audit the real routes in the repository.

At minimum:

``` text
/
/browse
/categories
/categories/[slug]
/creators
/creators/[slug]
/products/[slug]
/product/[slug]
/tutorials
/api-docs
```

Account:

``` text
/profile
/settings
/wishlist
/cart
/orders
/licenses
/notifications
```

Creator:

``` text
Creator Hub
Products
New Product
Product Edit
Store
Orders
Customers
Licenses
Payouts
```

Admin/Moderation:

``` text
Use actual repository routes as the source of truth.
```

Do not create duplicate routes to hide problems.

------------------------------------------------------------------------

# 13. NAVIGATION / "SWAP" CRASHES

The user repeatedly experiences problems when switching pages.

Test:

``` text
Home → Browse
Browse → Categories
Categories → Creators
Creators → Product
Product → Creator
Creator Hub → Product
Moderation → Product
Product → Home
```

Also test:

-   Browser Back.
-   Browser Forward.
-   Refresh.
-   Direct URLs.
-   Rapid navigation.
-   Multiple tabs.
-   Logged out.
-   Logged in.
-   Creator.
-   Moderator.
-   Administrator.
-   Founder.

Do not assume `router.push()` is the root cause.

Navigation may simply expose a failing server loader, shared service,
middleware check, or database query.

------------------------------------------------------------------------

# 14. PRODUCTION ERROR INVENTORY

Inspect production logs and group errors by:

``` text
Digest
Prisma code
Model
Table
Route
Frequency
First seen
Last seen
Root cause
```

Known:

``` text
Digest: 4001367242
Code: P2021
Model: StaffPick
Table: public.StaffPick
Route: /
```

A previously observed digest was:

``` text
1854994147
```

Do not assume it has the same cause. Find its real stack trace if it is
still occurring.

Search for:

``` text
P2021
P2022
P2002
P2003
P2014
P2016
P2025
```

and classify each correctly.

------------------------------------------------------------------------

# 15. AUTHENTICATION EVIDENCE

Recent logs showed:

``` text
/api/auth/session → 200
/api/account/state → 200
```

while:

``` text
/ → 500
```

This means authentication should not automatically be blamed for the
StaffPick crash.

Do not rebuild/reset authentication to solve the database mismatch.

Keep authentication/session resolution separate from marketplace data
loading.

------------------------------------------------------------------------

# 16. MODERATOR ACCESS DENIED

There is a separate authorization issue.

Users with the Moderator role can reach moderation-related UI but may
receive:

``` text
Access Denied

You do not have permission to access moderation tools.
Only administrators and platform owners can view this area.
```

If Moderators are intended to have the requested moderation permission,
this is incorrect.

Audit the entire chain:

``` text
Session
↓
Canonical role
↓
Permission resolver
↓
Middleware
↓
Route guard
↓
Server authorization
↓
API authorization
↓
UI visibility
```

All layers must agree.

------------------------------------------------------------------------

# 17. MODERATOR MUST NOT BECOME ADMIN

Do not fix Moderator access by changing:

``` text
Moderator = Administrator
```

Define the actual moderation permissions.

A Moderator should receive only the moderation capabilities intended for
that role.

Administrator remains separate.

Founder remains highest platform authority.

------------------------------------------------------------------------

# 18. PERMISSION LOADING RACE

Investigate:

``` text
permission === undefined
↓
treated as unauthorized
↓
Access Denied / Dashboard
```

Correct:

``` text
Session loading
↓
Role loading
↓
Permission loading
↓
Loading UI
↓
Permission resolved
↓
Allow or deny
```

Do not deny a valid user merely because authorization data is still
loading.

------------------------------------------------------------------------

# 19. ADMIN / MODERATION MANAGER BUTTONS

Manager buttons on Admin/Moderation pages are incorrectly sending users
back to Dashboard.

That is broken.

Correct:

``` text
Manager
↓
Correct management route
↓
Management page
```

Not:

``` text
Manager
↓
Dashboard
```

------------------------------------------------------------------------

# 20. AUDIT EVERY MANAGER BUTTON

Search the repository for:

``` text
Manage
Manager
Management
View Management
Manage Products
Manage Creators
Manage Reports
Manage Users
Manage Moderation
Manage Stores
Manage Categories
Manage Content
```

For every button record:

``` text
Button label
Current page
Expected destination
Actual destination
Required permission
Reason for redirect
```

Use the canonical existing route.

Do not invent duplicate management pages.

------------------------------------------------------------------------

# 21. TRACE THE DASHBOARD REDIRECT

Inspect:

``` text
router.push()
router.replace()
<Link>
navigation helpers
middleware
route guards
permission guards
redirect()
notFound()
layouts
```

Look for logic like:

``` ts
if (!hasPermission(...)) {
  redirect("/dashboard")
}
```

or:

``` ts
if (!authorized) {
  router.push("/dashboard")
}
```

The button itself may be correct while the destination's guard is wrong.

Trace the entire chain.

------------------------------------------------------------------------

# 22. UNAUTHORIZED ≠ DASHBOARD

If the user lacks permission:

``` text
Management route
↓
403 / Access Denied
```

Not:

``` text
Management route
↓
Dashboard
```

Dashboard must not be the universal error destination.

------------------------------------------------------------------------

# 23. VALID MANAGERS STAY IN MANAGEMENT

Authorized users must:

-   Remain logged in.
-   Keep their session.
-   Keep their role.
-   Keep their creator status.
-   Reach the requested management page.

Do not:

-   Log out.
-   Force login.
-   Reset session.
-   Change roles.
-   Redirect to Dashboard.

------------------------------------------------------------------------

# 24. TESTER ACCOUNT --- FOUNDER ONLY

The internal Tester account and everything belonging to it must be
hidden from everyone except the Founder.

Current public Creator directory has shown:

``` text
2 creators
2 published products

Bluey Barks
Test Creator
```

The Tester must disappear for non-Founder users.

------------------------------------------------------------------------

# 25. TESTER VISIBILITY MATRIX

  Viewer               Tester
  -------------------- ---------
  Founder              Visible
  Administrator        Hidden
  Moderator            Hidden
  Creator              Hidden
  Normal User          Hidden
  Logged-out visitor   Hidden

This is explicitly Founder-only visibility.

Do not broaden it to normal administrators or moderators.

------------------------------------------------------------------------

# 26. TESTER DATA TO HIDE

For non-Founder users, exclude:

-   Tester account.
-   Tester creator profile.
-   Tester store.
-   Tester products.
-   Tester drafts.
-   Tester public orders/test records.
-   Tester licenses where publicly discoverable.
-   Tester posts.
-   Tester collections.
-   Tester reviews where identity/content would be exposed.
-   Tester search results.
-   Tester recommendations.
-   Tester Staff Picks.
-   Tester featured content.
-   Tester public API results.
-   Tester sitemap entries.
-   Tester SEO metadata.
-   Tester public counts.

------------------------------------------------------------------------

# 27. DO NOT HIDE TESTER ONLY IN FRONTEND

Do not use:

``` css
display: none;
```

or React-only filtering.

Do not rely on:

-   Hidden buttons.
-   Secret slugs.
-   URL obscurity.
-   Local storage.
-   Client-side filtering.

If the API returns Tester data, it is not hidden.

The server/data layer must exclude it.

------------------------------------------------------------------------

# 28. CANONICAL TESTER FLAG

Inspect the existing account model first.

If PawVault already has an internal/test flag, use it.

If not, add one through the canonical account system using project
conventions.

Possible semantics:

``` text
isInternal
isTestAccount
accountType
visibilityScope
```

Do not create a duplicate account system.

------------------------------------------------------------------------

# 29. SERVER-SIDE TESTER RULE

Conceptually:

``` text
If account is internal Tester:
    If viewer is Founder:
        allow
    Else:
        exclude
Else:
    normal visibility
```

Founder status must come from the canonical server-side
session/permission system.

Never trust:

``` text
isFounder=true
role=Founder
```

from the client.

------------------------------------------------------------------------

# 30. PUBLIC QUERY FILTERING

Audit:

``` text
Creator directory
Browse
Search
Categories
Featured
Staff Picks
Recommendations
Collections
Posts
Reviews
Sitemap
Public APIs
```

For non-Founder:

``` text
Tester = excluded
```

For Founder:

``` text
Tester = visible
```

------------------------------------------------------------------------

# 31. PUBLIC COUNTS

Tester records must not inflate counts for non-Founder users.

If the visible public data is:

``` text
Bluey Barks
```

and the Tester is hidden, the public creator count must reflect only
visible creators.

Apply the same rule to:

-   Creator counts.
-   Published product counts.
-   Category counts.
-   Search result counts.
-   Recommendation counts.

Do not hardcode replacement counts.

------------------------------------------------------------------------

# 32. DIRECT TESTER URL PROTECTION

A non-Founder must not access Tester content by guessing a URL.

Test every real Tester URL.

Examples:

``` text
/creators/tester
/store/tester
/products/test-product
```

Use the actual routes/slugs discovered in the project.

For non-Founder users, return a privacy-preserving result such as:

``` text
404
```

Do not reveal:

-   Tester existence.
-   Tester ID.
-   Tester email.
-   Tester slug.
-   Tester product names.

Founder retains access.

------------------------------------------------------------------------

# 33. SEARCH / INDEXING PRIVACY

Exclude Tester data from:

-   Search.
-   Search suggestions.
-   Autocomplete.
-   SEO.
-   Sitemap.
-   Structured data.
-   Public feeds.
-   Public APIs.

Invalidate relevant caches/indexes after implementing the visibility
rule.

------------------------------------------------------------------------

# 34. MODERATION/ADMIN DO NOT AUTOMATICALLY SEE TESTER

Because the requirement is Founder-only visibility:

``` text
Moderator → hidden
Administrator → hidden
```

unless the Founder explicitly changes the policy later.

Normal elevated permissions and Tester visibility are separate systems.

------------------------------------------------------------------------

# 35. API PROTECTION

Every public endpoint returning creators/products must apply the same
Tester visibility rule.

Do not return Tester records and expect the frontend to hide them.

Audit existing discovery endpoints and any new public endpoints.

------------------------------------------------------------------------

# 36. EXTERNAL SERVICE ISOLATION

Audit that failures in:

-   Stripe.
-   Storage.
-   Email.
-   Search.
-   Analytics.
-   Other external APIs.

cannot unnecessarily crash unrelated marketplace pages.

Examples:

``` text
Email unavailable → product page still renders
Stripe unavailable → browse still renders
Missing image → product page still renders
Search unavailable → browse still renders
```

Use controlled degraded states.

------------------------------------------------------------------------

# 37. ERROR SEMANTICS

Distinguish:

``` text
Valid empty state
Missing optional relation
401 Unauthorized
403 Forbidden
404 Not Found
400 Invalid input
409 Conflict
429 Rate limit
500 Internal error
503 Service unavailable
Database schema mismatch
Unexpected exception
```

Do not turn every error into:

``` text
[]
```

Do not turn every error into:

``` text
/dashboard
```

------------------------------------------------------------------------

# 38. DEPLOYMENT SAFETY

Future database changes must be deployed safely.

Preferred pattern:

``` text
Database migration
↓
Compatible application code
↓
Backfill if required
↓
Switch reads/writes
↓
Remove obsolete structure later
```

Do not deploy code requiring a table/column before production has it.

------------------------------------------------------------------------

# 39. DEPLOYMENT GATE

Before production deployment:

``` text
Prisma validation
+
Migration validation
+
Migration status
+
Database compatibility check
+
Build
+
Type check
+
Lint
+
Route smoke tests
```

Production deployment must not knowingly contain application/database
incompatibility.

------------------------------------------------------------------------

# 40. REQUIRED KILO AUDIT OUTPUT

Before broad modifications, Kilo must report:

## Production Error Inventory

``` text
Digest:
Prisma code:
Model:
Table:
Route:
Frequency:
Root cause:
```

## Database Inventory

``` text
Prisma models:
Production tables:
Missing tables:
Missing columns:
Enum mismatches:
Relation mismatches:
Pending migrations:
Failed migrations:
```

## Route Inventory

``` text
Route:
Server loader:
Prisma dependencies:
API dependencies:
External dependencies:
Authorization:
Current failure handling:
```

## Permission Inventory

``` text
Role:
Permission:
Route:
Middleware:
Server authorization:
API authorization:
Current behavior:
Expected behavior:
```

## Tester Inventory

``` text
Tester representation:
Public queries:
Public APIs:
Search:
Sitemap:
Direct URLs:
Founder behavior:
Non-Founder behavior:
```

## Manager Navigation Inventory

``` text
Button:
Current page:
Expected route:
Actual route:
Required permission:
Redirect source:
```

------------------------------------------------------------------------

# 41. REPAIR ORDER

Use this order:

``` text
1. Audit production database/migration consistency
↓
2. Repair confirmed StaffPick/schema mismatch
↓
3. Audit every Prisma table/column/relation/enum
↓
4. Repair shared data services
↓
5. Repair canonical session/role/permission resolution
↓
6. Repair Moderator authorization
↓
7. Implement Tester Founder-only visibility
↓
8. Repair Admin/Moderation Manager navigation
↓
9. Add/verify route and API error boundaries
↓
10. Test navigation
↓
11. Run production smoke tests
↓
12. Monitor production logs
```

------------------------------------------------------------------------

# 42. REQUIRED TEST MATRIX

## Database

-   Production migration status correct.
-   Every required Prisma model has production structure.
-   Required columns exist.
-   Relations match.
-   Enums are compatible.
-   No pending required migration remains.

## Staff Picks

-   Query works.
-   Empty state works.
-   Populated state works.
-   Optional failure cannot destroy homepage.
-   Digest `4001367242` stops recurring.

## Public

Test actual routes for:

``` text
Home
Browse
Categories
Creators
Creator profiles
Products
Tutorials
API docs
```

## Account

Test actual routes for:

``` text
Profile
Settings
Wishlist
Cart
Orders
Licenses
Notifications
```

## Creator

Test actual routes for:

``` text
Creator Hub
Products
New Product
Edit Product
Store
Orders
Customers
Licenses
Payouts
```

## Moderation/Admin

Test actual routes for:

``` text
Moderation
Queue
Reports
Product review
Creator/store review
History
Admin management
```

------------------------------------------------------------------------

# 43. TESTER PRIVACY TESTS

Founder:

``` text
Creator directory → Tester visible
Search → Tester visible where appropriate
Tester profile → accessible
Tester store → accessible
Tester products → accessible
```

Everyone else:

``` text
Creator directory → Tester hidden
Search → Tester hidden
Tester profile → protected
Tester store → protected
Tester products → protected
Public API → Tester excluded
Sitemap → Tester excluded
Counts → Tester excluded
```

------------------------------------------------------------------------

# 44. MANAGER NAVIGATION TESTS

For every Manager button:

-   Click it.
-   Confirm correct destination.
-   Refresh.
-   Open direct URL.
-   Browser Back.
-   Browser Forward.
-   New tab.
-   Correct role.
-   Incorrect role.
-   Expired session.

Expected:

``` text
Authorized → management page
Unauthorized → controlled 403/access denied
```

Never:

``` text
Authorized → Dashboard
```

because of a broken guard or loading race.

------------------------------------------------------------------------

# 45. NAVIGATION STRESS TEST

Repeatedly test:

``` text
Home ↔ Browse
Browse ↔ Categories
Categories ↔ Creators
Creators ↔ Product
Product ↔ Creator
Creator Hub ↔ Product
Moderation ↔ Product
Admin ↔ Management
```

Also:

``` text
Rapid clicks
Back
Forward
Refresh
Direct URL
Multiple tabs
Mobile viewport
```

There must be no:

``` text
HTTP 500
Raw application error
Unexpected Dashboard redirect
Unexpected login
Session reset
False Access Denied
```

------------------------------------------------------------------------

# 46. SECURITY RULES

Do not:

-   Disable authorization.
-   Disable RLS.
-   Trust client roles.
-   Trust client Founder flags.
-   Hide Tester only in React.
-   Expose Tester through public APIs.
-   Make Moderator an Administrator.
-   Give all roles all permissions.
-   Create generic `manage_everything`.
-   Use Dashboard as a universal error redirect.

------------------------------------------------------------------------

# 47. DATA SAFETY RULES

Do not:

-   Reset production.
-   Drop production tables.
-   Delete creators.
-   Delete products.
-   Delete orders.
-   Delete licenses.
-   Delete payouts.
-   Delete moderation records.
-   Delete Tester data just to hide it.
-   Create fake creators.
-   Create fake products.
-   Create fake Staff Picks.
-   Create fake orders/reviews.

Privacy is implemented through authorization/visibility, not destructive
deletion.

------------------------------------------------------------------------

# 48. NO DUPLICATE SYSTEMS

Do not create:

-   Second account system.
-   Second role system.
-   Second permission system.
-   Second creator system.
-   Second store system.
-   Second moderation system.
-   Second Staff Picks system.
-   Duplicate management routing system.

Repair the canonical systems already in PawVault.

------------------------------------------------------------------------

# 49. FINAL DEFINITION OF DONE

## Production stability

-   Homepage returns HTTP 200.
-   Major routes do not produce raw server exceptions.
-   Digest `4001367242` stops recurring.
-   Other production crash digests are investigated.
-   Shared data services are stable.
-   Optional sections are resilient.
-   Error boundaries are present.

## Database

-   Prisma schema matches production.
-   Required migrations are applied.
-   Missing tables are repaired.
-   Missing columns are repaired.
-   Relations are correct.
-   Enums are compatible.
-   No production reset occurred.
-   No marketplace data was deleted.

## Moderator access

-   Correct Moderators can access permitted moderation tools.
-   Moderator is not incorrectly treated as Administrator.
-   Unauthorized users remain blocked.
-   Permission loading does not cause false denial.
-   Server-side authorization is authoritative.

## Tester privacy

For every non-Founder:

``` text
Tester account = hidden
Tester creator = hidden
Tester store = hidden
Tester products = hidden
Tester search = hidden
Tester APIs = hidden
Tester direct URLs = protected
Tester counts = excluded
Tester sitemap = excluded
```

For Founder:

``` text
Tester data = visible according to Founder authority
```

## Manager navigation

Authorized:

``` text
Manager button
↓
correct canonical management route
↓
management page
```

Unauthorized:

``` text
management route
↓
controlled 403 / Access Denied
```

Never:

``` text
management route
↓
Dashboard
```

merely because a permission check failed or was still loading.

## Navigation

-   Page switching works.
-   Back/Forward works.
-   Refresh works.
-   Direct URLs work.
-   Multiple tabs work.
-   Sessions remain intact.
-   No logout/login workaround is introduced.
-   No route-specific hacks are required.

------------------------------------------------------------------------

# 50. ABSOLUTE RULE

**PawVault must be repaired as one application, not as a pile of
individual page patches.**

The confirmed StaffPick error proves that at least one production
database dependency is missing.

The Moderator Access Denied issue requires a proper
role/permission-chain audit.

The Tester account requires server-side Founder-only visibility.

The Manager buttons require a real route/permission-chain repair.

The repeated page-switching crashes require shared dependency and route
resilience testing.

**No fake data.\
No destructive production reset.\
No universal Dashboard redirects.\
No frontend-only privacy.\
No role escalation.\
No duplicate systems.**

Fix the foundation, then verify the whole marketplace end-to-end.
