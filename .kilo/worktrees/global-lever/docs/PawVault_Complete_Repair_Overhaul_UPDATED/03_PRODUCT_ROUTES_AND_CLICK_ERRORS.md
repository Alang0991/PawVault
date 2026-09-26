# PawVault --- Product Routes & Click Error Repair

## Problem

Users cannot reliably click/open products without errors.

## Canonical route

Audit whether `/product/[slug]` and `/products/[slug]` both exist.
Select one canonical public product route and update every link
generator to use it. Do not maintain competing product systems without a
deliberate reason.

Audit Browse, Categories, Search, Creators, Stores, Wishlist, Cart,
Orders, Notifications, Recommendations, Staff Picks and Collections.

## Product safety

Product pages must safely handle missing
creator/store/category/media/thumbnail/reviews/tags/files and states
such as free, paid, sale, suspended, unpublished and removed.

Missing products must produce a controlled 404, not a server exception.

Paid listings may be public, but paid files/download entitlement must
remain protected until confirmed access. Free acquisition must work
without fake payment.

## Tests

Every product card opens the intended route, direct URLs work, refresh
works, Back/Forward works, and no product click creates a server crash.
