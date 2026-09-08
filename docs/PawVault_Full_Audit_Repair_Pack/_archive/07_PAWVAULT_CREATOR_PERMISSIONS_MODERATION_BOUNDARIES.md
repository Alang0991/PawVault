# PawVault — Creator Permissions vs Platform Moderation Repair

## Core problem

PawVault must stop treating creator management and platform moderation as the same permission.

A creator should manage their own products.

A moderator should moderate marketplace content.

A Founder can have both roles, but the permissions must remain separate.

## Creator permissions

Creator owns/controls:

- own products
- own product drafts
- own product pricing
- own descriptions
- own media
- own files
- own store
- own creator profile
- own analytics
- own sales/payout information

## Creator cannot

A normal creator cannot:

- approve another creator's product
- reject another creator's product
- suspend another creator's product
- edit another creator's product
- change another creator's price
- change another creator's files
- alter another creator's payout
- transfer ownership

## Moderation permissions

Platform moderation may:

- review submitted products
- request changes
- approve
- reject
- suspend
- remove from marketplace
- preserve evidence
- create audit records
- notify creators
- handle reports

## Moderation does not equal ownership

A moderator action must not change:

```text
creatorId
ownerId
payout owner
historical order ownership
```

## Founder

Founder may have:

```text
platform moderation
+
own creator account
```

These must remain separate.

The Founder should not accidentally see creator-owner edit controls on every marketplace product just because they are Founder.

## Product workflow

Recommended:

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

With:

```text
REQUEST_CHANGES
REJECTED
SUSPENDED
REMOVED
```

## Request changes

Request changes should provide:

- internal reason
- creator-facing reason
- timestamp
- moderator
- product
- audit record

Creator can revise and resubmit.

## Approve

Approve only if the current moderator has explicit permission.

Do not expose approve controls to ordinary creators.

## Self-approval

Prevent a creator from approving their own submission where policy requires independent review.

If Founder has special policy allowing self-publishing, implement that explicitly rather than accidentally through broad permissions.

## Feature

Featured/curation is separate from moderation.

Do not give creators a generic Feature control for products they do not own.

## Delete

Product deletion must preserve historical commerce records.

Prefer:

```text
soft delete
```

or equivalent archival state where required.

## Product visibility

Separate:

```text
creator draft
moderation status
public visibility
customer entitlement
```

Do not use one boolean for all four.

## API security

Frontend hiding is not security.

Every write endpoint must verify:

```text
session
role
permission
ownership/scope
resource state
```

server-side.

## Audit logs

Record:

- actor
- role
- action
- target
- old state
- new state
- reason
- timestamp

## Definition of done

- [ ] Creator Hub is owner-scoped
- [ ] Moderation is separate
- [ ] Founder can be both without permission collision
- [ ] Approve is protected
- [ ] Request changes works
- [ ] Reject works
- [ ] Suspend works
- [ ] Remove works
- [ ] Feature is separately scoped
- [ ] Delete preserves history
- [ ] API checks permissions server-side
- [ ] Audit logs exist
