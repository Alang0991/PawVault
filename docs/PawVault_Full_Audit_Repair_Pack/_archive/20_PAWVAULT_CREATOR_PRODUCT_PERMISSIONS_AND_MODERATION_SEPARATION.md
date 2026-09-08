# 20_PAWVAULT_CREATOR_PRODUCT_PERMISSIONS_AND_MODERATION_SEPARATION.md

# PawVault — Creator Products Must NOT Let Creators Approve Other People's Assets

## Purpose

The current Creator → Products page is exposing product actions that can allow the wrong role to publish, feature, delete, or otherwise moderate products.

The current screen shows:

- Products
- 1 total products
- "All products"
- a product owned by Bluey Barks
- Draft
- Publish
- Feature
- Delete

This needs to be corrected.

The Creator Products area must be a **creator-owned product management area**, not a moderation panel.

A creator must only be able to manage their own products.

Marketplace moderation and approval must be a separate, explicitly authorized system.

---

# 1. Critical Rule

## Creator Product Management ≠ Marketplace Moderation

A creator's Creator Hub is for managing their own content.

A moderation/admin system is for reviewing marketplace content across creators.

These permissions MUST NOT be mixed.

A creator must NOT automatically gain the ability to:

- approve another creator's product
- publish another creator's product
- feature another creator's product
- delete another creator's product
- edit another creator's product
- change another creator's price
- change another creator's files
- change another creator's license
- change another creator's store
- change another creator's payout information
- approve another creator's creator account

Founder status alone must NOT be treated as ownership of every creator's content.

---

# 2. What The Creator Products Page Should Mean

For a normal creator:

```text
Creator Hub
↓
Products
↓
My Products
```

It should show only products owned by the currently authenticated creator.

The list should NOT be a global marketplace product list.

The creator should see their own:

- drafts
- published products
- hidden products
- archived products
- moderation-restricted products where appropriate

The creator should not see other creators' private/draft products here.

---

# 3. "All Products" Is Dangerous

The current UI says:

> All products

This wording strongly suggests the page is showing the entire marketplace.

For Creator Hub, change the concept to:

> My Products

or:

> Your Products

Use whichever terminology fits the existing PawVault UI.

The underlying query must also be scoped to the authenticated creator.

Do NOT merely rename the heading while continuing to query all products.

---

# 4. Creator Product Query

The Creator Products API must resolve the authenticated creator server-side.

Conceptually:

```text
authenticated session
        ↓
PawVault user
        ↓
creator account
        ↓
owned products
```

The query must filter by the creator's real ownership.

Do not accept a browser-supplied:

```text
creatorId
```

as the authority for access.

Do not trust:

```text
?creatorId=
```

from the client.

Do not trust hidden form fields.

Do not trust frontend role state.

---

# 5. Ownership Enforcement

Every product operation must verify ownership server-side.

For creator-owned operations:

```text
authenticated creator
AND
product.owner == authenticated creator
```

Only then should the operation be allowed.

This applies to:

- GET product for editing
- PUT/PATCH product
- DELETE product
- upload media
- delete media
- upload files
- delete files
- change price
- change category
- change tags
- change license
- publish
- unpublish
- archive
- feature request if applicable

---

# 6. Publish Permission

"Publish" needs careful separation.

## Creator

A creator may publish **their own eligible product** according to PawVault's publishing rules.

A creator must NOT be able to publish another creator's product.

If PawVault requires moderation approval before public publication, the creator's action should instead be something like:

> Submit for Review

or:

> Request Approval

The exact label should follow the existing product workflow.

Do NOT let a creator bypass marketplace moderation by clicking Publish.

---

# 7. Moderation Approval

Marketplace approval is a separate permission.

A moderation reviewer may have permission to:

- review a submitted product
- approve a product
- reject a product
- request changes
- hide a product
- suspend a product
- preserve evidence
- review reports

Only users with the appropriate moderation permission may perform those actions.

This must be enforced server-side.

---

# 8. Founder Permission

Founder is the highest PawVault platform role, but that does NOT mean:

> Founder = owns every creator's product

Founder authority should be divided into scoped capabilities.

Examples:

```text
platform_admin
creator_management
product_moderation
financial_admin
support_admin
content_management
```

Do NOT create one generic:

```text
manage_everything
```

permission that bypasses all ownership boundaries.

---

# 9. Founder Product Management

A Founder/admin may have access to marketplace moderation.

That does NOT mean the Founder should edit another creator's product through the normal Creator Hub.

Keep:

```text
Creator Product Management
```

separate from:

```text
Marketplace Moderation
```

If an admin needs to inspect a creator product, provide a moderation/admin workflow.

Do not reuse the creator editor as a global admin editor unless the permission model explicitly supports it and every action is scoped/audited.

---

# 10. Feature Permission

The current UI shows:

> Feature

This should NOT be available to ordinary creators unless PawVault explicitly intends to let creators feature their own products.

Normally:

```text
Feature Product
```

is an admin/curation capability.

It should be restricted to a dedicated permission such as:

```text
product_feature
```

or equivalent existing scoped permission.

Do not infer feature permission from:

```text
creator
```

or:

```text
founder
```

without checking the existing permission model.

---

# 11. Delete Permission

Delete is especially dangerous.

A creator may be allowed to remove/archive their own product depending on PawVault's existing rules.

A creator must never be able to delete another creator's product.

Also consider customer entitlement protection.

If a product has:

- completed orders
- active licenses
- downloads
- refunds
- financial records

do NOT hard-delete the product and destroy historical references.

Prefer the existing:

- archive
- hidden
- unpublished
- soft-delete

mechanism where appropriate.

---

# 12. Never Hard Delete Marketplace History

A product may be referenced by:

- orders
- order items
- licenses
- reviews
- refunds
- creator earnings
- payouts
- analytics
- downloads
- audit logs
- support tickets
- moderation reports

Hard deleting the product can break historical data.

Use referentially safe states.

For example:

```text
ACTIVE
DRAFT
PUBLISHED
HIDDEN
SUSPENDED
ARCHIVED
```

Use the existing PawVault status model rather than inventing a second one.

---

# 13. Product Visibility

Separate:

## Creator-controlled state

Examples:

- Draft
- Published
- Archived

from:

## Platform moderation state

Examples:

- Pending Review
- Approved
- Rejected
- Suspended
- Removed

Do not collapse these into one ambiguous field.

A creator should not be able to turn:

```text
SUSPENDED
```

back into:

```text
PUBLISHED
```

simply by pressing Publish.

---

# 14. Recommended Product Lifecycle

If moderation approval is required, the flow should resemble:

```text
Creator creates product
        ↓
DRAFT
        ↓
Creator submits
        ↓
PENDING_REVIEW
        ↓
Moderator reviews
        ↓
APPROVED
        ↓
Creator/public publishing rules
        ↓
PUBLISHED
```

If rejected:

```text
PENDING_REVIEW
        ↓
REJECTED / CHANGES_REQUESTED
        ↓
Creator edits
        ↓
SUBMITTED AGAIN
```

The exact state names must match the existing PawVault implementation.

Do not create duplicate status fields if a working status system already exists.

---

# 15. Creator Must Be Able To Edit Their Own Draft

A creator should be able to edit their own draft.

Example:

```text
Draft
↓
Edit
↓
Save
↓
Submit for review
```

This must not require Founder approval for every ordinary draft edit unless PawVault intentionally requires that.

---

# 16. Creator Must Not Approve Their Own Moderation Review

If PawVault requires moderation:

The creator cannot do:

```text
Create product
↓
Submit
↓
Approve own product
```

The approval decision must require an authorized moderation actor.

Prevent this server-side.

Do not rely on the UI hiding the approval button.

---

# 17. Creator Cannot Approve Other Creators

Even if the creator can see another product ID somehow, attempting:

```text
POST /api/moderation/products/[id]/approve
```

must return:

```text
403 Forbidden
```

unless the authenticated user has the appropriate moderation permission.

Do not return success.

Do not mutate the product.

Do not create an audit event claiming approval occurred.

---

# 18. Creator Cannot Feature Other Creators

Attempting to feature another creator's product without the appropriate permission must return:

```text
403
```

No database mutation.

No homepage placement.

No notification claiming the product was featured.

---

# 19. Creator Cannot Delete Other Creators' Products

Attempting:

```text
DELETE /api/products/[id]
```

against another creator's product must fail authorization.

Do not rely on the product page hiding the delete button.

---

# 20. Creator Product List Must Be Scoped

Audit the query powering:

```text
/creator/products
```

It should effectively behave like:

```text
WHERE creatorId = authenticatedCreatorId
```

or the equivalent ownership relation.

Do not return:

```text
all products
```

to the Creator Hub.

This is both a UX problem and a security/privacy problem.

---

# 21. Existing API Documentation

PawVault's current API documentation already describes product creation as a creator-only operation and describes authenticated write endpoints. citeturn0search0

Use the existing API architecture rather than creating a second product API.

Audit the current product endpoints and their authorization.

---

# 22. Moderation API Separation

Moderation endpoints should be clearly separate from creator product-management endpoints.

Conceptually:

```text
/api/products/*
```

for product operations with ownership checks

and:

```text
/api/moderation/products/*
```

for moderation operations

if that matches the existing architecture.

Do not create duplicate APIs if equivalent routes already exist.

The important requirement is **permission separation**, not a particular URL naming convention.

---

# 23. Authorization Matrix

Create an explicit permission matrix.

| Action | Creator own product | Creator other product | Moderator | Founder |
|---|---:|---:|---:|---:|
| View own product | YES | NO | YES if authorized | YES if authorized |
| Edit own product | YES | NO | Separate moderation/admin workflow | Separate admin workflow |
| Upload own media | YES | NO | NO by default | Scoped |
| Upload files to own product | YES | NO | NO by default | Scoped |
| Change own price | YES | NO | NO by default | Scoped |
| Publish own product | YES if eligible | NO | N/A | Scoped |
| Submit for review | YES | NO | N/A | N/A |
| Approve product | NO | NO | YES | YES |
| Reject product | NO | NO | YES | YES |
| Feature product | NO by default | NO | Scoped | YES if authorized |
| Suspend product | NO | NO | YES | YES |
| Delete/archive own product | YES according to policy | NO | Scoped | Scoped |
| Delete other creator product | NO | NO | Scoped | Scoped |
| Change another creator's payout | NO | NO | NO | Financial permission only |

This matrix must be enforced by the backend.

---

# 24. Frontend Buttons

The frontend should only display actions the current user is allowed to perform.

For normal creators, the product list should show actions such as:

```text
Edit
View
Publish / Submit for Review
Archive
```

depending on actual product state.

It should NOT show:

```text
Approve
Reject
Feature
Suspend
Moderate
```

unless the user is actually in the moderation/admin workflow.

---

# 25. Do Not Hide Security Behind Frontend Conditions

This is NOT sufficient:

```ts
if (user.role === "FOUNDER") {
  showButton()
}
```

The API must also enforce the permission.

Frontend checks are UX.

Backend authorization is security.

Both are required.

---

# 26. Current Founder Problem

The screenshot suggests the currently logged-in Founder account can see:

```text
Publish
Feature
Delete
```

inside the Creator Products page.

That needs to be audited carefully.

Determine whether these buttons are:

1. legitimate creator actions on the Founder-owned product, or
2. global moderation actions incorrectly exposed in Creator Hub.

If the page is intended to be Creator Hub, it must be scoped to the Founder/creator's own products.

If moderation is needed, it belongs in the moderation/admin interface.

---

# 27. Do Not Remove Legitimate Founder Creator Functionality

Important:

The Founder may also be a creator.

If the Founder owns a product, they should be able to manage **their own product as a creator**.

Do not solve this by disabling all Founder creator functionality.

Correct model:

```text
Founder
├── Creator permissions for their own creator account
└── Platform/admin permissions for authorized moderation
```

These are separate capability sets.

---

# 28. Audit Current Role System

Inspect:

- user role
- creator role
- creator approval
- moderation role
- admin permissions
- Founder permissions
- server-side permission helpers
- middleware
- API authorization
- database/RLS

Find whether the current code has logic such as:

```text
if founder → allow everything
```

or:

```text
if creator → allow product actions
```

without checking ownership.

Replace broad access with scoped permissions.

---

# 29. Audit Product Queries

Search for all product queries used by:

- Creator Hub
- Creator Products
- Product editor
- moderation
- admin
- public marketplace

Do not accidentally change the public marketplace query.

The marketplace needs to discover products globally.

The Creator Hub needs creator-scoped products.

The Moderation Hub needs moderation-scoped products.

These are three different views of the same underlying product data.

---

# 30. Correct Architecture

Use one product database/model.

Different views:

```text
                    PRODUCT DATABASE
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   Creator Hub       Marketplace       Moderation
   OWN PRODUCTS     PUBLIC PRODUCTS    REVIEW SCOPE
```

Do NOT create:

```text
CreatorProduct
MarketplaceProduct
ModerationProduct
```

as three separate sources of truth.

Use the existing product model with scoped access.

---

# 31. Moderation Does Not Transfer Ownership

If a moderator suspends a product:

```text
creatorId remains unchanged
```

If a moderator rejects a product:

```text
creatorId remains unchanged
```

If a moderator hides a product:

```text
creatorId remains unchanged
```

If a store is suspended:

```text
store ownership remains unchanged
```

Moderation is an access/visibility action, not ownership transfer.

---

# 32. Audit Trail

Every moderation action should record:

- actor
- actor role/permission
- product
- creator
- action
- previous state
- new state
- reason
- timestamp

Creator-owned edits should be distinguishable from moderation actions.

Example:

```text
CREATOR_EDIT
MODERATION_APPROVE
MODERATION_REJECT
MODERATION_SUSPEND
PRODUCT_FEATURE
PRODUCT_ARCHIVE
```

Use the existing audit system if available.

Do not create duplicate audit systems.

---

# 33. Creator Notifications

Creators should be notified when moderation actions affect their products.

Examples:

- submitted for review
- approved
- rejected
- changes requested
- suspended
- reinstated
- featured

Notifications must come from real events.

Do not send an approval notification when a creator merely publishes their own draft.

---

# 34. Feature Workflow

If Feature is an admin/curation action:

Move it to the appropriate moderation/admin interface.

A creator should not see:

```text
Feature
```

on arbitrary marketplace products.

If creators are allowed to nominate their own product for featuring, use a separate action:

```text
Request Feature
```

which creates a review request rather than immediately featuring the product.

---

# 35. Delete Workflow

Audit what Delete currently does.

Determine:

- hard delete?
- soft delete?
- archive?
- product status change?
- storage deletion?
- order preservation?
- license preservation?

If it hard-deletes products with historical transactions, replace it with a safe lifecycle where appropriate.

Do not destroy financial/customer/license history.

---

# 36. RLS / Database Security

If Supabase/Postgres RLS is used:

Verify a creator cannot query another creator's products through direct API/database access.

Test:

```text
Creator A → SELECT Creator B product
```

Expected:

```text
denied / invisible
```

Test:

```text
Creator A → UPDATE Creator B product
```

Expected:

```text
denied
```

Test:

```text
Creator A → DELETE Creator B product
```

Expected:

```text
denied
```

Server-side authorization must remain in place even if RLS is also used.

---

# 37. HTTP Semantics

Use:

```text
401 = not authenticated
403 = authenticated but lacks permission
404 = resource not found / intentionally not disclosed
409 = state conflict
422 = invalid business data
500 = unexpected server failure
```

Do not return `200 OK` when a creator attempted an unauthorized moderation action.

---

# 38. Test Cases

## Creator

1. Creator opens `/creator/products`.
2. Only their products appear.
3. Creator can edit their own product.
4. Creator can save their own product.
5. Creator can publish their own eligible product or submit it for review.
6. Creator cannot approve their own product.
7. Creator cannot approve another creator's product.
8. Creator cannot feature another creator's product.
9. Creator cannot delete another creator's product.
10. Creator cannot edit another creator's product.

## Moderator

1. Moderator can access moderation interface.
2. Moderator can review eligible products.
3. Moderator can approve.
4. Moderator can reject/request changes.
5. Moderator can suspend.
6. Actions are audited.
7. Creator is notified.

## Founder

1. Founder can manage their own creator products through Creator Hub.
2. Founder can access authorized moderation tools.
3. Founder moderation actions are audited.
4. Founder creator actions do not automatically grant ownership of other creators' products.
5. Founder cannot accidentally change creator financial data through product management.

---

# 39. Test The Exact Current Screen

Reproduce the current screenshot.

Expected normal Creator Hub:

```text
Products

My Products
1 total product

Rings for mayu beans
by Bluey Barks

Draft

Edit
Publish / Submit for Review
Archive
```

Do not display global moderation controls here.

If the account is a Founder who is also the owner of the displayed product, the Founder should still be able to manage that product as its owner.

The moderation controls should live elsewhere.

---

# 40. Required Kilo Audit Output

Before changing code, report:

1. Why `/creator/products` currently says `All products`
2. Whether it queries all products or creator-owned products
3. Why Publish is visible
4. Why Feature is visible
5. Why Delete is visible
6. Whether these actions are creator actions or moderation actions
7. Current product ownership model
8. Current creator authorization helper
9. Current Founder permission logic
10. Current moderation permission logic
11. Current RLS policies
12. Current product status model
13. Current moderation status model
14. Current delete/archive behavior
15. Current audit logging
16. Current notification behavior
17. Exact APIs used by these buttons

Then implement the correction.

---

# 41. Definition of Done

- [ ] Creator Products means "My Products"
- [ ] Creator product list is owner-scoped
- [ ] Product ownership is checked server-side
- [ ] Creator cannot approve products
- [ ] Creator cannot approve their own product
- [ ] Creator cannot approve another creator's product
- [ ] Creator cannot feature another creator's product
- [ ] Creator cannot edit another creator's product
- [ ] Creator cannot delete another creator's product
- [ ] Creator can manage their own products according to policy
- [ ] Founder can manage their own creator products
- [ ] Founder moderation access is separate
- [ ] Moderation permissions are scoped
- [ ] Feature permission is scoped
- [ ] Delete/archive permission is scoped
- [ ] Product status is separated from moderation state
- [ ] No ownership is transferred by moderation
- [ ] Historical orders remain safe
- [ ] Licenses remain safe
- [ ] Financial records remain safe
- [ ] RLS is tested
- [ ] APIs return correct 401/403/404 responses
- [ ] Audit logs work
- [ ] Creator notifications work
- [ ] No duplicate product system
- [ ] No duplicate moderation system
- [ ] No fake data
- [ ] No frontend-only security
- [ ] No database reset
- [ ] No logout/login workaround

---

# 42. Final Instruction to Kilo

The key architectural rule is:

> **A creator manages their own products. Moderators manage marketplace policy.**

Do not solve this by simply hiding buttons.

Fix the permissions at every layer:

```text
UI
↓
Route
↓
API
↓
Server authorization
↓
Database query
↓
RLS
```

The Founder account may have both creator and platform capabilities, but those capabilities must remain separate.

If the Founder owns a product, they can manage that product as a creator.

If the Founder is acting as a moderator, they use the moderation/admin workflow.

**Do not turn Creator Hub into a global marketplace administration panel.**
