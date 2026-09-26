# PawVault --- Complete Repair & UX Overhaul Master Plan

## Scope

This pack covers the latest PawVault issues: duplicate/double UI,
product click errors, unreliable sessions, broken/empty Help Center
experience, missing user credit grants, incorrect creator publishing
approval, moderation/suspension rules, and a major UI/UX overhaul.
Existing production crash/schema work remains in scope.

## Live-site findings

The public Browse page currently renders a product listing, while
product navigation has previously produced route/fetch failures. The
Creators page currently exposes a `Test Creator`, which conflicts with
the required Founder-only Tester privacy rule. The Help Center renders
many categories/articles, but several visible article destinations
return 404s when followed, proving a content/route mismatch. The Support
page also exposes a `Loading...` state in the crawled output and needs
its client/data loading audited.

## Architecture rules

-   One canonical auth/session system.
-   One canonical role/permission system.
-   One canonical creator/store/product ownership system.
-   One canonical moderation system.
-   One canonical Help Center content system.
-   One canonical credits/grants ledger.
-   No frontend-only authorization/privacy.
-   No fake marketplace data.
-   No production reset.
-   No duplicate route systems.
-   No universal Dashboard redirects.
-   Optional sections cannot crash whole pages.
-   Creators control their own publishing.
-   Staff enforce marketplace rules; moderation is not ownership.
-   Tester data is Founder-only.

## Repair order

1.  Production database/schema/crash consistency.
2.  Auth/session reliability.
3.  Product routing and click flows.
4.  Shared API/data layer.
5.  Creator-controlled publishing.
6.  Moderation/suspend/remove with reasons.
7.  Tester privacy.
8.  Credits/grants.
9.  Help Center content/routing.
10. UI/UX overhaul.
11. Full regression/navigation testing.
