# PawVault — Authentication, Creator Approval & API Fix

## Purpose

Fix the current PawVault authentication/session problems, `{"error":"Invalid input."}` API failures, Creator Hub loading/sign-in issues, and broken Founder creator/shop approval workflow.

**Do not patch only the UI. Fix the underlying authentication → authorization → API → database flow.**

---

## 1. Current Problems

- Creator Hub sections act as if the user is logged out.
- Some requests return `{"error":"Invalid input."}`.
- The logged-in `FOUNDER` cannot approve creator shops.
- Creator approval/moderation functionality is not working correctly.
- Creator Hub pages can remain stuck on loading.

---

## 2. Audit First

Before changing code, inspect:

- Authentication and login flow
- Session creation/lookup
- Session cookies
- Cookie domain/path/SameSite/Secure/expiration
- Session refresh
- Client session provider/context
- Auth hooks
- Middleware
- Route guards
- API guards
- API fetch helpers
- Server actions
- API client/interceptors
- Role and permission resolution
- Creator Hub
- Moderation
- Creator approval
- Database schema
- Creator/store models
- Audit system
- Notification system

Find the actual root causes. Do not guess.

---

## 3. Fix `Invalid input.`

Search the entire codebase for:

```text
"Invalid input."
```

For every endpoint returning it, determine:

- Route
- HTTP method
- Expected body
- Query parameters
- Validation schema
- Actual frontend request
- Missing fields
- Incorrect field names/types
- Serialization problems
- Authentication requirements
- Authorization requirements

Compare frontend and backend contracts.

Example:

Backend:

```json
{"creatorId":"..."}
```

Frontend:

```json
{"id":"..."}
```

Fix the contract properly.

**Do not disable or weaken validation.**

---

## 4. Correct HTTP Semantics

Use:

```text
401 = unauthenticated
403 = authenticated but unauthorized
400/422 = invalid request
404 = resource not found
500 = server error
```

Do not redirect every error to sign-in.

An authenticated user without permission must receive an appropriate access-denied response.

---

## 5. Creator Hub Authentication

The Creator Hub must use the same global PawVault session.

Audit:

- Session cookie transmission
- `credentials` on browser API calls
- API/base URL differences
- Cookie domain/path
- SameSite/Secure settings
- Session provider
- Client navigation
- Server session lookup
- Middleware
- Route guards
- Permission checks
- 401/403 handling
- API interceptors
- Any accidental `signOut()`

Do not create a second Creator Hub authentication system.

---

## 6. Founder Authorization

The frontend displaying:

```text
FOUNDER
```

is not sufficient.

The backend must independently resolve:

```text
Authenticated user
+
Current role
+
Current permissions
```

Verify that the Founder has the required platform administration permissions.

---

## 7. Creator Shop Approval

Find and reuse the existing creator/shop approval workflow.

The Founder must be able to:

- View pending creators
- Open creator information
- Open store information
- Review applications
- Approve creators/shops
- Reject creators/shops
- Request changes if already supported
- See approval status
- See reviewer
- See review timestamp
- See rejection reason
- See relevant audit history

Use real database state.

**No fake/mock approval data.**

---

## 8. Approval States

Inspect the existing schema first.

If approval states already exist, reuse them.

Possible states:

```text
PENDING
APPROVED
REJECTED
SUSPENDED
```

Do not create a duplicate approval system.

If data is genuinely missing, add only the minimum required schema.

Useful fields may include:

```text
creator/user ID
store ID
status
reviewer ID
reviewed_at
rejection reason
internal notes
created_at
updated_at
```

Adapt these to the existing architecture.

---

## 9. Approval API

Audit every creator approval endpoint:

- HTTP method
- URL
- Request body
- Validation
- Authentication
- Authorization
- Database query
- Transaction behavior
- Response shape
- Error handling

Test:

```text
LIST PENDING
GET CREATOR
GET STORE
REVIEW
APPROVE
REJECT
```

Frontend and backend must use exactly the same API contract.

---

## 10. Approval Security

Prevent:

- Approving nonexistent creators
- Approving deleted users
- Approving the wrong store
- ID/resource manipulation
- Unauthorized approvals
- Duplicate approval events
- Invalid state transitions

Approval should be idempotent where appropriate.

Example:

```text
Already APPROVED
+
Approve again
=
No duplicate approval record
```

---

## 11. Audit Logging

Creator approval/rejection must create an audit event.

Example:

```json
{
  "actor": "founderId",
  "action": "CREATOR_APPROVED",
  "target": "creatorId",
  "timestamp": "..."
}
```

Reuse the existing audit infrastructure.

Do not create a second unrelated audit system.

---

## 12. Notifications

After successful approval:

```text
Approval saved
↓
Audit event
↓
In-app notification
↓
Email queued if configured
```

After rejection, do the equivalent.

Notification/email failure must not incorrectly make a successful approval appear failed.

The database is authoritative.

Email is a notification layer.

---

## 13. Founder Ownership Boundary

Founder administration does **not** mean PawVault owns creator content.

Founder can administer the marketplace and enforce platform rules.

Founder must not casually:

- Change creator prices
- Make paid products free
- Replace creator files
- Transfer creator store ownership
- Change creator payout settings
- Claim creator content
- Publish private creator content

Creator ownership remains intact.

Creator approval is a platform-access decision, not an ownership transfer.

---

## 14. Creator Approval vs Moderation

Keep these separate:

```text
Creator approval
=
Whether a creator/store may operate on the marketplace.

Moderation
=
Enforcement of platform rules and handling reports/cases.

Ownership
=
Creator control of their own content/store.
```

They may interact but must not become one unrestricted permission.

---

## 15. Scoped Permissions

Use the existing permission system.

Potential moderation permissions:

```text
MODERATION_VIEW
MODERATION_CASE_VIEW
MODERATION_CASE_CREATE
MODERATION_EVIDENCE_VIEW
MODERATION_NOTE_CREATE
MODERATION_ACTION
MODERATION_ESCALATE
MODERATION_APPEAL_VIEW
MODERATION_APPEAL_REVIEW
```

Potential creator approval permissions:

```text
CREATOR_APPROVAL_VIEW
CREATOR_APPROVAL_REVIEW
CREATOR_APPROVAL_APPROVE
CREATOR_APPROVAL_REJECT
```

Adapt to existing naming.

**Do not create `MANAGE_EVERYTHING`.**

---

## 16. Role Expectations

Baseline:

```text
FOUNDER
→ Platform administration + configured Founder permissions

ADMIN
→ Configured administrative permissions

MODERATOR
→ Moderation permissions

SUPPORT
→ Support permissions

CREATOR
→ Own creator functionality

CUSTOMER
→ Customer functionality
```

Moderators do not automatically gain:

- Creator pricing access
- Creator payout access
- Store ownership transfer
- Financial administration
- Legal publishing
- Founder emergency controls

---

## 17. Global No-Logout Rule

Normal role/permission changes must synchronize with the existing session.

Do not require:

```text
Sign out
↓
Sign in
```

for:

- Role changes
- Permission changes
- Creator capability changes
- Staff access changes
- Moderation access changes
- Feature access changes
- Team membership changes
- Beta access changes

Only genuine security/session invalidation events may require re-authentication.

---

## 18. Frontend Error Handling

### 401

```text
Session genuinely missing/expired
↓
Attempt normal refresh if supported
↓
Redirect to sign-in only if still unauthenticated
```

### 403

```text
Authenticated
↓
Show Access Denied
```

Never redirect an authenticated user to sign-in just because they lack permission.

### 400/422

Show the validation/request error.

### 404

Show resource-not-found state.

### 500

Show server error.

### Network error

Show connection/error state.

None of these should automatically sign the user out.

---

## 19. Do Not Mask the Bug

Do not:

- Make protected APIs public
- Remove route protection
- Remove authentication
- Hard-code Founder access into every page
- Store fake auth state in localStorage
- Create duplicate session cookies
- Create a second auth provider
- Automatically sign users out
- Redirect every error to `/auth/signin`
- Disable validation
- Give everyone permission

Fix the underlying architecture.

---

## 20. Creator Hub Test Flow

Test using the real authenticated Founder account:

```text
Login
↓
Dashboard
↓
Creator Hub
↓
Products
↓
Orders
↓
Customers
↓
Licenses
↓
Payouts
↓
Payments
↓
Analytics
↓
Reviews
↓
Promotions
↓
Discounts
↓
Posts
↓
Collections
↓
Store Settings
↓
View Store
↓
Moderation
```

The session must remain valid throughout.

---

## 21. Refresh/Direct URL Tests

For every Creator Hub section:

1. Navigate normally.
2. Refresh.
3. Open the URL directly.
4. Navigate to another Creator Hub section.
5. Return.

Expected:

- No unexpected sign-in redirect.
- No permanent loading.
- Same authenticated session.

---

## 22. Creator Approval Test

Test:

```text
Founder login
↓
Open creator approval queue
↓
Open pending creator
↓
Review creator/store
↓
Approve
↓
Verify database state
↓
Verify creator status
↓
Verify audit event
↓
Verify notification
```

Test rejection separately.

---

## 23. Role Tests

Test:

```text
FOUNDER
→ Correct Founder access

ADMIN
→ Correct configured Admin access

MODERATOR
→ Moderation access when granted

SUPPORT
→ Support access without unrelated admin access

CREATOR
→ Own creator functionality only

CUSTOMER
→ Customer functionality only
```

Unauthorized actions must return the correct status rather than pretending the user is logged out.

---

## 24. Session Synchronization Test

Test permission changes while remaining logged in.

Grant permission:

```text
User logged in
↓
Permission granted
↓
Existing session synchronizes
↓
Feature becomes available
```

Remove permission:

```text
Permission removed
↓
Existing session synchronizes
↓
Feature disappears
↓
Server rejects unauthorized requests
```

Expected:

```text
NO LOGOUT
NO LOGIN
```

---

## 25. Database Consistency

Approval state must be authoritative on the server/database.

Prevent:

```text
UI = APPROVED
Database = PENDING
```

or:

```text
Database = APPROVED
Audit = missing
```

Use transactions where necessary.

---

## 26. Real Data Only

Do not use fake:

- Creator applications
- Approval statuses
- Creator counts
- Moderation cases
- Permissions
- Sessions
- Audit events
- Notifications
- API responses

If something is not implemented, show an honest state.

---

## 27. Implementation Order

Follow this order:

```text
1. Audit authentication/session
2. Audit API client
3. Audit middleware/route guards
4. Audit role/permission resolution
5. Find all "Invalid input." responses
6. Fix frontend/backend API contracts
7. Audit creator approval schema
8. Fix creator approval APIs
9. Fix Founder authorization
10. Fix Creator Hub pages
11. Fix error handling
12. Repair audit events
13. Repair notifications
14. Test all roles
15. Test session synchronization
16. Test complete Creator Hub flow
```

Do not jump directly to UI changes.

---

## 28. Do Not Change Unrelated UI

This task is primarily:

```text
Authentication
Session
Authorization
API validation
Creator approval
Moderation access
Error handling
Audit
Notifications
```

Do not redesign the Creator Hub.

Do not replace the existing visual design unless required for functionality.

---

## 29. Kilo Safety Rules

Before changing authentication or the database:

- Inspect the existing implementation.
- Reuse existing models.
- Reuse existing auth/session utilities.
- Reuse existing permission infrastructure.
- Reuse existing audit infrastructure.
- Reuse existing notification infrastructure.
- Avoid duplicate systems.
- Create migrations for schema changes.
- Do not delete production data.
- Do not reset the database.
- Do not rotate or expose existing secrets.

---

## 30. Final Report Required

After implementation, report:

1. Exact root cause of Creator Hub sign-in issue.
2. Exact root cause(s) of `{"error":"Invalid input."}`.
3. Creator approval root cause.
4. Files changed.
5. Database changes.
6. Authentication/session changes.
7. Cookie changes.
8. Route guard changes.
9. API changes.
10. Permission changes.
11. Audit changes.
12. Notification changes.
13. Tests performed.
14. Creator Hub pages tested.
15. Creator approval tests performed.
16. Role tests performed.
17. Session synchronization tests performed.
18. Remaining known issues.

Do not claim something was fixed unless it was actually tested.

---

## 31. Definition of Done

- [ ] Creator Hub no longer incorrectly redirects authenticated users to sign-in.
- [ ] Creator Hub uses the global PawVault session.
- [ ] Session cookies are correctly transmitted.
- [ ] API authentication works consistently.
- [ ] 401/403 behavior is correct.
- [ ] `Invalid input.` contract errors are fixed.
- [ ] Backend validation remains enforced.
- [ ] Founder is recognized server-side.
- [ ] Creator approval queue works.
- [ ] Founder can approve creator shops.
- [ ] Founder can reject creator shops.
- [ ] Approval state is stored in the real database.
- [ ] Approval actions are authorized.
- [ ] Approval actions are idempotent where appropriate.
- [ ] Approval creates audit events.
- [ ] Approval creates notifications.
- [ ] Creator ownership boundaries remain intact.
- [ ] Moderator permissions remain scoped.
- [ ] Support permissions remain scoped.
- [ ] No generic `MANAGE_EVERYTHING` bypass exists.
- [ ] No fake approval data exists.
- [ ] No fake permissions exist.
- [ ] No fake session state exists.
- [ ] No forced logout/login for normal permission changes.
- [ ] Creator Hub works after refresh.
- [ ] Creator Hub works when opened directly.
- [ ] Creator Hub navigation preserves the session.
- [ ] Full Founder flow has been tested.
- [ ] Other roles have been tested.

---

## 32. Final Principle

> **One authenticated PawVault user must have one authoritative session, one authoritative permission model, and one authoritative server-side identity across the entire platform.**

Creator approval must be a real backend workflow.

API validation must be real.

Permissions must be real.

Audit events must be real.

Notifications must be real.

Being authenticated but unauthorized must never be confused with being logged out.

> **Fix the underlying system — do not hide the problem with redirects, fake auth state, or disabled security.**
