# PawVault --- Kilo Implementation & Regression Instructions

## Audit first

Before changing code, report:

1.  Production 500/digest inventory.
2.  Prisma models vs production tables/columns/enums/relations.
3.  Auth/session/role/permission source of truth.
4.  Product route inventory and duplicate route definitions.
5.  Help Center article registry and every broken link.
6.  Existing credits/wallet/grant models.
7.  Creator publish/moderation state machine.
8.  Tester account representation and all public exposure paths.
9.  Manager/admin/mod route guards and Dashboard redirects.
10. UI duplication sources.

## Do not

-   Reset production.
-   Disable RLS.
-   Create fake marketplace data.
-   Create duplicate auth/role/permission/creator/moderation systems.
-   Make Moderators Administrators.
-   Hide Tester only on the frontend.
-   Redirect every error to Dashboard.
-   Make staff the owner of creator products.

## Repair order

Database/schema → sessions → product routes → shared data → creator
publishing → moderation → Tester privacy → credits → Help Center → UI/UX
→ full regression.

## Required regression

Test public pages, protected pages, product clicks, sign-in/refresh,
creator publishing, moderation, Tester visibility, credits, every Help
Center article, Manager navigation, Back/Forward, refresh, direct URLs,
multiple tabs and mobile.

## Done

No raw server exceptions, no product click errors, stable sessions, real
Help Center articles/routes, auditable credit grants, creator-controlled
publishing, reasoned staff enforcement, Founder-only Tester visibility,
correct Manager destinations, no duplicated UI and a coherent responsive
marketplace UI.
