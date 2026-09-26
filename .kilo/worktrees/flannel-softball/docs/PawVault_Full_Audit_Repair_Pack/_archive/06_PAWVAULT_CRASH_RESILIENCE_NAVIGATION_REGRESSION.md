# PawVault — Crash, Navigation, Loading & Regression Repair

## Goal

Stop PawVault from breaking when moving between pages or changing state.

The application should fail locally and recover gracefully rather than throwing a full server/client application error.

## Main suspected failure classes

Audit all of these:

1. invalid route
2. missing database relation
3. null/undefined property access
4. stale server data
5. wrong API response shape
6. server/client component boundary error
7. hydration mismatch
8. bad query parameter
9. invalid dynamic route parameter
10. unhandled promise rejection
11. failed fetch
12. malformed JSON
13. database constraint error
14. RLS denial
15. cache mismatch
16. race condition during navigation
17. stale client state
18. loading/error state collision
19. missing media
20. missing creator/store
21. schema mismatch
22. status mismatch

## Navigation test

Run:

```text
Home
→ Browse
→ Categories
→ Creator
→ Product
→ Cart
→ Back
→ Browse
```

Then:

```text
Browse
→ Search
→ Filter
→ Sort
→ Product
→ Back
```

Then rapid navigation:

```text
Browse
→ Category
→ Browse
→ Creator
→ Product
→ Browse
```

Do not wait between every click.

## Browser refresh

Every public route must survive:

```text
open directly
refresh
open in new tab
back
forward
```

## Error boundary

Every major marketplace route should have an error boundary.

The error boundary should:

- show a useful message
- provide retry
- provide safe navigation
- log the real error internally

Do not expose stack traces to customers.

## Loading boundary

Use distinct states:

```text
loading
success
empty
error
```

Do not treat loading as empty.

## Null safety

Never assume:

```text
product.media[0]
product.creator.name
product.category.name
product.reviews.length
```

exists.

Use safe handling.

## API failure

If an API returns:

```text
500
```

the component must not assume a successful JSON shape.

Check:

```text
response.ok
```

and validate response data.

## JSON parsing

Do not blindly:

```text
await response.json()
```

if the server may return HTML/error responses.

Handle malformed/unexpected responses.

## Server exceptions

Find exact production errors in server logs.

Do not patch only the UI message.

## Digest errors

When a Next.js/server digest is shown, locate the corresponding server log entry.

The digest alone is not the root cause.

## Race conditions

When a user changes filters quickly:

```text
request A
request B
request C
```

a late response from A must not overwrite C.

Use cancellation or request identity where appropriate.

## State reset

Do not clear:

- cart
- wishlist
- login session
- creator state
- filters

just because navigation occurred.

## Authentication

Do not redirect to sign-in because an unrelated public request failed.

A public page must remain public.

Authenticated actions should return a precise auth requirement.

## Global session

Audit session synchronization.

A stale session must not cause:

```text
logged in
→ sign in
→ logged out
→ sign in again
```

loops.

## Client cache

Audit React Query/SWR/custom caching if used.

After mutation:

```text
like
wishlist
cart
purchase
refund
```

invalidate the correct key.

Do not refresh the entire application unnecessarily.

## Optimistic UI

If optimistic UI is used:

```text
click like
→ UI changes
→ server fails
→ rollback
```

Do not permanently show a fake success.

## Route transitions

Avoid firing state updates after unmount.

Avoid client effects that assume a route is still active.

## Server-side data

Server components should handle missing records gracefully.

Do not call methods on null query results.

## Database errors

Map expected database failures to useful application responses.

Do not expose SQL/database internals to customers.

## Regression suite

### Browse

- load
- filter
- clear filters
- sort
- pagination
- search
- click product

### Categories

- load
- category click
- empty category
- invalid category

### Creators

- load
- creator click
- creator with products
- creator with no products

### Product

- load
- missing product
- missing media
- missing creator
- free
- paid
- like
- wishlist
- cart

### Cart

- add
- remove
- quantity
- empty
- free
- paid
- mixed

### Checkout

- success
- cancel
- failure
- pending
- duplicate retry

### Account

- session
- wishlist
- orders
- licenses
- downloads

## No logout/login workaround

Any fix that requires:

```text
logout
→ login
```

to make the application correct is considered incomplete unless the user intentionally logged out.

## Definition of done

- [ ] No full application crash from expected missing data
- [ ] Public routes load
- [ ] Dynamic routes resolve
- [ ] Navigation is stable
- [ ] Back/forward works
- [ ] Refresh works
- [ ] Loading/empty/error states are distinct
- [ ] API errors are handled
- [ ] Race conditions are handled
- [ ] Auth state does not randomly reset
- [ ] No logout/login workaround
