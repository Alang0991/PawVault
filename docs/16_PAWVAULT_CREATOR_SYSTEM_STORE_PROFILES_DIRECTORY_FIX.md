# PawVault — Creator System, Store Settings, Public Profiles & Live Creator Directory Fix

## Purpose

This is a full audit and implementation specification for PawVault's creator system.

It covers creator account detection, verification/approval, permissions, Creator Hub, Store Settings, View Store, public creator profiles, creator posts, `/creators`, live creator counts, real product/follower/sales data, store routing, sessions, Supabase/RLS, loading/error states, caching, onboarding, suspension/deactivation, public/private data, SEO, mobile, accessibility, security, and testing.

The goal is to fix the shared creator architecture rather than patch individual pages.

---

# 1. Current Problems

Observed/reported problems include:

1. An already verified/approved creator can receive `Creator account required`.
2. `View Store` can redirect an existing creator to `/store/create`.
3. Creator Store Settings can fail to resolve the creator/store correctly.
4. Creator/session state may not synchronize after approval or role changes.
5. Different pages may use inconsistent creator/store checks.
6. `/creators` must update automatically as creators join.
7. Public creator identity must be clickable wherever a creator appears.
8. A creator's profile must provide a clear path to their shop.
9. Creator statistics must come from real data.
10. Creator posts/products must connect naturally to creator profiles and stores.

These may share the same underlying creator-resolution/session problem.

Audit the complete flow before patching individual pages.

---

# 2. One Authoritative Creator System

Do NOT create:

- a second creator table just for the UI
- a second approval system
- a second store ownership system
- a separate public creator database
- duplicate creator permissions
- a fake creator directory dataset

Reuse the existing architecture. If it is fragmented, consolidate it carefully.

---

# 3. Creator State Must Be Explicit

Do not reduce the system to one boolean such as `isCreator`.

The system may need to distinguish:

- authenticated user
- creator account
- creator approval
- creator verification
- creator permissions
- creator store
- store status
- public visibility
- suspension
- activity

Use the existing PawVault data model as the source of truth.

---

# 4. `Creator account required` Bug

Find every occurrence of:

`Creator account required`

Trace it to its exact source:

- frontend guard
- middleware
- API route
- server action
- database query
- Supabase query
- RLS
- role check
- approval check
- store lookup
- session loading
- stale client state
- cache

Identify the exact condition that is failing before implementing the fix.

---

# 5. Do Not Confuse States

These are different states:

### Not authenticated
No signed-in session.

### Authenticated but not a creator
Account exists but has no approved creator capability.

### Creator pending
Creator application is awaiting approval.

### Creator approved
Creator has been approved.

### Creator verified
Creator has the applicable verification state.

### Creator store missing
Approved creator has no store yet.

### Creator store exists
Creator owns a store.

### Creator/store suspended
Creator or store is restricted.

### Database/system error
The application failed to determine the creator state.

A system error MUST NOT become `Creator account required`.

---

# 6. Founder / Admin / Creator Relationship

Platform role and creator account are separate concepts.

For example:

```text
User
 ├── Platform role: FOUNDER
 └── Creator account: APPROVED
       └── Store: OWNED
```

Do not assume `role === CREATOR` is the only valid creator check.

Being Founder also does not mean the Founder owns every creator's store/content.

---

# 7. Global No-Logout / No-Relogin Rule

This is mandatory across PawVault.

Changes to:

- creator approval
- role
- permissions
- creator capability
- store ownership
- team membership
- entitlement
- moderation status
- feature access

must synchronize with the existing session.

Do NOT require logout/login, a new account, or repeated verification.

Only genuine security/session invalidation should require re-authentication.

---

# 8. Session Audit

Audit:

- `/api/auth/session`
- current-user hooks
- server session helpers
- middleware
- client session state
- role loading
- permission loading
- creator loading
- store loading
- cache invalidation
- React/query state
- server authentication
- client authentication

Look for:

```text
Session loading
↓
Creator query runs too early
↓
User ID is null
↓
Creator returns null
↓
Creator account required
```

Use explicit loading states instead.

---

# 9. Loading States

Distinguish:

- loading session
- loading creator
- loading store
- creator found
- creator missing
- store found
- store missing
- permission denied
- system error

Never treat `null` automatically as "creator does not exist."

---

# 10. Supabase Audit

Audit all creator/store Supabase queries.

Verify:

- Supabase project URL
- environment variables
- server client
- browser client
- authenticated session
- user ID
- creator ID
- store ID
- store slug
- creator relationship
- RLS policies
- select permissions
- insert permissions
- update permissions
- public read policies
- private creator data policies

A missing/invalid Supabase configuration must produce a real configuration error, not `Creator account required`.

---

# 11. RLS Failure Handling

Check whether RLS can make an existing creator appear nonexistent.

Every creator/store query must distinguish:

```text
found
not found
unauthorized
query failed
```

Do not collapse these into `creator === null`.

---

# 12. Creator Store Settings

Audit:

`/creator/store/settings`

Expected:

```text
Authenticated user
↓
Creator account
↓
Approved creator
↓
Owned store
↓
Store settings
```

If a store exists, open it.

If no store exists, allow store creation.

If pending, show the pending state.

If suspended, show the suspension state.

If the database fails, show the actual error.

Do not redirect every failure to `/store/create`.

---

# 13. View Store

Audit every `View Store` button/link.

Expected:

```text
Authenticated creator
↓
Creator account
↓
Owned store
↓
Store ID / slug
↓
Public store URL
```

Existing store:

`View Store → existing store`

No store:

`View Store → /store/create`

Do not hardcode `/store/create`.

Do not create another storefront route.

---

# 14. Central Store Resolution

Use one shared store-resolution service/helper.

Conceptually:

`resolveCreatorStore(user)`

It should distinguish:

- STORE_FOUND
- STORE_NOT_FOUND
- NOT_AUTHENTICATED
- NOT_CREATOR
- NOT_AUTHORIZED
- STORE_SUSPENDED
- DATABASE_ERROR

Every page should use the same source.

---

# 15. Store Ownership

A creator may manage only their own store.

Verify server-side:

```text
authenticated user
→ creator ID
→ store owner/creator ID
→ store ID
```

Never trust only a URL slug, display name, frontend state, or client-provided creator ID.

---

# 16. Public Creator Profiles

PawVault needs public creator profiles.

A visitor should be able to:

```text
Creator post/product
↓
Creator avatar/name
↓
Public creator profile
↓
View Store
↓
Creator shop
```

Public profiles must not require the visitor to be signed in.

---

# 17. Clicking a Creator Profile

Anywhere creator identity appears, make it discoverable.

Potential locations:

- product cards
- product pages
- creator posts
- comments
- reviews
- marketplace listings
- creator directory
- featured creators
- follower lists
- collections
- recommendations
- related products
- creator activity
- search results

Avatar/name/profile action should lead to the public creator profile.

The profile should provide `View Store`.

---

# 18. Creator Posts

When a creator posts:

```text
Creator avatar
Creator name
Post
```

the creator identity must be clickable.

Expected:

```text
Post
↓
Creator Profile
↓
Store
```

Never link visitors to private Store Settings or `/store/create`.

---

# 19. Public Creator Profile Data

A public profile may show:

- avatar
- display name
- username/handle
- bio
- verification badge where applicable
- public creator badges
- store link
- product count
- follower count
- rating where appropriate
- public sales count where appropriate
- products
- collections
- public posts
- intentionally public social links
- joined date if desired
- featured products

Never expose:

- email
- payout details
- tax data
- private address
- private analytics
- private customer data
- moderation evidence
- internal notes
- tokens/secrets
- private files

---

# 20. `/creators` Must Be Live

`/creators` must dynamically use real creator data.

When a creator becomes publicly eligible:

```text
New approved creator
↓
Creator directory updates
↓
Creator count increases
↓
Creator card appears
↓
Creator profile works
```

No manual frontend editing.

No hardcoded creator count.

No hardcoded creator cards.

---

# 21. Live Creator Counts

Use real values for:

- total creators
- total products
- total followers
- any future displayed statistics

Do not permanently show placeholder values such as:

```text
1 creator
1 product
0 followers
```

If data is loading, show loading.

If the query fails, show an error/unavailable state.

Do not pretend failure means zero.

---

# 22. Who Counts as a Public Creator?

Define one authoritative rule using existing PawVault rules.

A likely structure is:

```text
creator exists
AND approved
AND not suspended
AND publicly discoverable
```

Use the existing canonical fields rather than inventing a frontend-only definition.

---

# 23. Creator Directory Discovery

Where real data supports it, allow:

- newest creators
- most followed
- most products
- highest rated
- recently active
- verified creators
- creators with stores

No fake rankings.

---

# 24. Creator Search

If search exists/is added, search public fields such as:

- display name
- username
- store name
- public bio
- public tags

Never search or expose private creator information.

---

# 25. Creator Cards

Creator cards can show:

- avatar
- name
- username
- verification
- product count
- followers
- rating
- short bio
- View Store

Clicking the card should open the public creator profile.

---

# 26. Creator → Profile → Store Relationship

There must be one clear relationship:

```text
Creator
↓
Public Creator Profile
↓
Store
↓
Products
```

Profile and store must not become unrelated identities.

---

# 27. Store Slugs

Audit:

- unique slugs
- stable slugs
- collision handling
- reserved names
- safe characters
- case handling
- slug changes
- old URL behavior
- SEO

Display name must not be the primary ownership key.

---

# 28. Creator Username Changes

Use immutable internal IDs for relationships.

If usernames change:

- prevent duplicates
- preserve identity
- update public routing safely
- prevent hijacking
- handle old links according to the routing policy

---

# 29. Creator Avatars

Creator avatars must work across:

- profiles
- creator cards
- products
- posts
- reviews
- comments
- directory
- stores

Use the central media/file system.

Do not destroy creator originals.

---

# 30. Avatar Upload

Audit:

`/api/account/profile/avatar`

Check:

- Supabase URL
- storage bucket
- auth
- upload permissions
- RLS
- MIME validation
- file size
- image processing
- CDN/cache
- old avatar cleanup
- profile database URL
- public access

Storage/configuration failures must be reported accurately.

---

# 31. Cache / Stale Data

Audit:

- Next.js caching
- fetch caching
- route caching
- React Query/SWR
- CDN cache
- ISR/revalidation
- database reads
- client state

A newly approved creator must eventually appear without a developer rebuilding the site.

---

# 32. Realtime vs Revalidation

Do not add realtime everywhere automatically.

Determine where PawVault needs:

- immediate updates
- cache invalidation
- periodic revalidation
- background revalidation

Examples:

Creator approved → invalidate creator directory/profile eligibility.

New product → update creator product count and relevant listings.

New follower → update follower count according to the existing follower system.

---

# 33. Creator Join Flow

Audit:

```text
Account created
↓
Creator application
↓
Verification
↓
Approval
↓
Creator account
↓
Store creation
↓
Store publication
↓
Public profile
↓
Creator directory
```

Every transition must update dependent systems.

---

# 34. Approval Transition

When a creator is approved:

- creator status updates
- permissions update
- Creator Hub becomes available
- store access updates
- public profile eligibility updates
- `/creators` updates
- counts update
- caches invalidate
- notifications/email use existing systems

No logout/login.

---

# 35. Rejection / Suspension

If rejected/suspended:

- restrict appropriate creator capabilities
- update public visibility according to policy
- preserve ownership
- preserve evidence/audit data
- do not transfer ownership
- do not silently delete creator content
- invalidate appropriate caches

Suspension is not ownership transfer.

---

# 36. Deleted / Deactivated Creators

Define behavior for:

- deleted accounts
- closed stores
- suspended creators
- inactive creators
- revoked approval
- removal requests

Do not leave broken public creator cards.

Do not show dead store links.

Do not delete creator-owned data merely because a public card disappears.

---

# 37. Product → Creator Navigation

Every product should make the creator discoverable:

```text
Product
↓
Creator
↓
Creator Profile
↓
Store
```

Use the product's authoritative creator/owner relationship.

---

# 38. Post → Creator Navigation

Creator-authored posts should retain the authoritative creator ID.

Render current public creator identity from that relationship.

If the creator changes their display name, public posts should not remain permanently stuck on an obsolete duplicated name.

---

# 39. Follower System

If follower counts are shown:

- use real follower relationships
- prevent duplicate follows
- handle unfollows
- update counts
- handle deleted/suspended accounts
- protect private follower data

Do not increment numbers without creating the underlying relationship.

---

# 40. Product Counts

Use the correct product visibility rules.

Define whether counts include:

- published products
- hidden products
- drafts
- suspended products
- deleted products

Public counts should reflect publicly available products according to PawVault's existing rules.

---

# 41. Sales Counts

If public sales are displayed, use real completed/eligible sales.

Do not count failed, abandoned, or otherwise ineligible transactions.

Follow the authoritative order/payment model.

---

# 42. Ratings

Use actual reviews and existing review rules.

For zero reviews, use:

`No reviews yet`

rather than pretending `0.0 Rating` is a loaded result.

---

# 43. Directory Empty State

If there are genuinely no public creators, show an intentional empty state.

Never fabricate a creator.

---

# 44. Directory Error State

If the database/API fails:

`We couldn't load creators right now. Please try again.`

Do not show `0 creators` unless the real query returned zero.

---

# 45. API Design

Audit/reuse APIs for:

- current creator
- creator profile
- creator store
- creator directory
- creator stats
- creator products
- creator posts
- creator followers

Do not create duplicate endpoints with conflicting definitions.

---

# 46. Public vs Private API Data

Public creator endpoints must return only public fields.

Private creator endpoints require authentication and authorization.

Never return sensitive fields and merely hide them in the frontend.

---

# 47. Authorization

Private creator endpoints must verify:

```text
authenticated user
+
creator relationship
+
required permission
```

Use scoped staff permissions.

Do not create a generic `manage_everything` permission.

---

# 48. Store Settings Security

Only the owner/authorized creator team should modify:

- store name
- store description
- branding
- slug
- public links
- profile settings
- store visibility
- store settings

Visitors must never access private settings.

---

# 49. Store Visibility

Respect the existing store states, such as:

```text
draft
published
hidden
suspended
```

Public routing must enforce them.

---

# 50. Public Store Access

A visitor should be able to:

```text
/creators
↓
Creator
↓
Profile
↓
View Store
↓
Store
↓
Product
```

without creator privileges.

Creator management remains separate in Creator Hub.

---

# 51. Mobile

Test all creator discovery/settings flows on mobile:

- creator cards
- profiles
- View Store
- Store Settings
- directory
- creator links
- post links
- product links

---

# 52. Accessibility

Creator links must be:

- keyboard accessible
- clearly labelled
- focusable
- screen-reader friendly
- not dependent only on avatars
- not dependent only on color badges

---

# 53. SEO / Shareability

Public creator profiles should have:

- stable URL
- title
- description
- Open Graph metadata
- canonical URL
- creator avatar
- public profile/store information

Never expose private data in metadata.

---

# 54. Consistent Creator Identity

Use immutable internal IDs.

Do not use display names as foreign keys.

Do not use store names as creator IDs.

Avoid unnecessary duplicated creator identity fields.

Creator name/avatar changes should propagate through public surfaces.

---

# 55. Database Indexing

Audit indexes for:

- creator ID
- user ID
- store owner/creator ID
- username
- slug
- approval status
- public visibility
- follower relationships
- product creator ID

---

# 56. Pagination / Performance

Do not load every creator into the browser.

Use pagination/infinite loading.

Avoid N+1 queries such as:

```text
1 creator query
+
1 product query per creator
+
1 follower query per creator
+
1 sales query per creator
```

Use efficient aggregation/query strategies.

---

# 57. Cache Invalidation

Examples:

```text
Creator approved
→ creator directory/profile eligibility

Store published
→ creator profile

New product
→ creator product count

Product unpublished
→ creator product count

Follower added
→ follower count

Profile updated
→ profile + directory cards
```

---

# 58. Notifications

Use PawVault's existing notification/email system.

Do not build another notification system.

Creator approval should update state without requiring re-login.

---

# 59. Audit Logging

Creator state changes should be auditable:

- application
- approval
- rejection
- suspension
- unsuspension
- store creation
- store publication
- store changes
- public visibility changes

Do not log passwords, tokens, or unnecessary sensitive data.

---

# 60. Data Ownership

Creators retain ownership of their content.

PawVault may moderate/restrict content according to platform rules, but this system must not become permission to:

- take ownership
- rewrite creator content
- change creator prices
- give away paid products
- transfer stores without authorization
- expose private creator data

---

# 61. Real Data Only

Do not use:

- hardcoded creator counts
- hardcoded creator cards
- fake followers
- fake sales
- fake ratings
- fake products
- fake stores
- fake approval states
- test creators in production

If production currently contains test data, identify it and handle it deliberately.

---

# 62. HTTP Error Semantics

Use correct semantics:

```text
401 = not authenticated
403 = authenticated but not authorized
404 = resource genuinely does not exist
409 = state conflict
422 = invalid request/state
500 = server failure
```

Do not turn every failure into `Creator account required`.

---

# 63. Frontend Error States

Examples:

### No creator
`Creator account required`

### Pending
`Your creator application is awaiting approval.`

### Suspended
`Your creator access is currently suspended.`

### Store missing
`Create your store`

### System failure
`We couldn't load your creator account. Please try again.`

### Unauthorized
`You don't have permission to access this page.`

---

# 64. Required Audit Before Coding

Kilo must first report:

### A. Creator authentication
- How the current user is resolved
- Where the session comes from
- Where creator state comes from

### B. Creator authorization
- Which helper checks creator access
- Which roles are accepted
- Which approval states are accepted

### C. Store resolution
- How the current creator's store is found
- Why View Store redirects to `/store/create`

### D. Creator account error
- Exact source of `Creator account required`
- Exact failing condition

### E. Supabase
- Relevant queries
- RLS policies
- environment variables
- whether queries can incorrectly return null

### F. `/creators`
- Current data source
- whether counts are real
- whether creators load dynamically
- cache/revalidation behavior

### G. Public profiles
- Current creator profile route
- whether posts/products link to it
- whether profiles link to stores

### H. Root cause
Identify the smallest shared root causes.

Do not patch every page independently.

---

# 65. Implementation Order

## Phase 1 — Creator State
Fix session, creator resolution, approval, roles, permissions, loading, errors.

## Phase 2 — Store Resolution
Fix store lookup, ownership, View Store, Store Settings, slugs.

## Phase 3 — Public Profiles
Fix creator profile, creator/store relationship, public data.

## Phase 4 — Creator Directory
Fix `/creators`, live data, counts, pagination.

## Phase 5 — Creator Discovery
Connect products, posts, reviews, cards, profiles, stores.

## Phase 6 — Cache / Performance
Fix invalidation, revalidation, indexes, aggregation, N+1 queries.

## Phase 7 — Testing
Run the full creator-state and public-navigation test matrix.

---

# 66. Test Matrix

Test:

- unauthenticated
- normal customer
- creator pending
- creator approved
- creator verified
- creator suspended
- Founder + creator
- creator without store
- creator with store
- deleted/deactivated creator

Store states:

- no store
- draft
- published
- hidden
- suspended
- unavailable

Public flows:

```text
/creators → creator → profile → store
product → creator → profile → store
post → creator → profile → store
store → creator → profile
```

---

# 67. Approval Test

Approve a creator while they are already signed in.

Expected:

```text
approval succeeds
↓
existing session remains valid
↓
creator state updates
↓
Creator Hub becomes available
↓
store access becomes available
↓
public creator eligibility updates
↓
/creators updates
```

No logout/login.

---

# 68. Directory Test

Start with N public creators.

Approve another creator.

Expected:

`N + 1`

The directory must update from real data without manually editing the page.

---

# 69. New Product Test

When a creator publishes a product:

- creator product count updates
- product appears where appropriate
- product links to creator profile
- profile links to store

---

# 70. New Follower Test

When someone follows a creator:

- real follow relationship is created
- count updates according to cache/revalidation
- duplicate relationships are prevented

---

# 71. Profile Update Test

When a creator changes avatar/name/bio:

- profile updates
- cards update
- product creator identity updates
- post creator identity updates
- store identity updates where appropriate

---

# 72. Store Slug Test

When the store slug changes:

- new URL works
- ownership remains correct
- creator profile points to new URL
- old URL follows PawVault's routing policy
- another creator cannot claim the slug

---

# 73. Security Test

Verify that one creator cannot:

- access another creator's Store Settings
- edit another creator's store
- edit another creator's profile
- edit another creator's products
- access another creator's private data
- impersonate another creator through URL parameters

Test both frontend navigation and direct API requests.

---

# 74. Performance Test

Test `/creators` with:

- 10 creators
- 100 creators
- 1,000 creators
- future larger datasets

Check query count, response time, N+1 behavior, pagination, caching, and indexes.

---

# 75. No Unrelated Changes

Do not:

- redesign unrelated pages
- replace authentication
- create a second creator system
- create a second store system
- change ownership rules
- change payments unless genuinely required for creator stats
- add unrelated UI

---

# 76. No Fake Fallbacks

Never use fake production fallbacks.

If no data exists, show a genuine empty state.

If a query fails, show an error/unavailable state.

Never convert a failed query into fake zeros.

---

# 77. Definition of Done

- [ ] Approved creators are recognized
- [ ] Verified creators are recognized
- [ ] Founder + creator works
- [ ] Creator permissions synchronize without logout/login
- [ ] `Creator account required` only appears when actually appropriate
- [ ] Loading state cannot become "creator missing"
- [ ] Supabase failures are distinguishable
- [ ] RLS failures are distinguishable
- [ ] View Store opens an existing store
- [ ] `/store/create` is only used when a store genuinely does not exist
- [ ] Store Settings opens the correct creator's store
- [ ] Store ownership is enforced server-side
- [ ] Public creator profiles work
- [ ] Creator avatar/name links to the profile
- [ ] Creator posts link to the profile
- [ ] Products link to the profile
- [ ] Profile links to the store
- [ ] `/creators` uses real data
- [ ] `/creators` updates as creators join
- [ ] Counts are real
- [ ] No fake/test production creator data
- [ ] Suspended creators follow visibility rules
- [ ] Deleted/deactivated creators do not leave broken links
- [ ] Creator identity is consistent
- [ ] Cache/revalidation works
- [ ] Directory is paginated
- [ ] Directory avoids N+1 queries
- [ ] Public/private data boundaries are enforced
- [ ] Store Settings are private
- [ ] Mobile works
- [ ] Accessibility works
- [ ] SEO/share links work
- [ ] Direct API authorization works
- [ ] Full test matrix passes
- [ ] No logout/login workaround is required

---

# 78. Final Creator Flow

PawVault's creator system should behave as one connected system:

```text
AUTHENTICATED USER
        ↓
CREATOR ACCOUNT
        ↓
APPROVAL / VERIFICATION
        ↓
CREATOR PERMISSIONS
        ↓
OWNED STORE
        ↓
PUBLIC CREATOR PROFILE
        ↓
CREATOR DIRECTORY
        ↓
PRODUCTS / POSTS / DISCOVERY
```

A visitor should be able to discover a creator anywhere on PawVault and naturally reach:

```text
Creator
→ Profile
→ Store
→ Products
```

A creator should be able to manage their own store without being incorrectly told they do not have a creator account.

The system must use real database state, one authoritative creator/store relationship, correct authorization, correct loading/error states, and synchronized session state.

# ABSOLUTE RULES

**Never solve creator-state problems by telling the user to log out and back in.**

**Never solve store-state problems by blindly redirecting to `/store/create`.**

**Never solve missing creator data by adding fake production data.**

**Never create duplicate creator/store systems to hide an existing bug.**

**Fix the shared source of truth.**
