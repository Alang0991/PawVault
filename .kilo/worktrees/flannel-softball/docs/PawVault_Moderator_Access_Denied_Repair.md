# PawVault — Moderator Access Denied Repair

## Problem

Moderators with the dedicated **Moderator** role are still seeing:

> Access Denied — Only administrators and platform owners can view this area.

This is an authorization bug if the account genuinely has the Moderator role.

The moderation area must check **moderation permissions**, not an admin-only condition.

## Required Permission Model

- **Founder / Platform Owner:** full platform authority.
- **Administrator:** platform administration + moderation.
- **Moderator:** moderation tools within their granted scope, but NOT automatic administrator powers.
- **Creator:** own creator/store/product management only.
- **User:** no moderation access.

Do not create a generic `manage_everything` permission.

## Likely Bug

Audit for an authorization check equivalent to:

```ts
if (!isAdmin && !isPlatformOwner) {
  denyAccess();
}
```

It should instead use the existing canonical permission system, conceptually:

```ts
const canAccessModeration =
  isPlatformOwner ||
  isAdmin ||
  isModerator ||
  hasPermission("moderation.access");
```

Use PawVault's actual existing role/permission resolver. **Do not create a second role system.**

## Fix Every Layer

Fix all of these, not just the page:

1. Moderation page/route guard.
2. Moderation API/server actions.
3. Navigation visibility.
4. Middleware if it protects the route.
5. Supabase RLS policies protecting moderation records.
6. Any shared authorization helpers.

The frontend and backend must resolve the same canonical permission.

A moderator must not be allowed through the UI and then receive `403` from every API, and the API must not accept a moderator while the UI incorrectly blocks them.

## Keep Moderation Separate From Ownership

Granting moderation access must NOT grant creator ownership permissions.

Moderators may perform the moderation actions their role is explicitly allowed to perform, such as:

- View moderation queue.
- Review reports.
- Approve products.
- Request changes.
- Reject products.
- Suspend/remove marketplace visibility where permitted.
- View moderation history/evidence.
- Record moderation reasons.

Moderators must NOT automatically gain:

- Another creator's product editing rights.
- Price/file/license editing.
- Payout editing.
- Ownership transfer.
- Ability to make paid products free.
- Unrestricted access to private creator files.
- Platform configuration access.
- Administrator account management.

Moderation action is enforcement, not ownership.

## Authentication

Resolve authorization from the authenticated server session:

```text
session
  ↓
canonical user
  ↓
canonical role/permissions
  ↓
moderation permission
  ↓
allow / deny
```

Never trust:

- localStorage
- client-only role state
- URL parameters
- hidden form values
- a manually supplied user ID
- frontend-only `isModerator` flags

Do not log users out because they lack a permission.

## Audit the Actual Role System First

Before changing code, Kilo must find the real source of truth for:

- User/session model.
- Role enum/table.
- Permission table if present.
- Profile role fields.
- Admin/moderator records.
- Server authorization helpers.
- Middleware.
- Moderation route guards.
- Moderation APIs.
- Supabase RLS.
- Cached/session user data.

Also check for role-name mismatches such as:

```text
moderator
Moderator
MODERATOR
mod
staff
content_moderator
```

There must be one canonical representation.

If a database value and code check disagree, fix it through the canonical resolver rather than scattering string comparisons.

## RLS / Database

If moderation data uses Supabase RLS, authorized moderators must be able to access only the moderation rows/actions required by their permissions.

Do NOT disable RLS.

Do NOT make every authenticated user able to read moderation data.

## Expected Results

| Role | Moderation area | Moderation API | Other creator editing |
|---|---:|---:|---:|
| Platform Owner | Allow | Allow | Own creator content only |
| Administrator | Allow | Allow | Own creator content only |
| Moderator | Allow | Allow within scope | Deny |
| Creator | Deny | Deny | Own content only |
| User | Deny | Deny | Deny |

## HTTP Semantics

- `401` = no valid authentication.
- `403` = authenticated but lacks permission.
- `404` = resource does not exist / intentionally hidden.

A correctly configured Moderator receiving `403` for the moderation dashboard is a permission-resolution bug.

Do not turn authorization failures into crashes.

## Required Tests

Test with a real account for each role:

- Fresh moderator login.
- Existing moderator session.
- Direct moderation URL.
- Navigation into moderation.
- Refresh while on moderation.
- Moderation API calls.
- Review/approval actions allowed to moderators.
- Expired session.
- Revoked moderator role.
- Moderator + creator role.
- Insufficient sub-permission.
- Role change followed by session refresh.
- Multiple tabs.
- Mobile viewport.
- Direct unauthorized API requests.

Also verify that a moderator still cannot perform administrator/platform-owner actions or edit another creator's product as its owner.

## Kilo Instructions

Before changing anything:

1. Audit the current role/permission implementation.
2. Find the exact condition producing the Access Denied screen.
3. Find the canonical server-side moderation authorization helper.
4. Find every moderation API authorization check.
5. Find the relevant RLS policies.
6. Confirm the canonical database value for the Moderator role.
7. Report the findings.
8. Repair the canonical permission path.
9. Run the role/permission regression tests.

Do NOT:

- Create a duplicate auth system.
- Create a duplicate role system.
- Turn moderators into administrators.
- Remove authorization checks.
- Disable RLS.
- Hardcode a user ID/email as a moderator.
- Trust client-side role values.
- Add a bypass button.
- Log users out.
- Change creator ownership permissions.

## Definition of Done

A real Moderator account must be able to:

1. Sign in normally.
2. Navigate to moderation.
3. Open the moderation dashboard.
4. Load moderation data.
5. Perform its allowed moderation actions.
6. Refresh without being denied.
7. Navigate away and back without a crash.
8. Use the corresponding moderation APIs.
9. Remain blocked from administrator/platform-owner actions.
10. Remain blocked from editing another creator's product as its owner.

The screenshot's **Access Denied** state must no longer appear for a correctly configured Moderator account.

## Final Rule

**Moderator access must come from the canonical moderation permission system. Being a moderator must not require pretending to be an administrator, and moderation access must never grant unrestricted platform or creator ownership control.**
