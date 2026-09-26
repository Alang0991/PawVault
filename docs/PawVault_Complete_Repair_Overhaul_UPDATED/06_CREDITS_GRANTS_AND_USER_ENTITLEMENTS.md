# PawVault --- Credits / User Grants System

## Problem

Authorized staff need a proper way to grant credits to users.

Credits must be separate from product pricing and creator ownership.

## Model

Use an auditable ledger rather than only `user.credits`:

-   Credit account/balance.
-   Credit transaction.
-   Amount.
-   Actor.
-   Recipient.
-   Reason.
-   Timestamp.
-   Optional expiry.
-   Reference.
-   Before/after balance.

## Permissions

Founder: full grant authority. Administrator: only if explicitly
granted. Moderator: not automatically. Creator/User: no.

## UI

Authorized staff should see recipient, current balance, amount, reason
and confirmation. Prevent duplicate submissions.

## Security

Resolve actor and permission server-side. Never trust client actor IDs
or roles.

Credits must not silently make creator products free, bypass paid-file
access, or alter creator revenue rules.

## Definition of done

Authorized staff can grant credits; every grant is auditable; users can
view balance/history; duplicate grants are prevented; unauthorized users
cannot grant; credit redemption respects normal product/entitlement
rules.
