# PawVault — API, Database, Schema, RLS & State Consistency Repair

## Purpose

Many of the reported PawVault problems can happen when the frontend, API and database disagree about field names, states or ownership.

This document requires an audit before changes.

## Canonical resource map

Audit these existing resources:

- User
- Creator
- Store
- Product
- ProductMedia
- ProductFile
- Category
- Tag
- Like/Favorite/Wishlist
- Cart
- CartItem
- Order
- OrderItem
- Payment
- Entitlement
- License
- Review
- Notification
- Refund
- Payout
- ModerationAction
- AuditLog

Do not create duplicates.

## API contracts

The public API documentation currently describes systems for:

- authentication/session
- profile
- wishlist
- products
- media/uploads
- product files
- cart
- checkout
- orders/refunds
- licenses
- reviews
- notifications
- search

Every client call must match its real implementation.

## Audit every endpoint

For each endpoint record:

```text
Route
Method
Auth requirement
Input schema
Validation
Database query
Response schema
Status codes
Error schema
RLS
Cache/revalidation
```

## "Invalid input."

Search the entire repository for:

```text
"Invalid input."
```

For every occurrence determine:

- endpoint
- validator
- exact expected body
- frontend caller
- missing field
- incorrect field
- wrong type
- auth state
- DB constraint

Never replace the message with a generic success.

## Status codes

Use consistent semantics:

```text
200/201 success
400 malformed request
401 unauthenticated
403 authenticated but forbidden
404 resource missing
409 state conflict
422 validation failure
429 rate limit
500 unexpected server error
```

## Ownership

Never trust:

```text
userId
creatorId
ownerId
```

from the client for authorization.

Resolve current user from the authenticated server session.

## RLS

If Supabase/Postgres RLS is used, test all important paths with:

- guest
- customer A
- customer B
- creator A
- creator B
- moderator
- Founder

## State fields

Search for duplicate concepts:

```text
published
isPublished
status
moderationStatus
approvalStatus
visibility
active
enabled
```

Map which one is authoritative.

Do not blindly merge them.

## Product states

Separate:

```text
creator workflow state
```

from:

```text
moderation state
```

and:

```text
public visibility
```

and:

```text
customer access
```

## Payment states

Separate:

```text
checkout started
payment pending
payment failed
payment completed
order completed
refund pending
refunded
chargeback
```

Do not use a single boolean.

## Historical snapshots

Orders must preserve:

- purchased price
- product title at purchase
- creator identity at purchase where required
- tax/fee values
- discount
- product reference

Historical records must not change because a creator edits the current product.

## Idempotency

Make these safe to retry:

- checkout creation
- webhook processing
- order completion
- entitlement creation
- license creation
- payout allocation
- free acquisition

## Transactions

Where multiple database changes represent one business event, use a transaction.

Example:

```text
payment confirmed
→ order update
→ order item
→ entitlement
→ license
```

Do not allow half-completed ownership states.

## Cache invalidation

When a mutation occurs, identify every affected page:

```text
product
creator
store
browse
categories
wishlist
cart
orders
licenses
library
```

Invalidate/revalidate only the necessary caches.

## Logging

Log:

- request ID
- user ID where safe
- product ID
- order ID
- endpoint
- result
- error code

Never log secrets.

## Schema migration safety

Before changing production schema:

1. inspect existing schema
2. create migration
3. test migration
4. preserve old data
5. backfill
6. verify counts
7. deploy
8. remove legacy only after confirmation

## Definition of done

- [ ] One canonical model per resource
- [ ] Frontend/API contracts match
- [ ] Validation errors are diagnosable
- [ ] RLS is tested
- [ ] Ownership is server-resolved
- [ ] State fields are documented
- [ ] Historical records are immutable where required
- [ ] Critical writes are idempotent
- [ ] Transactions protect multi-step operations
- [ ] Cache invalidation works
