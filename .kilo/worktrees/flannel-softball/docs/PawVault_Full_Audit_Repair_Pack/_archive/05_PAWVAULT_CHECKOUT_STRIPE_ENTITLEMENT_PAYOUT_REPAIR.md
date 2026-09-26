# PawVault — Checkout, Stripe, Orders, Entitlements, Licenses & Payouts Repair

## Purpose

Make paid commerce trustworthy.

The customer must pay before receiving paid access.

Creators must receive revenue only from legitimate completed paid orders.

## Checkout

Existing documented checkout flow is conceptually:

```text
Cart
→ POST /api/checkout
→ orderId + Stripe URL
```

Audit the real implementation.

The server must calculate the final payable amount.

Never trust client-submitted:

- price
- subtotal
- discount
- tax
- creator allocation
- platform fee

## Single creator order

If all cart items belong to one creator, use the existing intended Stripe architecture.

Do not create duplicate payment systems.

## Multi-creator cart

If PawVault supports multiple creators in one cart, verify:

- order
- order items
- creator allocations
- platform fee
- tax
- Stripe transfer/payment objects
- refunds
- disputes
- payout reconciliation

Each creator's money must be attributable.

## Payment confirmation

Do not unlock content from:

```text
Stripe success redirect
```

alone.

Use verified server-side payment state/webhook.

## Webhook

Verify:

- signature
- event type
- event ID/idempotency
- order lookup
- payment status
- amount
- currency
- metadata
- creator allocation

Repeated webhook delivery must not duplicate:

- orders
- entitlements
- licenses
- payouts

## Order completion

A successful paid order should move through the canonical state machine.

Do not create an entitlement before the order/payment is valid.

## Entitlement

Entitlement should represent:

```text
customer
+
product
+
valid acquisition
```

It must not be created from a cart.

## License

If PawVault's license system grants download/update/support entitlement, generation must require a valid completed order or legitimate free acquisition.

The public license validation endpoint must not expose unnecessary private data.

## Download

Download authorization must independently verify entitlement/license.

## Failed payment

No paid access.

## Cancelled checkout

No paid access.

## Pending payment

No paid access until the authoritative completed state.

## Refund

Follow the existing refund policy.

The current public tutorials indicate that licenses are revoked on refund or chargeback. The implementation should be checked against that documented behavior.

After revocation, paid downloads must stop if that is the intended policy.

## Chargeback

Treat chargeback state as a payment/access event.

Do not leave an active paid entitlement accidentally.

## Creator payouts

A like does not create payout.

A wishlist does not create payout.

A cart item does not create payout.

A failed payment does not create payout.

A free acquisition does not create normal paid revenue.

A legitimate completed paid order may create creator revenue.

## Payout ledger

Use immutable transaction records.

Do not recalculate historical earnings from today's product price.

## Price snapshots

Order items must preserve the price actually paid.

If creator changes:

```text
£10 → £20
```

an old £10 order remains £10.

## Discounts

Validate coupon server-side.

Do not allow:

```text
100% discount
```

unless it is a legitimate coupon/grant.

## Taxes

Use the existing tax architecture.

Do not calculate different tax amounts in client and server.

## Refund allocations

For multi-creator orders, refund allocation must be deterministic.

## Reconciliation

Provide internal diagnostics for:

```text
Stripe payment
↔ PawVault order
↔ order items
↔ creator allocation
↔ entitlement
↔ license
```

## Security tests

Attempt:

```text
fake paid=true
fake orderId
fake userId
fake productId
fake amount
fake coupon
fake entitlement
fake license
```

All must fail safely.

## Definition of done

- [ ] Checkout works
- [ ] Price is server-calculated
- [ ] Stripe webhook is verified
- [ ] Webhook is idempotent
- [ ] Paid order is authoritative
- [ ] Entitlement only after valid acquisition
- [ ] License only after valid acquisition
- [ ] Download checks entitlement
- [ ] Refund behavior is correct
- [ ] Chargeback behavior is correct
- [ ] Creator payout only follows legitimate revenue
- [ ] Historical prices remain unchanged
