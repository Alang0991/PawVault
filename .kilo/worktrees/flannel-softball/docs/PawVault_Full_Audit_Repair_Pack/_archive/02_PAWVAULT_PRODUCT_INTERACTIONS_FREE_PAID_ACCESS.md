# PawVault — Product Interactions, Free Access & Paid Access Repair

## Core rule

A paid product is:

```text
PUBLIC TO BROWSE
PRIVATE TO OWN
```

Do not make the whole product inaccessible before purchase.

## Before purchase

A public paid product can be:

- viewed
- liked
- wishlisted
- added to cart
- shared
- reviewed/viewed according to policy

But cannot be:

- downloaded
- privately accessed
- granted a license
- granted an entitlement
- treated as purchased

## Free product

Expected:

```text
View
↓
Like
↓
Wishlist
↓
Cart/Get
↓
Free acquisition
↓
Entitlement/license where required
↓
Download
```

No fake Stripe transaction.

No fake creator payout.

## Paid product

Expected:

```text
View
↓
Like
↓
Wishlist
↓
Cart
↓
Checkout
↓
Payment confirmed
↓
Order
↓
Entitlement
↓
License
↓
Download
```

## Like

Paid products must not require purchase to like.

If authentication is required:

```text
Guest
→ sign in
→ return to product
→ like
```

Do not force a logout/login cycle.

## Wishlist

Paid products must be wishlisted before purchase.

Wishlist state must come from the canonical wishlist table/API.

Do not create a second favorites table unless the current architecture explicitly requires a different concept.

## Cart

Paid products must be addable to cart.

Cart means purchase intent.

Cart does NOT mean ownership.

## Download

Download endpoint must verify:

- authenticated customer
- product
- file
- completed valid order
- entitlement/license
- refund/chargeback state

Only then generate a protected/signed download.

## Direct URL attack

Test:

```text
customer has not paid
→ manually request private file
```

Expected:

```text
403
```

or the existing correct access-denied response.

No file.

## Client bypass

Changing these in browser devtools must not grant access:

```text
isPurchased=true
hasEntitlement=true
price=0
owned=true
```

## Paid product page

Before purchase:

```text
£XX
♡ Like
♡ Wishlist
Add to Cart
```

No active download.

After purchase:

```text
Purchased
Download
License
```

## Public preview

Public preview images/videos may remain public.

Do not confuse:

```text
preview media
```

with:

```text
paid source files
```

## Review policy

If verified review requires ownership:

```text
completed purchase
→ review allowed
```

But the restriction must not block browsing, liking, wishlist, or cart.

## License generation

The existing license generation endpoint must be hardened.

A customer must not be able to manufacture a license by submitting arbitrary:

```text
productId
orderId
userId
```

Server must validate ownership/payment/order state.

## Free acquisition

If free products use orders, use a valid zero-value order state.

If free products use direct entitlements, keep that architecture.

Do not invent a second free-purchase system.

## Price tampering

The browser must never determine final payable price.

Server calculates:

```text
product price
+
valid discount
+
tax/fees where applicable
=
final amount
```

## Coupon tampering

A customer cannot submit a fake 100% discount.

Discounts are validated server-side.

## Refund

Follow the existing refund policy.

If access is revoked on refund, revoke entitlement/license and block downloads.

Do not alter historical order data incorrectly.

## Access matrix

| State | View | Like | Wishlist | Cart | Download |
|---|---:|---:|---:|---:|---:|
| Free public | Yes | Yes | Yes | Yes | After acquisition |
| Paid public unpaid | Yes | Yes | Yes | Yes | No |
| Paid purchased | Yes | Yes | Yes | Yes/owned | Yes |
| Payment pending | Yes | Yes | Yes | Yes | No |
| Payment failed | Yes | Yes | Yes | Yes | No |
| Refunded | Yes if public | Yes | Yes | Policy | Policy |
| Draft | No | No | No | No | No |
| Removed | No | No | No | No | No |

## Definition of done

- [ ] Free product works end-to-end
- [ ] Paid product can be liked
- [ ] Paid product can be wishlisted
- [ ] Paid product can be added to cart
- [ ] Paid product can enter checkout
- [ ] Paid product cannot be downloaded before payment
- [ ] Paid product unlocks after confirmed payment
- [ ] License cannot be fabricated
- [ ] Entitlement cannot be fabricated
- [ ] Cart does not grant access
- [ ] Client state cannot bypass access
