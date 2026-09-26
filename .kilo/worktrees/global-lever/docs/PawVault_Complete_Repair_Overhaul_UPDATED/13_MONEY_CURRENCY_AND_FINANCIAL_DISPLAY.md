# PawVault — Money / Currency System Full Repair

## Problem

The Money/Currency settings tab is not working reliably. Repair it as a real persistent account preference and marketplace formatting system, not a cosmetic toggle.

## Requirements

The tab must open, load the current preference, allow a supported currency, save it, persist after refresh/navigation/sessions, and fail safely without logging users out.

Use the canonical user/profile/settings system. Do not create a second preferences database.

## Financial Safety

Separate **display currency preference** from the **actual transaction currency**. Changing a user's display preference must never rewrite creator prices, historical orders, refunds, payouts, Stripe records, or accounting records.

If conversion is supported, use a defined exchange-rate source and timestamp. If conversion is not supported, never pretend the payable amount was converted.

## Central Formatting

Use one currency formatter for product cards, product pages, cart, checkout, orders, refunds, credits, creator earnings, payouts and sales history. Do not scatter currency symbols throughout the code.

Only explicitly supported currency codes may be selected. Validate server-side.

## Creator Ownership

A buyer's display currency must not change a creator's stored product price.

## Stripe

Do not change Stripe transaction currency merely because a user changes their display preference. Checkout must use the actual supported transaction currency.

## Persistence Test

```text
Change currency → Save → Refresh → Still selected
```

Also test navigation through Browse → Product → Cart → Orders.

## Failure Behavior

If saving fails, show a controlled retryable message. Do not crash, log out, reset unrelated settings, or redirect to Dashboard.

## Definition of Done

Money tab works, preference persists, formatting is consistent, historical transactions remain unchanged, creator pricing remains creator-controlled, checkout remains financially correct, and no page crashes.
