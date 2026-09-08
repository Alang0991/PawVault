# 21_PAWVAULT_MODERATION_APPROVAL_WORKFLOW_AND_PRODUCT_CRASH_REPAIR.md

# PawVault — Moderation Workflow Is Incomplete + Product/Category Pages Crash

## Purpose

The current PawVault moderation system is incomplete and the marketplace/product navigation has a server-side crash.

The current behavior shows several separate problems:

1. Moderation can currently suspend or remove products.
2. Moderation cannot approve a product.
3. Moderation cannot tell a creator that a product cannot be added / needs changes.
4. Clicking into the relevant product/category content can crash the page.
5. `/categories` is currently showing a Next.js/server-side exception:
   `Application error: a server-side exception has occurred`
6. The visible marketplace contains a real product:
   `Rings for mayu beans`
   by `Bluey Barks`.

The goal is to repair the existing PawVault systems rather than creating another moderation/product system.

---

# 1. IMPORTANT PRODUCT/MODERATION MODEL

PawVault needs two distinct concepts:

## Creator Product Management

Creators manage their OWN products.

Examples:

- create
- edit
- save
- upload files
- upload media
- set product details
- submit for review
- manage their own eligible publishing state

## Marketplace Moderation

Authorized moderation/admin users review creator products.

Examples:

- approve
- reject
- request changes
- suspend
- remove
- restore/reinstate
- review reports
- feature if separately authorized

These must not be mixed together.

---

# 2. Moderation Must Support More Than Suspend/Remove

The current moderation capability is too destructive and incomplete.

A moderator needs a normal review workflow.

At minimum:

```text
Pending Review
        ↓
Approve
        ↓
Approved
```

or:

```text
Pending Review
        ↓
Request Changes
        ↓
Creator fixes product
        ↓
Resubmits
        ↓
Pending Review
```

or:

```text
Pending Review
        ↓
Reject
        ↓
Rejected
```

Suspension/removal should NOT be the only available moderation outcomes.

---

# 3. Required Moderator Actions

For a product awaiting review, authorized moderation should be able to:

- View product
- View creator/store
- View product media
- View product files/metadata where authorized
- Approve
- Reject
- Request changes
- Suspend
- Remove
- Restore/reinstate where policy allows
- Add an internal moderation note
- Add a creator-facing reason/message
- View moderation history

Do not expose actions the current moderator role is not authorized to perform.

---

# 4. APPROVE

Approval should be a first-class moderation action.

When a valid moderator presses:

`Approve`

the server must:

1. authenticate the moderator
2. verify moderation permission
3. load the product
4. verify the product is in a reviewable state
5. validate required product information
6. record the previous state
7. set the appropriate approval/moderation state
8. make the product eligible for the next publishing/publication stage
9. create an audit event
10. notify the creator
11. invalidate/revalidate relevant caches
12. return the updated real product state

Do not simply set a frontend variable to approved.

Do not return fake success.

---

# 5. REQUEST CHANGES

Moderators need a non-destructive way to tell creators:

> This product cannot be approved yet.

This should NOT require suspending or removing the product.

Use an existing equivalent state if one already exists.

Possible conceptual state:

```text
CHANGES_REQUESTED
```

or:

```text
REVISION_REQUIRED
```

Do not create a duplicate status field if PawVault already has an equivalent.

A moderator should be able to enter a creator-facing reason.

Example:

```text
Changes requested

Reason:
Please add the required product preview image and clarify the license terms.
```

The creator receives a notification and can edit the product.

---

# 6. REJECT

Reject should be different from permanent removal where appropriate.

A rejected product can remain associated with the creator and retain its records.

It should not be publicly available.

The creator should receive:

- status
- reason
- timestamp
- ability to revise/resubmit if policy permits

Do not hard-delete the creator's product merely because it was rejected.

---

# 7. SUSPEND

Suspend is for products that should no longer be available due to a moderation issue.

Keep the existing suspend capability.

However, make it distinct from:

- pending review
- changes requested
- rejected
- removed

Do not use suspension as a substitute for normal review.

---

# 8. REMOVE

Removal is a stronger action.

Audit exactly what "Remove" currently does.

Determine whether it:

- hides
- archives
- soft-deletes
- hard-deletes
- removes marketplace visibility
- deletes storage
- destroys historical records

Do NOT hard-delete products that are referenced by:

- orders
- order items
- licenses
- reviews
- refunds
- payouts
- analytics
- support tickets
- moderation reports

Preserve historical records.

---

# 9. MODERATION STATE MACHINE

Audit the existing product/approval/status models before adding anything.

The intended conceptual workflow is:

```text
DRAFT
  ↓
SUBMITTED / PENDING_REVIEW
  ├── APPROVED
  │      ↓
  │   PUBLISHED / ELIGIBLE
  │
  ├── CHANGES_REQUESTED
  │      ↓
  │   CREATOR EDITS
  │      ↓
  │   RESUBMITTED
  │
  ├── REJECTED
  │
  └── SUSPENDED / REMOVED
```

Use the actual existing PawVault state names if they already exist.

Do not create competing status systems.

---

# 10. CREATOR VS MODERATOR STATUS

Do not collapse creator publishing state and platform moderation state into one uncontrolled field.

Conceptually:

## Creator state

```text
DRAFT
PUBLISHED
ARCHIVED
```

## Platform review state

```text
PENDING_REVIEW
APPROVED
CHANGES_REQUESTED
REJECTED
SUSPENDED
REMOVED
```

The actual implementation may differ.

Audit first.

The important requirement is that a creator cannot bypass a moderation restriction by simply pressing Publish.

---

# 11. CREATOR SUBMISSION

The creator flow should support:

```text
Create product
↓
Complete required information
↓
Save draft
↓
Submit for review
↓
Pending Review
```

If the product is returned for changes:

```text
Changes Requested
↓
Creator edits
↓
Save
↓
Resubmit
↓
Pending Review
```

Do not force creators to create a completely new product.

---

# 12. APPROVAL PERMISSION

Approval MUST be enforced server-side.

Do not use only:

```ts
if (showApproveButton)
```

The API must independently verify the permission.

Expected:

```text
Creator → approve → 403
Moderator → approve → allowed
Authorized Founder/admin → approve → allowed
```

depending on the actual permission configuration.

---

# 13. CREATOR CANNOT APPROVE

Even if the user is:

```text
FOUNDER
```

they should not approve their own creator submission merely because they own the product.

If Founder also has moderation authority, the moderation action must still be performed through the moderation capability and must obey the existing conflict-of-interest/policy rules.

Do not automatically allow self-approval.

---

# 14. OWNERSHIP RULE

Moderation does not transfer ownership.

If Bluey Barks owns:

`Rings for mayu beans`

then:

```text
creatorId = Bluey Barks
```

must remain unchanged when a moderator:

- approves
- rejects
- requests changes
- suspends
- removes
- restores

The moderator is changing platform state, not ownership.

---

# 15. MODERATION REASONS

Every reject/request-changes/suspend/remove action should support a reason where appropriate.

Separate:

## Internal moderation note

Only authorized staff can see.

## Creator-facing reason

Shown to the creator.

Do not expose private internal notes to creators.

---

# 16. MODERATION AUDIT LOG

Every moderation action should record:

- actor ID
- actor role/permission
- product ID
- creator ID
- action
- previous state
- new state
- reason
- timestamp

Examples:

```text
PRODUCT_APPROVED
PRODUCT_CHANGES_REQUESTED
PRODUCT_REJECTED
PRODUCT_SUSPENDED
PRODUCT_REMOVED
PRODUCT_REINSTATED
```

Use the existing audit system if available.

Do not create a duplicate audit system.

---

# 17. CREATOR NOTIFICATIONS

When moderation changes a product, notify the creator.

Examples:

### Approved

> Your product has been approved.

### Changes requested

> Changes are required before your product can be approved.

Include the creator-facing reason.

### Rejected

> Your product was not approved.

Include the reason and whether resubmission is possible.

### Suspended

> Your product has been suspended.

Include the reason where policy permits.

Use PawVault's existing notification/email system.

Do not create another notification system.

---

# 18. MODERATION UI

The moderation product review page should show useful real information.

At minimum:

```text
Product title
Creator
Store
Product status
Review status
Price
Category
Tags
Media
Files/metadata where authorized
Description
License
Submitted date
Last updated
Moderation history
```

Actions should depend on state.

For example:

### Pending Review

```text
Approve
Request Changes
Reject
Suspend
Remove
```

### Changes Requested

```text
View Updated Product
Approve
Request Changes
Reject
Suspend
Remove
```

### Approved

```text
Suspend
Remove
```

Do not show irrelevant actions.

---

# 19. DO NOT REUSE CREATOR PRODUCT EDITOR AS GLOBAL MODERATION

Creator editing:

```text
/creator/products
```

should remain creator-scoped.

Moderation:

```text
/moderation
```

or the existing moderation route should be global only for authorized moderation users.

Do not turn Creator Hub into a global moderation dashboard.

---

# 20. CURRENT PRODUCT PAGE CRASH

There is also a critical navigation/runtime issue.

The user reports that they cannot press/open the relevant product without the application crashing.

The screenshots also show:

```text
Application error: a server-side exception has occurred
```

with a Digest:

```text
1854994147
```

The browser is on:

```text
https://www.pawvault.co.uk/categories
```

This means there is a server-side exception in the categories route or a server-rendered dependency used by it.

Do NOT assume the digest is the root cause.

Use the digest to locate the corresponding server logs.

---

# 21. FIRST CRASH INVESTIGATION

Reproduce:

```text
Open PawVault
↓
Open Categories
↓
Observe crash
```

Then reproduce:

```text
Browse Marketplace
↓
Click product
↓
Observe whether product route crashes
```

Then reproduce:

```text
Categories
↓
Select category
↓
Observe whether category route crashes
```

Record each result separately.

Do not assume all three failures have the same cause.

---

# 22. SERVER LOGS

Find the server-side exception corresponding to:

```text
Digest: 1854994147
```

Identify:

- exact exception
- stack trace
- route
- component
- database query
- API request
- Prisma error
- serialization error
- missing relation
- null value
- authentication/session error

Do not suppress the exception.

Do not simply add a generic error boundary.

---

# 23. CATEGORY PAGE AUDIT

Inspect:

```text
/categories
```

and all components/functions it imports.

Check:

- category query
- subcategory query
- product count query
- category metadata
- slug resolution
- product relations
- creator relations
- image/media loading
- search/filter dependencies
- server/client component boundaries
- serialization

Compare every database field to the actual schema.

---

# 24. CATEGORY DATABASE FAILURE

A category page can crash if it queries a field/relation that does not exist.

Check for:

- stale Prisma client
- missing migration
- wrong column
- wrong relation
- renamed field
- invalid enum
- nullable field being treated as required
- missing category records
- invalid foreign key

Do not solve this by replacing the query with hardcoded categories.

The category system must remain real-data-backed.

---

# 25. PRODUCT PAGE AUDIT

When clicking a real product, trace:

```text
product card
↓
href
↓
product route
↓
product ID/slug
↓
server loader
↓
product query
↓
creator/store
↓
media
↓
files
↓
category
↓
tags
↓
license
↓
reviews
↓
render
```

Find exactly which step fails.

---

# 26. PRODUCT SLUG / ID

Verify the product card creates a valid URL.

Do not assume.

Check:

- product ID
- slug
- encoding
- missing slug
- duplicate slug
- null slug
- route parameter name
- query parameter name

A broken URL should produce a proper 404, not a server exception.

---

# 27. PRODUCT MEDIA CRASH

The marketplace screenshot shows a product card with a placeholder cube rather than an actual product image.

Audit whether missing media is expected.

If no media exists:

```text
Use a safe placeholder.
```

Do not crash.

If media exists but storage is unavailable:

```text
Handle missing media gracefully.
```

Do not crash the entire product page.

---

# 28. PRODUCT CREATOR CRASH

The product page must safely resolve its creator/store.

If creator data is missing:

- do not crash
- handle the invalid/incomplete state
- preserve data integrity
- log the problem internally

Do not create fake creator data.

---

# 29. CATEGORY FILTERS

The Browse page currently shows:

- Search
- Category
- Price
- Min rating
- Free
- On sale

Verify all filters use the same real category/product system.

Do not create separate hardcoded category data for the category page.

---

# 30. PRODUCT CARD ACTIONS

Public marketplace product cards should be clickable.

The expected flow is:

```text
Product card
↓
Product page
```

A creator identity should also be clickable:

```text
Bluey Barks
↓
Creator profile/store
```

The creator profile must resolve using the canonical creator/store system.

---

# 31. CREATOR PROFILE

The public creator identity should link to the existing creator profile/store system.

Do not create a second creator page.

Use the canonical:

```text
creator
↓
store
↓
public profile
```

resolution.

---

# 32. SECURITY

A public product page may show public product information.

It must NOT expose:

- private files
- private storage paths
- private moderation notes
- internal audit logs
- private creator information
- unpublished product data
- restricted download URLs

The product page and moderation page must have separate data scopes.

---

# 33. DATABASE CONSISTENCY

Audit the database against the application code.

Especially inspect:

- Product
- ProductMedia
- ProductFile
- Category
- Subcategory
- Tag
- Creator
- Store
- License
- Review
- Moderation/review records

The previously observed ProductMedia issue involving:

`updatedAt`

must be checked here as well.

If the database does not contain a field the code selects, fix the migration/schema/client mismatch properly.

Do not merely remove random fields until the page stops crashing.

---

# 34. API ERROR SEMANTICS

Use proper responses.

```text
401
Not authenticated

403
Authenticated but not authorized

404
Product/category does not exist

409
Invalid state transition

422
Invalid product/moderation data

500
Unexpected server error
```

Do not return:

```text
200 OK
```

for failed moderation actions.

Do not return generic `Invalid input.` when the real problem is authorization or server failure.

---

# 35. NO FAKE DATA

Do not fix:

- categories
- products
- creators
- moderation queues
- approval states

with hardcoded demo records.

Everything must come from PawVault's real database.

The current:

`1 product found`

and:

`Rings for mayu beans`

must continue to be real database data.

---

# 36. NO DATABASE RESET

Do NOT:

- reset Supabase
- reset Prisma database
- delete tables
- drop/recreate schema
- delete creator records
- delete products
- reseed fake products

Perform safe migrations only.

---

# 37. NO LOGOUT/LOGIN WORKAROUND

The user must not need to:

```text
logout
↓
login
```

to make:

- moderation
- categories
- product pages
- creator pages

work.

Use the existing session.

---

# 38. CACHE / REVALIDATION

After moderation approval or changes requested:

- moderation queue updates
- creator dashboard updates
- creator product status updates
- public visibility updates
- category counts update where applicable
- marketplace listing updates
- search updates where applicable

Use the existing cache/revalidation architecture.

Do not require a manual server restart for normal moderation.

---

# 39. APPROVAL TRANSITION SAFETY

Do not allow:

```text
REMOVED → APPROVED
```

unless an explicit restore/review workflow permits it.

Do not allow:

```text
SUSPENDED → PUBLISHED
```

by a creator pressing Publish.

Do not allow:

```text
CHANGES_REQUESTED → APPROVED
```

without a new valid moderation review.

The backend must enforce valid state transitions.

---

# 40. MODERATION CONFLICT OF INTEREST

Audit the existing policy for self-approval.

At minimum, prevent a creator from approving their own product through ordinary creator permissions.

If PawVault allows Founder/admin self-moderation under a special policy, that must be an explicit scoped permission and audit event, not an accidental consequence of Founder status.

Prefer separation where possible.

---

# 41. REQUIRED KILO AUDIT

Before coding, Kilo must report:

## Moderation

1. Current moderation route
2. Current moderation UI
3. Current moderation API
4. Current approve capability
5. Current reject capability
6. Current request-changes capability
7. Current suspend capability
8. Current remove capability
9. Current permission helper
10. Current Founder logic
11. Current creator logic
12. Current moderation state model
13. Current creator publishing state model
14. Current audit system
15. Current notification system
16. Current RLS policies

## Crash

17. Exact `/categories` route implementation
18. Exact server exception for digest `1854994147`
19. Exact stack trace
20. Exact failing database query
21. Exact failing component
22. Product route implementation
23. Product card href
24. Product GET endpoint/loader
25. Product schema
26. ProductMedia schema
27. ProductFile schema
28. Category schema
29. Creator/store relation
30. Existing Prisma/database mismatches
31. Whether `updatedAt` is involved
32. Exact root cause for product click crash

Do not begin a large rewrite until this audit identifies the actual failure points.

---

# 42. REQUIRED IMPLEMENTATION ORDER

Use this order:

### Phase 1 — Diagnose

- reproduce crashes
- inspect logs
- identify digest
- trace product click
- trace categories
- audit moderation permissions

### Phase 2 — Fix server/data failures

- fix schema mismatches
- fix broken queries
- fix null handling
- fix serialization
- fix route parameters

### Phase 3 — Fix moderation model

- approve
- request changes
- reject
- suspend
- remove
- state transitions
- permission enforcement

### Phase 4 — Fix UI

- correct moderation buttons
- add reason forms
- show correct state
- safe error states
- safe loading states
- product/category navigation

### Phase 5 — Notifications/audit

- moderation audit
- creator notifications
- cache/revalidation

### Phase 6 — Tests

Run the full workflow.

---

# 43. END-TO-END MODERATION TEST

Use a real test product.

```text
Creator creates product
↓
Saves draft
↓
Submits for review
↓
Moderator sees Pending Review
↓
Moderator opens product
↓
Product page does NOT crash
↓
Moderator chooses Request Changes
↓
Enters creator-facing reason
↓
Creator receives notification
↓
Creator edits product
↓
Resubmits
↓
Moderator reviews again
↓
Moderator approves
↓
Product becomes eligible/published according to PawVault rules
↓
Marketplace updates
↓
Creator sees Approved
```

Also test:

```text
Moderator rejects
Moderator suspends
Moderator removes
Moderator restores if supported
```

---

# 44. SECURITY TEST

Test:

```text
Normal creator
→ moderation approve API
→ 403
```

```text
Normal creator
→ moderation reject API
→ 403
```

```text
Normal creator
→ moderation request-changes API
→ 403
```

```text
Normal creator
→ moderation suspend API
→ 403
```

unless the exact existing policy explicitly grants one of these.

Then:

```text
Authorized moderator
→ approve
→ succeeds
```

Test creator ownership separately.

---

# 45. PRODUCT NAVIGATION TEST

Test:

```text
Browse
↓
Product card
↓
Product page
```

Expected:

- no server crash
- real product data
- real creator
- real category
- safe media placeholder if needed

Then:

```text
Categories
↓
Category
↓
Products
↓
Product
```

Expected:

- no server crash
- correct category filter
- real products
- correct product links

---

# 46. ERROR UX

Replace uncontrolled crashes with useful states.

Instead of only:

`Application error: a server-side exception has occurred`

normal recoverable failures should show:

```text
We couldn't load this page.

Try again
Back to marketplace
```

But do NOT use this UI to hide a server bug.

The underlying exception must still be fixed and logged.

---

# 47. DEFINITION OF DONE

## Moderation

- [ ] Moderator can approve products
- [ ] Moderator can request changes
- [ ] Moderator can reject products
- [ ] Moderator can suspend products
- [ ] Moderator can remove products
- [ ] Moderator can see moderation history
- [ ] Moderator can provide creator-facing reasons
- [ ] Creator receives moderation notifications
- [ ] Creator cannot approve products
- [ ] Creator cannot approve their own product
- [ ] Creator cannot moderate another creator's product
- [ ] Moderation does not transfer ownership
- [ ] Product state transitions are server-enforced
- [ ] Moderation actions are audited

## Creator

- [ ] Creator can create drafts
- [ ] Creator can edit own products
- [ ] Creator can submit for review
- [ ] Creator can respond to requested changes
- [ ] Creator can resubmit
- [ ] Creator cannot bypass moderation
- [ ] Creator cannot see private moderation information

## Marketplace

- [ ] Product cards open correctly
- [ ] Product pages do not crash
- [ ] Creator links work
- [ ] Category links work
- [ ] Category pages do not crash
- [ ] Missing media is handled safely
- [ ] Real product data is used
- [ ] Real creator/store data is used

## Database

- [ ] Prisma schema matches database
- [ ] ProductMedia schema matches database
- [ ] ProductFile schema matches database
- [ ] Category schema matches database
- [ ] Creator/store relations work
- [ ] No unsafe destructive migration
- [ ] No database reset

## Security

- [ ] Server-side authorization
- [ ] RLS verified
- [ ] Correct 401/403/404/409/422/500
- [ ] No private files exposed
- [ ] No private moderation notes exposed
- [ ] No frontend-only security

## Stability

- [ ] Digest `1854994147` root cause identified
- [ ] `/categories` works
- [ ] Product click works
- [ ] Product page works
- [ ] Moderation page works
- [ ] No logout/login workaround
- [ ] No fake data
- [ ] No fake success

---

# 48. FINAL INSTRUCTION TO KILO

Do not just add an Approve button.

Do not just hide buttons.

Do not just replace the crash screen with an error message.

Trace the real PawVault dependency chain:

```text
AUTH
 ↓
ROLE
 ↓
PERMISSION
 ↓
CREATOR
 ↓
STORE
 ↓
PRODUCT
 ↓
CATEGORY
 ↓
MEDIA
 ↓
FILES
 ↓
MODERATION STATE
 ↓
APPROVAL
 ↓
NOTIFICATION
 ↓
CACHE
 ↓
MARKETPLACE
```

Fix the actual server-side exception.

Then implement a real moderation workflow where:

```text
Creator
→ Create
→ Edit
→ Submit
→ Wait

Moderator
→ Review
→ Approve
OR
→ Request Changes
OR
→ Reject
OR
→ Suspend
OR
→ Remove
```

The key rule remains:

> **Creators manage their own content. Moderators manage marketplace policy.**

And the second critical rule is:

> **A product that cannot be approved should be able to be sent back for changes without being suspended or removed.**

Do the audit first, identify the real crash and permission failures, then repair the existing PawVault systems.
