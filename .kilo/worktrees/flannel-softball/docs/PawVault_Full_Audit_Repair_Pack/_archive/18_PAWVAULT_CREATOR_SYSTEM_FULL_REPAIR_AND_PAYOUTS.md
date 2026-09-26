# PawVault — Creator Systems Full Repair & Payouts Audit

## Purpose

PawVault's Creator Hub and creator-facing systems still have multiple broken or incomplete areas, including payouts.

This document is a **full repair/audit specification for Kilo**.

The goal is to make the existing PawVault creator system actually work end-to-end using the current project, database, authentication, storage, Stripe integration, product system, store system, orders, licenses, and notifications.

**Do not build a demo. Do not create fake data. Do not create duplicate systems. Audit first, then repair the existing implementation.**

---

# 1. Absolute Rules

- Use the existing PawVault project.
- Do not create a second Creator Hub.
- Do not create a second creator/account system.
- Do not create a second store system.
- Do not create a second payout/payment system.
- Do not create a second authentication system.
- Do not fake successful payouts, orders, products, analytics, sales, or balances.
- Do not fabricate creator statistics.
- Do not reset or wipe the production database.
- Do not make creators log out and back in.
- Do not silently transfer creator ownership.
- Do not silently alter creator prices, files, licenses, or payout settings.
- Do not bypass authorization to make a feature appear to work.
- Do not hide backend errors behind generic success messages.
- Do not fix one page while leaving the shared underlying system broken.
- Reuse existing APIs, database models, sessions, and Stripe infrastructure where possible.
- If an existing system is broken, fix the root cause instead of creating a replacement.
- Preserve existing products, files, orders, licenses, customers, reviews, stores, and creator records.
- Founder/admin authority remains scoped.
- Creator ownership remains with the creator.

---

# 2. Current Priority

The creator system needs a **full audit**, not isolated UI patches.

Known/problem areas include:

- Creator Hub authentication/session stability
- Creator approval/verification
- Creator account resolution
- Store Settings
- View Store
- Public creator profiles
- `/creators`
- Product creation
- Product editing
- Product files
- Product media
- Product publishing
- Orders
- Customers
- Licenses
- Payouts
- Payments
- Analytics
- Reviews
- Promotions
- Discounts
- Posts
- Collections
- creator notifications
- permissions
- API authorization
- database/RLS consistency
- Stripe Connect
- payout onboarding
- balances
- transfers
- refunds
- disputes
- webhook synchronization

The implementation must identify every broken creator-facing dependency and repair it systematically.

---

# 3. Audit First

Before modifying code, inspect the entire creator stack.

## Frontend

Inspect:

- Creator Hub layout
- Creator Hub sidebar
- Overview
- Products
- Create Product
- Edit Product
- Orders
- Customers
- Licenses
- Payouts
- Payments
- Analytics
- Reviews
- Promotions
- Discounts
- Posts
- Collections
- Store Settings
- View Store
- public creator profile
- `/creators`

For every page determine:

- API endpoint used
- auth/session requirements
- role requirements
- creator/store lookup
- loading state
- empty state
- error state
- database dependency
- permissions
- whether data is real or hardcoded
- whether the route is accidentally redirecting

---

# 4. Authentication / Session

This is a high-priority shared dependency.

The Creator Hub must use the existing PawVault authentication/session.

Do not create another login system.

Verify:

- browser session
- server session
- API session
- cookies
- fetch credentials
- middleware
- route guards
- role resolution
- creator account resolution
- store ownership resolution

A logged-in creator must remain logged in when navigating through Creator Hub.

Do not redirect valid creators to sign-in because one API request fails.

---

# 5. HTTP Error Semantics

Audit all creator APIs.

Use:

- `401` = unauthenticated
- `403` = authenticated but not authorized
- `404` = resource does not exist/is not visible
- `409` = conflict
- `422` = valid request but invalid business data
- `500` = unexpected server error

Do not return:

`Invalid input.`

for unrelated errors.

Return structured errors with safe user-facing messages.

---

# 6. Creator Account Resolution

There must be one canonical way to resolve the creator account from the authenticated user.

Verify:

```text
authenticated user
        ↓
PawVault user/account
        ↓
creator account
        ↓
creator approval/verification
        ↓
store
        ↓
products/orders/payouts/etc.
```

Do not have different pages invent different lookup logic.

A creator who is already approved/verified must resolve consistently everywhere.

---

# 7. Creator Approval

Audit the existing creator approval system.

Verify:

- creator application/record
- approval status
- verification state
- creator role
- Founder/admin approval permissions
- API validation
- database state
- RLS
- audit logs
- creator notifications

Approval should be idempotent.

Approving an already approved creator should not create duplicate records or corrupt state.

---

# 8. Creator Roles and Permissions

Creator permissions should be derived server-side.

A creator should be able to manage their own:

- products
- files
- media
- store
- orders/customer information they are entitled to see
- licenses
- payouts
- payments
- analytics
- reviews
- promotions
- discounts
- posts
- collections

Only where the existing business rules permit each feature.

A creator must not be able to access another creator's private information.

Never trust role information supplied by the browser.

---

# 9. Store System

Audit:

`/creator/store/settings`

and public store/profile resolution.

Verify:

- creator owns store
- store exists
- store slug is valid
- store settings save
- store settings load
- public store resolves
- View Store resolves the correct store
- no `/store/create` redirect for an existing creator
- public store works after refresh
- slug changes do not break references
- creator profile links to store
- product creator links point to store/profile

Do not create a new store record simply because lookup failed.

---

# 10. Creator Directory

`/creators` must use real database data.

It should automatically update as creators join and become publicly eligible.

Do not hardcode:

- creator count
- product count
- follower count
- sales
- ratings

Creator cards must link to real creator profiles/stores.

---

# 11. Product Creation

Audit the complete flow:

```text
Create Product
↓
product record
↓
creator ownership
↓
pricing
↓
category
↓
tags
↓
media
↓
download files
↓
license
↓
publishing validation
↓
published product
```

Every step must use the same product ID and creator ID.

Do not recreate the product between steps.

---

# 12. Product Files

Fix the existing upload pipeline.

Verify:

- upload request
- FormData
- API
- authentication
- product ownership
- storage
- MIME validation
- extension validation
- size limits
- database file record
- cleanup
- retry behavior
- downloads

`.unitypackage` must work if supported by PawVault's existing stated file rules.

Do not fake upload success.

Do not store only frontend metadata.

---

# 13. Product Media

Fix the existing ProductMedia database/schema issue.

Known visible error:

`The column updatedAt does not exist in the current database.`

Audit:

- Prisma model
- actual database table
- migration history
- generated Prisma client
- production database connection
- ProductMedia updateMany calls

Do not blindly remove `updatedAt`.

Determine whether the application or database is wrong and bring them into consistency.

Preserve existing media.

---

# 14. Product Publishing

Publishing must validate:

- creator is authorized
- product is owned by creator
- required fields exist
- valid price
- valid category
- valid tags
- required media exists if applicable
- required download files exist if applicable
- license is valid
- creator approval is valid
- payout setup requirements are satisfied where legally/business required

Drafts may remain incomplete.

Published products must meet marketplace requirements.

---

# 15. Product Ownership

Every creator product operation must enforce ownership server-side.

Creator A must never be able to:

- edit Creator B's product
- upload to Creator B's product
- change Creator B's price
- change Creator B's files
- change Creator B's license
- change Creator B's payouts
- view Creator B's private customer data

Founder/admin moderation remains separate from creator ownership.

---

# 16. Orders

Audit creator order visibility.

A creator should see real orders involving their products.

Verify:

- order lookup
- order items
- creator ownership
- payment state
- fulfillment state
- refund state
- customer privacy
- pagination
- totals

Do not expose another creator's order information.

Multi-creator orders must be correctly split logically by order item/allocation.

---

# 17. Customers

Audit creator customer views.

A creator should only see customer information they are legitimately entitled to see for their products/orders.

Respect:

- privacy
- legal requirements
- platform policies
- order relationships

Do not expose platform-wide customer databases to creators.

---

# 18. Licenses

Audit:

- license issuance
- license lookup
- product association
- customer association
- creator association
- revocation
- refund behavior
- download entitlement

Refunding/revoking one creator's product must not corrupt unrelated licenses.

---

# 19. PAYOUTS — HIGH PRIORITY

Payouts must be treated as a real financial system.

Do not fake balances.

Do not fake payout completion.

Do not simply display a number calculated in the browser.

Use the existing Stripe marketplace architecture.

---

# 20. Stripe Connect

Audit the existing Stripe Connect integration.

Verify:

- connected account creation
- account ID storage
- account ownership
- account status
- onboarding
- requirements
- charges/payout capability
- country/currency support
- platform/creator relationship

Use the existing Stripe integration if already present.

Do not create a second Stripe integration.

---

# 21. Creator Payout Onboarding

The Payouts page should clearly show the creator's real onboarding state.

Possible states:

- Not started
- Onboarding required
- Information required
- Under review
- Ready for payouts
- Restricted
- Disabled

The exact labels should reflect Stripe's actual account state.

Do not say:

`Ready for payouts`

unless the backend confirms it.

---

# 22. Stripe Account Requirements

Where applicable, surface real Stripe requirements.

Examples:

- verification required
- identity information required
- bank account required
- tax information required
- capabilities pending
- payouts disabled

Do not expose sensitive Stripe internals unnecessarily.

Provide a clear action to continue onboarding when appropriate.

---

# 23. Payout Balance

Creator balance must come from real financial records.

Do not calculate:

`sales - random fee`

in the frontend.

The system needs a consistent ledger/financial model.

At minimum distinguish:

- gross sales
- discounts
- tax where applicable
- refunds
- platform fees
- payment processing costs where applicable
- creator net amount
- pending balance
- available balance
- paid/payout amount

Do not count refunded revenue as available creator earnings.

---

# 24. Money Precision

All money calculations must use integer minor units.

Example:

`£10.99 → 1099`

Never use floating-point arithmetic for financial amounts.

Store currency explicitly.

Never mix GBP and another currency without an explicit conversion/business rule.

---

# 25. Multi-Creator Cart

If a customer purchases products from multiple creators in one checkout:

The system must correctly attribute money to each creator.

Do not assign the entire checkout to one creator.

Maintain:

- order
- order items
- creator allocation
- platform fee
- transfer/payment records

Each creator should only see their own financial portion.

---

# 26. Payment State

Creator financial records must be driven by actual payment state.

Possible payment lifecycle:

```text
Checkout created
↓
Payment pending
↓
Payment succeeded
↓
Order fulfilled
↓
Creator allocation recorded
↓
Transfer eligible
↓
Transfer/payout processing
↓
Paid
```

The exact flow must match the existing Stripe architecture.

Never mark money as paid because a frontend button was clicked.

---

# 27. Stripe Webhooks

Audit all relevant Stripe webhooks.

At minimum inspect events related to:

- checkout completion
- payment success/failure
- connected account changes
- capability changes
- payout events
- refund events
- dispute events

Webhook handling must be:

- authenticated
- idempotent
- retry-safe
- auditable

Do not process the same event twice.

---

# 28. Webhook Idempotency

Every processed Stripe event should have a durable event ID.

If the same event arrives twice:

- do not duplicate order
- do not duplicate transfer
- do not duplicate payout record
- do not duplicate notification

---

# 29. Refunds

Refunds must update creator financial records correctly.

If a customer receives a refund:

- order state updates
- entitlement/license state follows existing refund rules
- creator earnings are adjusted
- platform fee handling follows the configured business rules
- Stripe state remains authoritative

Do not simply subtract from a displayed balance without recording the underlying financial event.

---

# 30. Disputes / Chargebacks

Where supported, creator finance should account for disputes.

A disputed transaction should not continue to appear as unquestionably available earnings.

Record:

- dispute state
- amount
- affected order/payment
- creator allocation
- resolution

Do not fake dispute resolution.

---

# 31. Financial Ledger

If the existing system lacks a proper ledger, audit whether one is needed.

A conceptual ledger may record:

- sale credit
- refund debit
- fee
- adjustment
- transfer
- payout
- dispute adjustment

Each entry should have:

- ID
- creator
- amount
- currency
- type
- source transaction
- order/payment reference
- timestamp
- status

Do not create duplicate financial truth if an existing ledger already exists.

---

# 32. Payout History

Creator Payouts should show real history.

Possible columns:

- date
- amount
- currency
- status
- payout/transfer reference
- related period/order information where appropriate

States must come from actual records.

---

# 33. Payments Page

Creator Payments should not be confused with Payouts.

Payments can represent incoming marketplace payment/order information.

Payouts represent money moving to the creator.

Keep these concepts separate.

---

# 34. Analytics

Audit Creator Analytics.

Use real events only.

Potential metrics:

- sales
- revenue
- orders
- products
- views
- downloads
- conversion rate
- refunds

If a metric does not have reliable underlying events, do not display fake numbers.

Handle empty states:

`Not enough data yet.`

---

# 35. Reviews

Audit creator review access.

Creators may see reviews for their own products.

Verify:

- review belongs to product
- product belongs to creator
- customer eligibility
- moderation state
- pagination
- rating aggregation

Do not allow creators to edit customer reviews unless an explicit system exists.

---

# 36. Promotions

Audit promotions.

Verify:

- creator ownership
- product eligibility
- date range
- discount rules
- price calculation
- checkout integration
- display
- expiration

Do not allow discounts to corrupt creator base prices.

---

# 37. Discounts

Separate:

- creator discounts
- platform-wide promotions
- coupons
- sale pricing

Do not mix these into one ambiguous field.

The final charged amount must be reproducible from stored order snapshots.

---

# 38. Posts

Audit creator posts.

Verify:

- creator ownership
- create/edit/delete
- visibility
- media
- timestamps
- public creator page
- product/collection links where supported

Public post creator identity must link to the real creator profile/store.

---

# 39. Collections

Audit creator collections.

Verify:

- creator ownership
- products belong to creator or are otherwise legitimately referenceable
- collection visibility
- ordering
- public display
- no unauthorized product mutation

Collections must not transfer product ownership.

---

# 40. Store Settings

Audit all settings fields.

Changes should:
- save to the real database
- reload correctly
- update public store
- preserve existing values
- validate input
- enforce ownership

Do not show success unless the database write actually succeeds.

---

# 41. Creator Notifications

Creator actions should produce useful notifications where appropriate.

Examples:

- creator approved
- product published
- product rejected/hidden
- order received
- refund
- payout status
- payout requirement
- review
- promotion status
- store issue
- security event

Notifications must reflect real events.

---

# 42. Email Integration

Use the existing email system.

Do not build another email provider integration inside Creator Hub.

Email is a notification layer, not permission authority.

Important creator emails may include:

- approval
- payout onboarding requirement
- sale/order
- refund
- payout
- moderation
- product publication
- account/security

Do not send an email unless the underlying event actually occurred.

---

# 43. Creator Security

Audit:

- session handling
- creator authorization
- payout account access
- API permissions
- CSRF protection where applicable
- sensitive financial data exposure
- customer privacy
- webhook authentication
- admin privilege escalation

Creators must never be able to manipulate another creator's financial records.

---

# 44. RLS / Supabase

If PawVault uses Supabase/Postgres RLS, audit every creator-facing table.

Verify policies for:

- creators
- stores
- products
- product media
- product files
- orders
- order items
- licenses
- reviews
- promotions
- discounts
- posts
- collections
- payouts
- financial records

Do not rely only on frontend route protection.

---

# 45. Database Schema Consistency

Compare:

- Prisma schema
- migrations
- actual database schema
- generated Prisma client
- application queries

Known example:

`ProductMedia.updatedAt`

must be resolved properly rather than patched blindly.

Look for other similar schema mismatches.

Run a systematic audit rather than waiting for each page to reveal the next missing column.

---

# 46. API Contract Audit

For every Creator Hub API:

Document:

- route
- method
- request shape
- response shape
- authentication
- authorization
- database operations
- possible errors

Compare frontend request payloads against backend validation.

This is especially important for existing `"Invalid input."` errors.

---

# 47. Loading / Error / Empty States

Every Creator Hub page needs distinct states:

### Loading
Actual loading UI.

### Empty
Example:
`No orders yet.`

### Error
Example:
`We couldn't load your payouts. Please try again.`

### Unauthorized
Proper auth/permission handling.

### Success
Real database data.

Do not leave pages stuck on:

`Loading dashboard...`

when the API failed.

---

# 48. No Hardcoded Creator Data

Search for hardcoded:

- creator names
- product counts
- sales
- followers
- ratings
- revenue
- orders
- payout balances
- product IDs

Replace only where the existing application is supposed to use real database data.

Do not replace intentional UI copy or static navigation labels.

---

# 49. Creator Profile Links

Creator identity should be clickable from:

- product cards
- product pages
- posts
- reviews
- creator directory
- orders where appropriate
- collections where appropriate

Every public creator link should resolve to the correct store/profile.

---

# 50. Public Creator Store

A verified creator with a valid store must have:

- public profile
- public store
- product list
- real creator identity
- real products
- real categories
- real links

Do not send existing creators to `/store/create`.

---

# 51. Creator Directory Updates

When a creator becomes publicly eligible:

- `/creators` should update
- creator profile should resolve
- store should resolve
- creator's products should appear
- category counts should update where appropriate

When a creator is suspended:

- public visibility should follow moderation policy
- products should follow product visibility policy
- ownership must remain intact

---

# 52. Moderation Separation

Moderation may:

- hide products
- suspend stores
- restrict accounts
- review reports
- preserve evidence
- handle legal requests

Moderation does not automatically grant ownership of creator content.

Do not use moderation permissions to manipulate creator finances.

---

# 53. Payout/Admin Separation

Admin/Founder should have appropriate visibility into platform finance.

However:

- creator balances must not be editable by arbitrary admins
- payout records must be auditable
- manual adjustments require a dedicated controlled workflow
- manual financial changes require audit logs
- no silent balance edits

---

# 54. Manual Financial Adjustments

If PawVault needs admin adjustments:

Create an explicit adjustment workflow.

Require:

- authorized permission
- amount
- currency
- creator
- reason
- reference
- actor
- timestamp
- audit record

Never directly edit a calculated balance field to make numbers match.

---

# 55. Currency / Region

Audit:

- supported currencies
- creator payout currency
- Stripe account country
- payment currency
- display currency

Do not pretend to support currencies Stripe/PawVault cannot actually settle.

---

# 56. Creator Dashboard Overview

Overview should display real:

- orders
- products
- revenue where available
- pending earnings
- available earnings
- recent orders
- recent reviews
- payout status

If no data exists:

`0` is acceptable when it is a real count.

Do not invent activity.

---

# 57. Creator Hub Navigation

Every sidebar destination must:

- resolve
- load
- authenticate correctly
- display real data
- have useful empty/error states
- preserve creator context

No dead links.

No accidental redirects to sign-in.

No accidental redirects to `/store/create`.

---

# 58. Cross-System Dependency Checks

A Creator Hub feature must not be considered fixed until its dependencies work.

Example:

Payouts depends on:

```text
User
→ Creator
→ Approval
→ Stripe Connected Account
→ Payment
→ Order
→ Creator Allocation
→ Transfer/Payout
```

Products depend on:

```text
User
→ Creator
→ Product
→ Category
→ Tags
→ Media
→ Files
→ License
→ Publishing
```

Store depends on:

```text
User
→ Creator
→ Store
→ Public Profile
→ Products
```

Repair shared dependencies first.

---

# 59. Automated Health Checks

Where practical, add internal diagnostics for:

- creator without store
- approved creator without valid creator account
- creator with invalid Stripe account reference
- product without creator
- product without valid owner
- product with broken media reference
- product with broken file reference
- payout allocation without payment
- payout record without creator
- orphaned storage objects
- orphaned media records
- duplicate creator/store records

Diagnostics must not automatically perform destructive fixes.

---

# 60. Safe Migration Rules

Never use destructive migrations casually.

Do not:

- reset production
- drop creator tables
- drop product tables
- delete orders
- delete licenses
- delete payout history
- delete Stripe references

Use additive migrations and explicit data migrations.

Back up / verify migration state according to the existing deployment process.

---

# 61. Testing

## Authentication

- valid creator stays logged in
- invalid session gets 401
- unauthorized creator gets 403
- no second login system

## Creator

- creator account resolves
- approval state resolves
- store resolves
- public profile resolves
- directory updates

## Products

- create
- edit
- category
- tags
- media
- files
- publish
- unpublish

## Finance

- Connect account
- onboarding
- payment
- allocation
- balance
- refund
- transfer
- payout
- webhook
- duplicate webhook
- dispute

## Ownership

- Creator A cannot edit Creator B's data
- Creator A cannot see Creator B's private customers
- Creator A cannot manipulate Creator B's payouts

## Database

- Prisma schema matches actual DB
- migrations apply cleanly
- RLS passes
- no missing columns
- no broken foreign keys

---

# 62. End-to-End Creator Test

Use a real test creator/account in a safe development/test environment.

Run:

```text
Sign in
↓
Creator account
↓
Approved
↓
Store Settings
↓
Public Store
↓
Create Product
↓
Upload Image
↓
Upload .unitypackage
↓
Category
↓
Tags
↓
License
↓
Publish
↓
Public Product
↓
Checkout
↓
Order
↓
Creator Order
↓
Creator Allocation
↓
Stripe Connected Account
↓
Payout Eligibility
↓
Payout/Transfer
```

Every step must succeed using real persisted data.

---

# 63. Observability

Add safe structured logging around:

- creator resolution
- product ownership
- uploads
- publishing
- checkout
- payment
- allocation
- payout
- webhooks
- store resolution

Never log:

- passwords
- API keys
- Stripe secrets
- full payment credentials
- sensitive personal information unnecessarily

---

# 64. Do Not Hide Failures

Bad:

```text
API failed → show success
```

Bad:

```text
Stripe failed → show £0
```

Bad:

```text
Database error → return empty list
```

Good:

```text
Database error → safe user message + diagnostic server log
```

Good:

```text
Stripe unavailable → clearly show payout status unavailable
```

Good:

```text
No orders → show 0 / empty state
```

---

# 65. Performance

Creator Hub should use:

- efficient queries
- pagination
- indexed fields
- server-side authorization
- sensible caching
- image optimization
- lazy loading
- background processing where appropriate

Do not load the entire order/product/payout history into the browser.

---

# 66. Mobile Creator Hub

Creator Hub must remain usable on mobile.

Ensure:

- sidebar/navigation works
- tables become responsive
- payout status is readable
- product editor works
- uploads work
- media previews work
- buttons remain reachable
- no horizontal overflow

---

# 67. Accessibility

Required:

- keyboard navigation
- visible focus
- semantic labels
- accessible forms
- accessible upload controls
- screen-reader-friendly errors
- sufficient contrast
- non-color-only status indicators

---

# 68. Regression Protection

After fixing the creator system, verify the fixes do not break:

- customer checkout
- product browsing
- downloads
- licenses
- refunds
- public stores
- creator directory
- moderation
- admin
- Stripe webhooks
- email
- media storage

---

# 69. Implementation Order

## Phase 1 — Full Audit

Do not code immediately.

Map every Creator Hub page to its APIs, models, permissions, and dependencies.

## Phase 2 — Shared Infrastructure

Fix:

- authentication/session
- creator resolution
- role/permission resolution
- store resolution
- database/schema mismatches

## Phase 3 — Products

Fix:

- create
- edit
- category/tags
- media
- files
- publishing

## Phase 4 — Commerce

Fix:

- orders
- customers
- licenses
- refunds

## Phase 5 — Stripe / Payouts

Fix:

- Connect
- onboarding
- payment state
- creator allocation
- ledger/financial records
- transfers
- payouts
- webhooks
- refunds/disputes

## Phase 6 — Creator Features

Fix:

- reviews
- promotions
- discounts
- posts
- collections
- analytics
- notifications

## Phase 7 — Public Creator System

Fix:

- profile
- store
- View Store
- `/creators`
- creator/product links

## Phase 8 — Testing

Run complete regression and end-to-end tests.

---

# 70. Required Kilo Audit Output

Before implementing, provide a concise report with:

1. Broken Creator Hub routes
2. Broken APIs
3. Auth/session problems
4. Creator resolution problems
5. Store problems
6. Product problems
7. Media/file problems
8. Order/customer/license problems
9. Stripe/Connect problems
10. Payout problems
11. Database/schema mismatches
12. RLS/security problems
13. Hardcoded/fake data
14. Duplicate systems
15. Recommended implementation order

Then fix the root causes.

---

# 71. Definition of Done

## Creator Identity
- [ ] creator account resolves consistently
- [ ] approval state works
- [ ] role/permissions work
- [ ] creator profile works
- [ ] creator store works
- [ ] `/creators` is dynamic

## Store
- [ ] Store Settings loads
- [ ] Store Settings saves
- [ ] View Store works
- [ ] no `/store/create` redirect for existing stores
- [ ] public creator links work

## Products
- [ ] create works
- [ ] edit works
- [ ] categories work
- [ ] tags work
- [ ] media works
- [ ] files work
- [ ] `.unitypackage` upload works where supported
- [ ] publish works
- [ ] ownership is enforced

## Commerce
- [ ] orders work
- [ ] customers work
- [ ] licenses work
- [ ] refunds work
- [ ] entitlements remain correct

## Payouts
- [ ] Stripe Connect account resolves
- [ ] onboarding works
- [ ] requirements display correctly
- [ ] payment state is real
- [ ] creator allocations are correct
- [ ] balances are real
- [ ] refunds affect earnings correctly
- [ ] transfers/payouts are real
- [ ] payout history works
- [ ] webhook processing is idempotent
- [ ] disputes are handled
- [ ] no fake financial numbers

## Creator Features
- [ ] analytics work
- [ ] reviews work
- [ ] promotions work
- [ ] discounts work
- [ ] posts work
- [ ] collections work
- [ ] notifications work

## Security
- [ ] creator ownership enforced server-side
- [ ] RLS verified
- [ ] no cross-creator data access
- [ ] payout records protected
- [ ] admin permissions scoped
- [ ] webhook signatures verified

## Reliability
- [ ] no unexpected login redirects
- [ ] no generic `Invalid input.` masking
- [ ] no permanent `Loading...`
- [ ] no fake success states
- [ ] no production reset
- [ ] no destructive data loss
- [ ] no duplicate creator systems
- [ ] no duplicate payout systems

---

# 72. Final Kilo Instruction

I do NOT want you to make the Creator Hub "look fixed."

I want the creator infrastructure underneath it to actually work.

If the Payouts page is broken, trace:

**Creator → Stripe Connect → Payment → Order → Creator Allocation → Financial Record → Transfer/Payout → Webhook → UI**

If Product Media is broken, trace:

**Creator → Product → Storage → ProductMedia → Database → UI**

If View Store is broken, trace:

**User → Creator → Store → Slug → Public Profile → Products**

If Creator Hub redirects to login, trace:

**Browser Session → Server Session → API → Role → Creator Account → Route Guard**

Fix the shared root cause rather than patching individual pages.

Do not create fake balances, fake payouts, fake products, fake creators, fake orders, fake analytics, or fake success messages.

Do not reset the database.

Do not make users log out and back in.

Do not create duplicate systems.

Make PawVault's creator system **real, persistent, secure, database-backed, Stripe-backed, creator-owned, and functional end-to-end.**
