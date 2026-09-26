-- Reconciliation migration: brings the production database up to the current
-- prisma/schema.prisma by adding ONLY objects that are currently missing.
--
-- Additive & idempotent: every statement uses IF NOT EXISTS (or a DO-guard for
-- constraints, which PostgreSQL does not support with IF NOT EXISTS).
-- No columns are dropped, no tables are recreated/reset, no data is touched.
--
-- The preceding repo migration 20260908192500_add_missing_tables_and_columns
-- (never applied to production) adds ProductVersion.isCurrent/isPrerelease plus
-- Announcement/SiteSetting/ModerationNote. 20260908192500 uses CREATE TABLE
-- IF NOT EXISTS on prod (no-ops) and ALTER ADD COLUMN IF NOT EXISTS, so it is
-- safe to apply alongside this file.

-- ============================================================
-- ProductVersion: missing isCurrent, isPrerelease, updatedAt + FK to Product
-- ============================================================
ALTER TABLE "ProductVersion" ADD COLUMN IF NOT EXISTS "isCurrent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProductVersion" ADD COLUMN IF NOT EXISTS "isPrerelease" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProductVersion" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ProductVersion_productId_fkey'
      AND conrelid = '"ProductVersion"'::regclass
      AND contype = 'f'
  ) THEN
    ALTER TABLE "ProductVersion"
      ADD CONSTRAINT "ProductVersion_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- StripeTransfer: table entirely absent from production
-- ============================================================
CREATE TABLE IF NOT EXISTS "StripeTransfer" (
    "id"            TEXT NOT NULL,
    "orderId"       TEXT NOT NULL,
    "creatorId"     TEXT NOT NULL,
    "paymentId"     TEXT,
    "stripeTransferId" TEXT NOT NULL,
    "amount"        DOUBLE PRECISION NOT NULL,
    "currency"      TEXT NOT NULL DEFAULT 'USD',
    "status"        TEXT NOT NULL DEFAULT 'PENDING',
    "failureCode"   TEXT,
    "failureMessage" TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StripeTransfer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StripeTransfer_stripeTransferId_key" ON "StripeTransfer"("stripeTransferId");
CREATE INDEX IF NOT EXISTS "StripeTransfer_orderId_idx" ON "StripeTransfer"("orderId");
CREATE INDEX IF NOT EXISTS "StripeTransfer_creatorId_idx" ON "StripeTransfer"("creatorId");
CREATE INDEX IF NOT EXISTS "StripeTransfer_stripeTransferId_idx" ON "StripeTransfer"("stripeTransferId");
CREATE INDEX IF NOT EXISTS "StripeTransfer_status_idx" ON "StripeTransfer"("status");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StripeTransfer_orderId_fkey' AND conrelid = '"StripeTransfer"'::regclass AND contype = 'f') THEN
    ALTER TABLE "StripeTransfer" ADD CONSTRAINT "StripeTransfer_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StripeTransfer_creatorId_fkey' AND conrelid = '"StripeTransfer"'::regclass AND contype = 'f') THEN
    ALTER TABLE "StripeTransfer" ADD CONSTRAINT "StripeTransfer_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StripeTransfer_paymentId_fkey' AND conrelid = '"StripeTransfer"'::regclass AND contype = 'f') THEN
    ALTER TABLE "StripeTransfer" ADD CONSTRAINT "StripeTransfer_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- Refund: missing itemIds, isPartial
-- ============================================================
ALTER TABLE "Refund" ADD COLUMN IF NOT EXISTS "itemIds" TEXT;
ALTER TABLE "Refund" ADD COLUMN IF NOT EXISTS "isPartial" BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- Payout: missing stripePayoutId, currency, availableAt + indexes
-- ============================================================
ALTER TABLE "Payout" ADD COLUMN IF NOT EXISTS "stripePayoutId" TEXT;
ALTER TABLE "Payout" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "Payout" ADD COLUMN IF NOT EXISTS "availableAt" TIMESTAMP(3);
CREATE UNIQUE INDEX IF NOT EXISTS "Payout_stripePayoutId_key" ON "Payout"("stripePayoutId");
CREATE INDEX IF NOT EXISTS "Payout_stripePayoutId_idx" ON "Payout"("stripePayoutId");

-- ============================================================
-- CreatorAllocation: transferId/payoutId FKs + indexes absent in prod
-- ============================================================
CREATE INDEX IF NOT EXISTS "CreatorAllocation_transferId_idx" ON "CreatorAllocation"("transferId");
CREATE INDEX IF NOT EXISTS "CreatorAllocation_payoutId_idx" ON "CreatorAllocation"("payoutId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CreatorAllocation_transferId_fkey' AND conrelid = '"CreatorAllocation"'::regclass AND contype = 'f') THEN
    ALTER TABLE "CreatorAllocation" ADD CONSTRAINT "CreatorAllocation_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "StripeTransfer" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CreatorAllocation_payoutId_fkey' AND conrelid = '"CreatorAllocation"'::regclass AND contype = 'f') THEN
    ALTER TABLE "CreatorAllocation" ADD CONSTRAINT "CreatorAllocation_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- Missing FKs on tables that already exist (declared in schema.prisma)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CreatorTerms_userId_fkey' AND conrelid = '"CreatorTerms"'::regclass AND contype = 'f') THEN
    ALTER TABLE "CreatorTerms" ADD CONSTRAINT "CreatorTerms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Appeal_userId_fkey' AND conrelid = '"Appeal"'::regclass AND contype = 'f') THEN
    ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FeedbackPost_userId_fkey' AND conrelid = '"FeedbackPost"'::regclass AND contype = 'f') THEN
    ALTER TABLE "FeedbackPost" ADD CONSTRAINT "FeedbackPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EmailMessage_templateKey_fkey' AND conrelid = '"EmailMessage"'::regclass AND contype = 'f') THEN
    ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_templateKey_fkey" FOREIGN KEY ("templateKey") REFERENCES "EmailTemplate" ("key") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- Declared indexes absent in production (performance parity)
-- ============================================================
CREATE INDEX IF NOT EXISTS "Announcement_isPublished_idx" ON "Announcement"("isPublished");
CREATE INDEX IF NOT EXISTS "Announcement_publishedAt_idx" ON "Announcement"("publishedAt");
CREATE INDEX IF NOT EXISTS "EmailMessage_scheduledAt_idx" ON "EmailMessage"("scheduledAt");
CREATE INDEX IF NOT EXISTS "EmailMessage_idempotencyKey_idx" ON "EmailMessage"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "EmailTemplate_category_idx" ON "EmailTemplate"("category");
CREATE INDEX IF NOT EXISTS "ProductFile_productId_folder_idx" ON "ProductFile"("productId", "folder");
CREATE INDEX IF NOT EXISTS "StaffPick_isActive_idx" ON "StaffPick"("isActive");
