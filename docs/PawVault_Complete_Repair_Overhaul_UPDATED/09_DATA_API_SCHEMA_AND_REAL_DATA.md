# PawVault --- Data/API/Schema Consistency Repair

## Goal

Stop pages from expecting data/schema that production does not have.

Compare Prisma schema, migrations, production database, generated Prisma
Client, API contracts and frontend types.

Check missing tables, columns, relations, enums, indexes, RLS,
nullability, response shapes, duplicate records and cache consistency.

## Confirmed example

`prisma.staffPick.findMany()` currently expects `public.StaffPick`,
while production previously reported P2021 because that table was
missing. Audit the entire schema for the same class of issue.

## Real data only

Empty database state = real empty UI. Missing schema = migration repair.
Never insert fake creators/products/orders/reviews to make pages look
healthy.

## API

Every endpoint needs defined auth, authorization, validation, response,
error status and empty behavior. Mutations need idempotency where
duplicate requests are dangerous.

## Cache

Invalidate caches after permissions, tester visibility, moderation and
content changes. Stale caches must not re-expose hidden Tester data or
suspended products.
