# PawVault Full Repair Pack

These documents are intentionally split so Kilo can work through PawVault without turning one giant request into an unsafe rewrite.

## Files

1. `00_PAWVAULT_MASTER_FULL_AUDIT.md`
   - Overall architecture and definition of done.

2. `01_PAWVAULT_BROWSE_DISCOVERY_AND_ROUTE_REPAIR.md`
   - Browse, product links, filters, categories, discovery and routing.

3. `02_PAWVAULT_PRODUCT_INTERACTIONS_FREE_PAID_ACCESS.md`
   - Likes, wishlist, cart, free products, paid access and downloads.

4. `03_PAWVAULT_CREATOR_STORE_PROFILE_DIRECTORY_REPAIR.md`
   - Creator/store/profile consistency and the current creator-directory mismatch.

5. `04_PAWVAULT_DATA_API_DATABASE_SCHEMA_CONSISTENCY.md`
   - API contracts, schema, RLS, state fields, cache and data consistency.

6. `05_PAWVAULT_CHECKOUT_STRIPE_ENTITLEMENT_PAYOUT_REPAIR.md`
   - Checkout, payment confirmation, orders, entitlements, licenses, refunds and payouts.

7. `06_PAWVAULT_CRASH_RESILIENCE_NAVIGATION_REGRESSION.md`
   - Page switching, crashes, loading/error states, race conditions and regression testing.

8. `07_PAWVAULT_CREATOR_PERMISSIONS_MODERATION_BOUNDARIES.md`
   - Creator ownership versus platform moderation permissions.

## Kilo order

Read:

```text
00
↓
04
↓
01
↓
03
↓
02
↓
05
↓
06
↓
07
```

Do not blindly implement every section at once.

Audit first.

Report existing implementations and conflicts.

Then repair the canonical systems instead of creating duplicates.

## Important

The live site currently exposes a product card on Browse whose linked `/product/...` URL returns 404, and the live Creators page currently reports zero creators/products/followers while Browse shows a creator product. Treat those as concrete defects to investigate first.
