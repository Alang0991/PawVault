# PawVault — Creator, Store, Profile & Directory Consistency Repair

## Current observed problem

The live `/browse` page shows a published product associated with a creator, while the live `/creators` page currently reports:

```text
0 creators
0 published products
0 followers
```

This indicates that creator discovery is not resolving the same marketplace data as product discovery.

Possible causes include:

- wrong creator query
- approval filtering
- store approval filtering
- creator/profile join
- RLS
- stale cache
- wrong database relation
- wrong status field
- duplicate creator models
- pagination/count query mismatch

Do not guess which one it is. Audit the actual code/database.

## Canonical identity

Use:

```text
User
 ↓
Creator profile
 ↓
Store
 ↓
Products
```

where that matches the existing schema.

Do not maintain separate unrelated creator identities.

## Product creator

Every published product should resolve:

```text
product.creatorId
→ creator
→ public profile
→ store
```

## Creator directory

Creators page should list creators who satisfy the existing public eligibility rules.

If the platform requires creator approval:

```text
approved creator
+
public profile/store
```

should be visible.

If a creator is approved but has zero products, determine whether the product page should still list them. Do not silently exclude them unless that is intentional.

## Counts

Counts must be real.

Creator page can show:

- published products
- followers
- sales
- rating
- reviews

Only if those metrics exist and are defined.

Never hardcode:

```text
0
```

as a fallback for an unavailable query if that hides an actual failure.

Differentiate:

```text
true zero
```

from:

```text
query failed
```

## Store

Store resolution must use canonical slug/ID.

Test:

```text
Creator Hub
→ View Store
```

and:

```text
Public creator
→ Store
```

Both must resolve the same store.

## Store ownership

Creator can edit only their own store.

Public users can view public store data.

Moderators can review according to scoped permissions.

## Profile links

Creator identity should be clickable from:

- product cards
- product page
- reviews
- posts
- collections
- creator directory
- store
- orders where appropriate

Every link must use the same canonical creator resolver.

## Creator route

Choose one canonical public route.

Do not maintain:

```text
/creator/name
/creators/name
/profile/name
/store/name
```

as four competing identity systems.

If multiple legacy URLs exist, redirect intentionally.

## Creator approval

Creator approval must be distinct from:

- email verification
- account authentication
- store creation
- product moderation
- product publication

Do not use one boolean for all of them.

## Founder + creator

A Founder account can also own creator content.

Do not let platform role automatically change creator ownership semantics.

## RLS

Test:

```text
Creator A
→ Creator B store edit
```

must be denied.

```text
Creator A
→ Creator B product edit
```

must be denied.

```text
Public user
→ public creator
```

must work.

## Cache

After:

- creator approval
- store publication
- product publication
- profile update

the public directory should revalidate correctly.

Do not require logout/login.

## Creator directory empty state

If truly empty:

```text
No creators have joined yet.
```

is fine.

But if the database contains approved creators, the empty state is a bug.

## Definition of done

- [ ] Creator shown in Browse resolves correctly
- [ ] Creator directory shows same creator
- [ ] Creator product count is real
- [ ] Store resolves
- [ ] Profile resolves
- [ ] Creator links work
- [ ] Creator approval state is correct
- [ ] RLS protects ownership
- [ ] Cache updates
- [ ] No duplicate identity systems
- [ ] No fake zero counts
