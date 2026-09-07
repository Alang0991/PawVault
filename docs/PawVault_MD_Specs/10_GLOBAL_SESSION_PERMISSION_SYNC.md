# PawVault — Global Session & Permission Synchronization

> Platform-wide update specification. This expands the previous authentication/role-access work so the **no forced sign-out/sign-in rule applies to EVERYTHING that depends on account roles, permissions, feature access, staff access, creator access, or account state** — not just Moderation.

---

# 1. CORE RULE

PawVault must **never require a user to sign out and sign back in simply because something on their account has changed and the new state should become available to their existing session.**

This applies platform-wide.

The rule is:

```text
Account/permission/feature state changes
        ↓
Current session detects or refreshes the change
        ↓
Client updates its account state
        ↓
Navigation updates
        ↓
Protected pages update
        ↓
Available tools/features update
```

NOT:

```text
Account/permission/feature state changes
        ↓
Sign out
        ↓
Sign in
        ↓
Only now does PawVault notice the change
```

---

# 2. THIS APPLIES TO EVERYTHING

The previous specification focused heavily on Moderator access.

This document makes the requirement **global**.

The same no-logout/no-login behavior applies to:

- Roles
- Permissions
- Moderation access
- Admin access
- Support access
- Creator tools
- Creator verification/status
- Staff tools
- Feature flags assigned to an account
- Beta features
- Early-access features
- Account capabilities
- Account restrictions
- Store permissions
- Team permissions
- Organization/team membership
- Staff membership
- Creator team membership
- Entitlements
- Subscription-related account access
- Purchased feature access
- Gifted access
- Platform grants
- Support grants
- Marketplace capabilities
- API access
- Webhook access
- Developer access
- Commission tools
- Analytics access
- Financial/creator tools where applicable
- Appeals access
- Content-review access
- Platform operations access
- Any future permission-protected feature

If a feature depends on the user's current account state, the session must be capable of updating without forcing a logout.

---

# 3. MODERATION IS ONE EXAMPLE, NOT THE EXCEPTION

The Moderator issue is the immediate example:

```text
User is logged in
↓
User becomes Moderator
↓
Moderation tab should appear
↓
/moderation should work
↓
Moderator tools should appear
```

But the architecture must not be written specifically for Moderators.

Do NOT create:

```text
special moderator refresh
```

Create:

```text
global account capability synchronization
```

Then Moderation, Admin, Support, Creator, and future systems all use the same mechanism.

---

# 4. GLOBAL ACCOUNT STATE

The client should have a reliable representation of current account state.

Conceptually:

```text
Current Account
├── authentication state
├── role
├── permissions
├── account status
├── staff status
├── creator status
├── team memberships
├── feature access
├── entitlements
├── restrictions
└── security/session state
```

The exact implementation should use PawVault's existing architecture.

Do not create multiple competing sources of truth.

---

# 5. SERVER IS THE SOURCE OF TRUTH

The server remains authoritative for:

- Authentication
- Roles
- Permissions
- Account status
- Feature access
- Staff access
- Creator access
- Entitlements
- Restrictions
- Team membership
- Security-sensitive state

The browser may cache this information for performance.

The browser must never become the authority.

---

# 6. NO STALE ROLE AFTER LOGIN

Avoid:

```text
Login
↓
Read role
↓
Store role permanently in client state
↓
Never check again
```

Prefer:

```text
Authenticated session
↓
Current account state
↓
Synchronize when account state can change
```

---

# 7. GLOBAL SESSION REFRESH

PawVault needs a reusable mechanism to refresh current account capabilities.

For example:

```text
refreshCurrentAccount()
```

or equivalent existing session functionality.

It should be able to update:

```text
user
role
permissions
features
entitlements
staff status
creator status
account restrictions
```

Do not create separate unrelated refresh systems for every feature.

---

# 8. WHEN GLOBAL STATE SHOULD REFRESH

Refresh account/capability state at appropriate points, including:

- Initial application load
- Authentication completion
- Session renewal
- Returning to the browser tab
- Returning to PawVault after inactivity
- Entering protected areas
- Before sensitive protected actions where appropriate
- After account changes
- After role changes
- After permission changes
- After team membership changes
- After feature access changes
- After entitlement changes
- After security-state changes
- After receiving an account-state event

Do not perform a full refresh for every click.

---

# 9. REAL-TIME ACCOUNT UPDATES

Where supported by PawVault's architecture, account changes should be delivered to active sessions.

Example:

```text
Founder changes user's role
        ↓
Server persists change
        ↓
Account-state event emitted
        ↓
Active client receives event
        ↓
Current account state refreshes
        ↓
UI updates
```

This should work for all relevant account-state changes, not only Moderators.

---

# 10. REAL-TIME EVENTS

Potential event types include:

```text
ACCOUNT_ROLE_CHANGED
ACCOUNT_PERMISSIONS_CHANGED
ACCOUNT_FEATURE_ACCESS_CHANGED
ACCOUNT_STATUS_CHANGED
ACCOUNT_RESTRICTIONS_CHANGED
ACCOUNT_ENTITLEMENTS_CHANGED
ACCOUNT_TEAM_MEMBERSHIP_CHANGED
ACCOUNT_STAFF_STATUS_CHANGED
ACCOUNT_CREATOR_STATUS_CHANGED
ACCOUNT_SECURITY_STATE_CHANGED
```

Use the naming conventions already established in PawVault where applicable.

---

# 11. FALLBACK IF A REAL-TIME EVENT IS MISSED

Real-time synchronization must not be the only mechanism.

If an event is missed:

```text
User opens protected feature
↓
Server checks current account state
↓
Current state is returned
↓
Client synchronizes
↓
Feature becomes available
```

The user should still not need to sign out.

---

# 12. NAVIGATION MUST UPDATE GLOBALLY

Navigation should be based on current capabilities.

Example:

```text
Before:
Browse
Categories
Creators
Support
```

After a permission/feature grant:

```text
Browse
Categories
Creators
Moderation
Creator Tools
Support
```

The correct entries should appear automatically when the corresponding permissions become active.

Likewise, when access is removed, the navigation should update.

---

# 13. PROTECTED ROUTES MUST USE CURRENT STATE

Every protected route should use current authorization.

Example:

```text
User opens /moderation
↓
Check authentication
↓
Check current MODERATION_VIEW
↓
Allow or deny
```

The same model applies to:

```text
/admin
/support-admin
/creator-tools
/analytics
/commissions
/developer
/appeals
/platform
```

and future protected routes.

Do not build route guards that permanently depend on the role captured at login.

---

# 14. PROTECTED API ENDPOINTS

The same rule applies to APIs.

A user gaining a permission must be able to use the newly authorized API without logging out and back in.

Every protected API should check the current server-side state.

Example:

```text
GET /api/moderation
→ MODERATION_VIEW

GET /api/creator/analytics
→ CREATOR_ANALYTICS_VIEW

GET /api/support/cases
→ SUPPORT_CASE_VIEW
```

Exact endpoints should follow the existing API.

---

# 15. PERMISSION-BASED ACCESS

Do not rely exclusively on broad role checks such as:

```text
role === "ADMIN"
```

Use permissions/capabilities where the feature is intended to be granular.

Example:

```text
hasPermission("MODERATION_VIEW")
hasPermission("SUPPORT_CASE_VIEW")
hasPermission("CREATOR_ANALYTICS_VIEW")
```

This allows future roles without rewriting the entire access system.

---

# 16. MODERATOR ACCESS

Moderators must receive the moderation permissions assigned to their role.

At minimum, the system should support permissions such as:

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

A Moderator must not be blocked by an old:

```text
ADMIN ONLY
```

check where Moderator access is intended.

---

# 17. ADMIN ACCESS

If an account is granted Admin access while logged in:

```text
Admin assigned
↓
Session synchronizes
↓
Admin navigation appears
↓
Admin tools become available
```

No logout.

No login.

The same applies when individual Admin permissions are added or removed.

---

# 18. SUPPORT ACCESS

If a user is granted Support access while already logged in:

```text
Support permission granted
↓
Session updates
↓
Support tools appear
↓
Support pages/API become available
```

The user must not have to restart their session manually.

---

# 19. CREATOR ACCESS

If an account gains or changes creator capabilities:

```text
Creator capability changes
↓
Session updates
↓
Creator tools recalculate
↓
Correct creator features appear
```

This may include:

- Creator dashboard
- Product publishing
- Product management
- Creator analytics
- Payout-related tools where authorized
- Store settings
- Creator team tools
- Commission tools
- Beta creator features

Do not assume every creator has every permission.

---

# 20. TEAM MEMBERSHIP

If PawVault supports creator teams or organizations:

```text
User added to team
↓
Team membership changes
↓
Session/account state updates
↓
Team capabilities appear
```

If a user is removed:

```text
Team membership removed
↓
Access disappears
↓
Server denies future requests
```

No logout should be required.

---

# 21. FEATURE FLAGS

If a feature flag is granted to a specific account:

```text
Feature enabled
↓
Account state refreshes
↓
Feature appears
```

This applies to:

- Beta features
- Experimental tools
- Early access
- Staff-only tools
- Creator experiments
- Internal testing

Feature flags must not require a new login to activate.

---

# 22. ENTITLEMENTS

Where account entitlements change:

```text
Entitlement granted
↓
Current account state refreshes
↓
Entitled feature/product/tool becomes available
```

Examples:

- Purchased access
- Gifted access
- Store credit entitlement
- Support grant
- Subscription entitlement
- Beta entitlement

The entitlement system must remain separate from creator ownership.

---

# 23. SUPPORT GRANTS

If support grants an entitlement to a user:

```text
Grant created
↓
User remains logged in
↓
Entitlement synchronizes
↓
Granted access becomes available
```

Do not tell the user to log out and back in.

Do not implement grants by silently changing creator-owned pricing.

---

# 24. ACCOUNT RESTRICTIONS

Security-sensitive removals must also synchronize.

Example:

```text
Permission removed
↓
Active session updates
↓
Feature disappears
↓
Server blocks access
```

Do not rely on the client eventually logging out.

Server-side authorization must take effect immediately.

---

# 25. SECURITY-SENSITIVE CHANGES

Some changes may require additional security handling.

Examples:

- Password changes
- MFA changes
- Session revocation
- Account compromise
- Suspicious login response
- Full account suspension
- Security lock

These may legitimately invalidate sessions where required.

However:

> A normal role, permission, feature, team, or entitlement change must not be treated as a reason to force logout/login.

---

# 26. ACCESS DENIED MESSAGES

Differentiate authentication from authorization.

### Not signed in

```text
You need to sign in to access this area.
```

### Signed in but missing permission

```text
Access Denied

Your account does not currently have permission
to access this area.
```

Do not use:

```text
Sign in again
```

as a workaround for stale authorization state.

---

# 27. NO CLIENT-SIDE SECURITY SHORTCUTS

Never trust:

```text
localStorage.role
```

or:

```text
localStorage.permissions
```

as the security boundary.

Client state is only for display and interaction.

The server must independently verify authorization.

---

# 28. ROLE REMOVAL MUST ALSO BE LIVE

Example:

```text
Moderator is actively logged in
↓
Founder removes Moderator permissions
↓
Account state updates
↓
Moderation navigation disappears
↓
Moderation route becomes inaccessible
↓
Moderation API requests are rejected
```

No logout is required.

The removal must be enforced immediately server-side.

---

# 29. CACHE INVALIDATION

If PawVault caches account capabilities, establish a reliable invalidation strategy.

Possible mechanisms:

```text
permission_version
role_version
account_state_version
updated_at
session_version
```

Example:

```text
Account state version = 14

Role changes

Account state version = 15

Client detects mismatch
↓
Refresh account state
```

Use the existing PawVault architecture where possible.

---

# 30. GLOBAL ACCOUNT STATE FLOW

The target architecture is:

```text
                 ┌─────────────────────┐
                 │ PawVault Server     │
                 │ Current Account     │
                 └──────────┬──────────┘
                            │
                    Account-state event
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Active Session      │
                 │ Synchronization     │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Current Capabilities│
                 └──────────┬──────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
        Navigation       Routes          Features
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                     User sees changes
```

---

# 31. ONE SYSTEM, NOT MANY FIXES

Do not implement:

```text
Moderator-specific refresh
Admin-specific refresh
Creator-specific refresh
Support-specific refresh
```

Implement:

```text
Global Account Capability Synchronization
```

Then all systems consume it.

This prevents the same bug from appearing again in another section of PawVault.

---

# 32. TEST MATRIX

Kilo should test every major access type.

| Change | Already logged in? | Logout required? | Expected |
|---|---:|---:|---|
| Moderator assigned | Yes | No | Moderation appears |
| Admin permission added | Yes | No | Admin tools appear |
| Support permission added | Yes | No | Support tools appear |
| Creator capability added | Yes | No | Creator tools appear |
| Team membership added | Yes | No | Team tools appear |
| Feature flag enabled | Yes | No | Feature appears |
| Entitlement granted | Yes | No | Entitled access appears |
| Permission removed | Yes | No | Access disappears |
| Team membership removed | Yes | No | Team access disappears |
| Feature flag disabled | Yes | No | Feature disappears |

---

# 33. MODERATOR TEST

Required:

```text
1. Log in as normal account.
2. Keep the session active.
3. Founder/Admin assigns Moderator.
4. Do NOT sign out.
5. Permission state refreshes.
6. Moderation navigation appears.
7. Open /moderation.
8. Moderation tools appear.
9. Use an allowed moderation tool.
10. Verify the server accepts the action.
```

This must pass.

---

# 34. GLOBAL TEST

Kilo should repeat the same pattern for every permission-controlled system.

For each feature:

```text
1. Log in.
2. Change the account's permission/access externally.
3. Remain logged in.
4. Trigger synchronization.
5. Verify navigation updates.
6. Verify route access updates.
7. Verify API authorization updates.
8. Verify feature/tool visibility updates.
```

---

# 35. STALE SESSION TEST

Simulate:

```text
Role changes
↓
Realtime event missed
↓
User opens protected feature
```

Expected:

```text
Server returns current account state
↓
Client synchronizes
↓
Feature works
```

No logout.

---

# 36. MULTI-TAB TEST

If the user has PawVault open in multiple tabs:

```text
Tab A
Tab B
Tab C
```

and their permissions change:

```text
Permission changes
↓
Active tabs synchronize where practical
```

A user should not need to close every PawVault tab and log back in.

---

# 37. SESSION EXPIRY EXCEPTION

Do not confuse:

```text
session expired
```

with:

```text
permissions changed
```

If a session genuinely expires, normal authentication behavior applies.

But a valid session with newly changed permissions must remain valid.

---

# 38. ACCEPTANCE CRITERIA

This global update is complete only when:

- [ ] Role changes do not require logout/login.
- [ ] Permission changes do not require logout/login.
- [ ] Moderator access updates while logged in.
- [ ] Moderators can see the Moderation navigation.
- [ ] Moderators can access the Moderation tools they are permitted to use.
- [ ] Admin permissions update while logged in.
- [ ] Support permissions update while logged in.
- [ ] Creator capabilities update while logged in.
- [ ] Team memberships update while logged in.
- [ ] Feature flags update while logged in.
- [ ] Entitlements update while logged in.
- [ ] Navigation updates from current capabilities.
- [ ] Protected routes use current permissions.
- [ ] Protected APIs use current server-side permissions.
- [ ] Permission removals take effect without logout.
- [ ] Realtime updates work where supported.
- [ ] Missed realtime events can recover automatically.
- [ ] Multiple tabs can recover/synchronize.
- [ ] No client-controlled value is used as the security boundary.
- [ ] Authentication and authorization errors are clearly separated.
- [ ] No individual feature needs its own logout/login workaround.

---

# 39. IMPORTANT KILO INSTRUCTION

Do **not** solve this by adding one-off exceptions.

Do not simply change:

```text
ADMIN ONLY
```

to:

```text
ADMIN OR MODERATOR
```

Do not add:

```text
refresh only for Moderation
```

Do not tell users:

```text
Please log out and back in.
```

Instead, fix the underlying global architecture:

```text
ACCOUNT STATE CHANGES
        ↓
GLOBAL SESSION/CAPABILITY SYNC
        ↓
CURRENT ACCOUNT STATE
        ↓
NAVIGATION
        ↓
ROUTES
        ↓
FEATURES
        ↓
API AUTHORIZATION
```

---

# 40. FINAL RULE

> **No ordinary role, permission, feature, entitlement, team, staff, creator, support, moderation, or account-capability change should require the user to sign out and sign back in.**

The user's existing authenticated session should become aware of the new state.

The only exception is when a genuine security/session event requires invalidation, such as session expiry, explicit session revocation, or another security-critical event.

For normal account capability changes:

```text
CHANGE ACCESS
↓
SYNC ACCESS
↓
USE ACCESS
```

**No logout. No login. No restarting the session.**
