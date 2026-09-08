# PawVault — Master Full Marketplace Audit & Repair Plan

## Purpose

This is the master repair specification for PawVault.

The goal is NOT to redesign one button or patch one crash.

The goal is to make PawVault behave like one coherent marketplace where:

- public marketplace pages work
- navigation never randomly breaks
- product links resolve to the correct product
- creators/products/counts come from the same canonical data
- likes/favorites/wishlist work
- free products can be acquired
- paid products can be browsed and added to cart before purchase
- paid files stay locked until confirmed payment
- checkout/order/payment/entitlement/license/download states agree
- creator ownership is separate from moderation authority
- Creator Hub only controls creator-owned content
- moderation is separate
- stores/profiles/creators resolve consistently
- categories/search/discovery use real data
- uploads/media/files are reliable
- refunds revoke/adjust access according to policy
- no fake data is used
- no logout/login workaround is required
- page transitions do not randomly crash
- API, database, server actions, client state and RLS agree
- existing functionality is repaired instead of duplicated

## Current live observations

The public `/browse` page currently renders a marketplace with filters and reports one product. The product card exposes a product route that currently returns a 404 when followed from the live page. This is a critical route/link consistency defect.

The live `/categories` page currently renders a category and asset count.

The live `/creators` page currently reports `0 creators`, `0 published products`, and `0 followers`, despite the browse page showing a published product associated with a creator. That strongly suggests inconsistent creator/discovery data resolution, filtering, approval state, cache, or query logic.

The API documentation advertises canonical systems for products, wishlist, cart/checkout, orders/refunds, licenses, reviews, notifications, and search/discovery. These must be wired together rather than implemented as isolated features.

## Absolute rules

1. Audit existing code before creating anything.
2. Do not create duplicate product, creator, store, cart, wishlist, order, license, entitlement, file, review, moderation, or notification systems.
3. Use one canonical database model for each concept.
4. Server authorization is authoritative.
5. Client state is presentation only.
6. Do not use fake marketplace data.
7. Do not silently convert paid products to free.
8. Do not grant paid downloads before confirmed payment.
9. Do not require payment merely to view, like, wishlist, or add a paid product to cart.
10. Do not let cart membership equal ownership.
11. Do not let creator ownership equal customer purchase entitlement.
12. Do not let moderation permissions become creator ownership.
13. Do not require logout/login to make state changes appear.
14. Do not fix a route by adding a second route that creates a duplicate system.
15. Preserve historical orders, licenses, payouts and customer entitlements.
16. Do not casually delete creator-owned content.
17. Do not use generic `manage_everything` permissions.
18. Do not hide server errors behind generic success messages.
19. Do not make a UI button appear functional if the backend cannot complete it.
20. Every important write must be idempotent where retries are possible.

---

# 1. Canonical marketplace architecture

Use one flow:

```text
Public discovery
    ↓
Canonical product
    ↓
Public product page
    ↓
Social interaction / cart
    ↓
Checkout
    ↓
Payment confirmation
    ↓
Order
    ↓
Entitlement
    ↓
License
    ↓
Protected download
```

Creator side:

```text
Creator account
    ↓
Creator approval
    ↓
Creator/store identity
    ↓
Own products
    ↓
Product submission/publishing
    ↓
Orders/customers/earnings
```

Platform side:

```text
Moderation
    ↓
Review submitted marketplace content
    ↓
Approve / request changes / reject / suspend / remove
```

These systems intersect through IDs and state, not through duplicated ownership logic.

---

# 2. First priority: route integrity

Every product URL must resolve consistently.

There must be one canonical product route format.

Do not allow:

```text
/products/foo
/product/foo
/products?id=...
/product?id=...
```

to represent the same product through unrelated implementations.

Create one route resolver.

It should:

1. accept the canonical slug
2. load the canonical product
3. verify public visibility
4. load safe creator information
5. load safe public media
6. load public reviews
7. load access state for the current user
8. render the canonical product page

If an old route exists, redirect it intentionally to the canonical route rather than maintaining a second page.

---

# 3. Navigation must be transaction-safe

Page switching must not crash because a previous page is still loading.

Audit:

- route transitions
- React Server Components
- client effects
- query parameters
- Suspense boundaries
- loading states
- abort/cancellation
- stale responses
- state updates after unmount
- router refresh
- `router.push`
- `router.replace`
- server actions
- fetch failures
- JSON parsing failures

A stale response from Page A must never overwrite Page B.

Example:

```text
Browse
↓
Category
↓
Product
↓
Back
↓
Browse
```

must remain stable.

Also test rapid switching:

```text
Browse → Category → Creator → Product → Browse
```

without waiting between every click.

---

# 4. Browse marketplace

The browse page must use real canonical product data.

Verify:

- product query
- publication status
- moderation status
- creator approval
- category
- price
- sale price
- rating
- likes
- tags
- media
- pagination
- sorting
- filters
- search
- free
- sale
- creator

Every card must link to a real canonical product URL.

A card must never render if its route cannot resolve.

---

# 5. Browse filters

Audit every filter independently and in combinations:

- category
- search
- minimum price
- maximum price
- minimum rating
- free only
- on sale
- tags
- creator
- sort
- pagination

Test:

```text
filter → filter
filter → clear
filter → sort
filter → pagination
filter → product → back
```

Do not reset unrelated filters when one filter changes unless intentionally designed.

URL query parameters should be the canonical representation if the current architecture supports shareable filters.

---

# 6. Categories

Category pages must resolve from the same category taxonomy used by products.

Do not have:

```text
Browse category names
```

and:

```text
database category names
```

as separate uncontrolled lists.

Every category should have:

- stable ID
- stable slug
- display name
- parent category if hierarchical
- active state
- ordering
- product count

Product counts must use the same publication/moderation visibility rules as browse.

---

# 7. Creators directory

The creators page must never show zero creators when approved creators with published products exist unless the data truly says zero.

Audit:

- creator query
- creator approval
- store approval
- product publication
- profile visibility
- follower count
- product count
- sales count
- rating
- pagination
- search
- caching
- RLS

Creator identity must resolve from the canonical creator/user/store relationship.

---

# 8. Creator/store/profile identity

There must be one resolver:

```text
user
↓
creator profile
↓
store
```

Do not make product cards use one creator table while creator pages use another.

For every product, resolve:

```text
product.creatorId
→ creator
→ user/profile
→ store
```

If a creator is missing, fail gracefully rather than crashing.

---

# 9. Public product page

A product page should safely load:

- product
- creator
- store
- media
- public file metadata
- category
- tags
- reviews
- rating
- likes
- current user wishlist state
- current user ownership state
- price
- sale
- license summary
- compatibility
- requirements
- version information

Private file URLs must never leak.

---

# 10. Social interactions

Likes, favorites and wishlist are public marketplace interactions.

A paid product can be:

- viewed
- liked
- wishlisted
- added to cart

before purchase.

Purchase is required only for protected paid content.

Audit the existing wishlist endpoint and database relation rather than creating another favorite system.

---

# 11. Cart

Cart state is not entitlement.

A paid item in cart means:

```text
customer intends to purchase
```

It does not mean:

```text
customer owns
```

Cart operations must:

- validate product
- validate publication state
- validate price server-side
- prevent invalid quantities
- prevent deleted products
- handle duplicate additions
- preserve guest cart where supported
- merge guest cart into account cart safely
- avoid duplicate cart rows

---

# 12. Free products

Free product flow:

```text
Public product
↓
Get/Add
↓
Free acquisition
↓
Order/entitlement if architecture requires it
↓
License if required
↓
Download
```

Do not fake Stripe payment for £0.

Do not create fake creator revenue.

---

# 13. Paid products

Paid product flow:

```text
Public product
↓
Like/Wishlist/Cart
↓
Checkout
↓
Server-calculated amount
↓
Stripe
↓
Verified webhook/payment
↓
Paid order
↓
Entitlement
↓
License
↓
Download
```

Before confirmed payment:

```text
NO DOWNLOAD
NO PRIVATE FILE URL
NO ENTITLEMENT
NO LICENSE
```

---

# 14. Payment authority

Do not unlock content merely because:

- Stripe redirect succeeded
- frontend says paid
- localStorage says purchased
- URL contains success
- cart says purchased
- client posts `paid=true`

Server-side payment/order state is authoritative.

---

# 15. License generation

The current API documentation exposes license generation.

Audit it extremely carefully.

A customer must not be able to call a generic license-generation endpoint with:

```text
productId
orderId
userId
```

and manufacture ownership.

License generation must verify:

- authenticated requester
- order exists
- order belongs to requester or authorized staff
- order is completed
- order item includes product
- payment is valid
- refund/chargeback does not revoke access
- license does not already exist
- idempotency

---

# 16. Download authorization

Every protected download request must independently verify access.

Conceptually:

```text
request
↓
session
↓
customer
↓
product/file
↓
valid entitlement/license
↓
order/payment state
↓
signed URL
```

Do not expose storage URLs directly.

---

# 17. Reviews

Review visibility can be public.

Review creation should follow the existing policy.

If verified reviews require ownership:

```text
completed purchase
↓
review allowed
```

But lack of purchase must not prevent:

- viewing reviews
- liking product
- wishlist
- cart

---

# 18. Creator Hub

Creator Hub must be scoped to the creator's own account.

Creator can manage:

- own products
- own media
- own files
- own store
- own pricing
- own descriptions
- own analytics
- own orders/customers where permitted
- own payout information

Creator cannot use Creator Hub controls to approve unrelated creators' assets unless separately authorized by a platform moderation permission.

---

# 19. Moderation

Moderation is separate.

Recommended product lifecycle:

```text
DRAFT
↓
SUBMITTED
↓
UNDER_REVIEW
↓
APPROVED
↓
PUBLISHED
```

Possible moderation outcomes:

```text
REQUEST_CHANGES
REJECTED
SUSPENDED
REMOVED
```

Do not collapse all of these into one `published` boolean.

---

# 20. Ownership boundaries

Founder/platform authority does not automatically mean creator-content ownership.

Do not allow normal moderation UI to:

- change another creator's price
- edit another creator's files
- rewrite another creator's description
- make paid products free
- transfer ownership
- change payouts
- publish private creator content
- permanently delete creator-owned content

Moderation may restrict marketplace visibility according to policy.

---

# 21. Media/files

Audit:

- upload
- validation
- MIME type
- size
- storage
- CDN
- thumbnails
- video processing
- compression
- original preservation
- product attachment
- deletion
- replacement
- versioning
- quarantine
- malware scanning
- orphan cleanup

Never silently destroy creator originals during optimization.

---

# 22. Database consistency

Search for duplicate or conflicting fields such as:

```text
creatorId
creator_id
ownerId
owner_id
storeId
store_id
published
isPublished
status
moderationStatus
approvalStatus
price
salePrice
amount
```

Do not blindly rename production fields.

Map existing schema first.

---

# 23. API contract consistency

Every frontend call must match the server contract.

Audit:

- method
- URL
- body
- query
- headers
- auth
- response
- status codes
- error format

Do not make frontend work by guessing.

---

# 24. Error handling

Every expected failure needs a useful result.

Do not turn:

```text
403
```

into:

```text
500
```

Do not turn:

```text
404
```

into:

```text
Application error
```

Do not return:

```text
Invalid input.
```

without logging the actual validation failure server-side.

---

# 25. Cache and revalidation

Audit:

- Next.js caching
- route cache
- fetch cache
- server cache
- database cache
- CDN
- product revalidation
- creator revalidation
- category revalidation

The same product cannot be:

```text
published in Browse
```

while:

```text
missing in Creators
```

because two pages use incompatible cached snapshots.

---

# 26. Search/discovery

Search must use the same product visibility rules.

Search results must never expose:

- drafts
- removed products
- suspended products when policy says hidden
- private creator content

Search result URLs must resolve.

---

# 27. Pagination

Never calculate pagination from a different query than the actual rows.

Use:

```text
rows
+
count
```

from the same filter state.

Do not display:

```text
1 product found
```

while another page silently contains different products.

---

# 28. Mobile/responsive

Test:

- desktop
- tablet
- phone
- narrow browser
- long creator names
- long product titles
- large images
- missing images
- loading
- empty state
- errors

Buttons must remain clickable.

---

# 29. Accessibility

Audit:

- buttons
- links
- labels
- form errors
- keyboard navigation
- focus restoration after navigation
- dialog focus
- loading announcements
- image alt text
- contrast
- disabled state

---

# 30. Observability

Add structured logging around:

- route failures
- product resolution
- creator resolution
- category resolution
- cart writes
- checkout
- payment webhook
- entitlement creation
- license generation
- download authorization
- moderation actions

Include IDs, not secrets.

Never log:

- passwords
- API keys
- Stripe secrets
- signed download URLs
- session cookies

---

# 31. Testing

Minimum end-to-end matrix:

### Guest

- browse
- filter
- search
- category
- creator
- product
- like behavior according to auth policy
- wishlist behavior according to auth policy
- add free item
- add paid item
- checkout entry

### Signed-in customer

- wishlist
- like
- cart
- free acquisition
- paid checkout
- failed payment
- successful payment
- download
- refund
- license

### Creator

- own store
- own product
- upload
- edit
- pricing
- publish/submission
- own orders
- payouts

### Moderator

- moderation queue
- request changes
- reject
- suspend
- remove
- audit log

### Founder

- platform controls
- creator role
- scoped moderation
- no accidental creator-content takeover

---

# 32. Definition of done

PawVault is not considered repaired until:

- Browse links resolve
- Categories resolve
- Creators show real creators
- Product pages resolve
- Navigation does not randomly crash
- Likes work
- Wishlist works
- Cart works
- Free acquisition works
- Paid checkout works
- Paid files remain locked before payment
- Paid files unlock after verified payment
- Licenses cannot be fabricated
- Creator data is consistent everywhere
- Creator ownership is scoped
- Moderation is separate
- Refund behavior is consistent
- No fake data remains
- No duplicate systems were created
- No logout/login workaround is required
- Real production-like tests pass

