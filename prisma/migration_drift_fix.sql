-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CreatorAllocation_productId_fkey' AND conrelid = '"CreatorAllocation"'::regclass AND contype = 'f') THEN
    ALTER TABLE "CreatorAllocation" DROP CONSTRAINT "CreatorAllocation_productId_fkey";
  END IF;
END
$$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ModerationNote_reportId_fkey' AND conrelid = '"ModerationNote"'::regclass AND contype = 'f') THEN
    ALTER TABLE "ModerationNote" DROP CONSTRAINT "ModerationNote_reportId_fkey";
  END IF;
END
$$;

-- DropIndex
DROP INDEX IF EXISTS "Announcement_authorId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Announcement_createdAt_idx";

-- DropIndex
DROP INDEX IF EXISTS "License_currentVersion_idx";

-- DropIndex
DROP INDEX IF EXISTS "License_lastAccessedAt_idx";

-- DropIndex
DROP INDEX IF EXISTS "ModerationNote_authorId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Product_contentRating_idx";

-- DropIndex
DROP INDEX IF EXISTS "ProductFile_folder_idx";

-- DropIndex
DROP INDEX IF EXISTS "StaffPick_pickedBy_idx";

-- DropIndex
DROP INDEX IF EXISTS "User_creatorStatus_idx";

-- DropIndex
DROP INDEX IF EXISTS "User_isInternal_idx";

-- DropIndex
DROP INDEX IF EXISTS "User_status_idx";

-- AlterTable
ALTER TABLE "Announcement" ALTER COLUMN "publishedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Appeal" ALTER COLUMN "reviewedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Bundle" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Collection" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Coupon" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "minPurchase" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "CreatorApplication" ALTER COLUMN "reviewedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CreatorTerms" ALTER COLUMN "acceptedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Discount" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "MediaProcessingJob" ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "progress" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ModerationNote" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "total" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Payout" ADD COLUMN IF NOT EXISTS "availableAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS "stripePayoutId" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "salePrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "wholesalePrice" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ProductFile" ALTER COLUMN "folder" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProductMedia" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProductModeration" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ProductVersion" ADD COLUMN IF NOT EXISTS "isCurrent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "isPrerelease" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Refund" ADD COLUMN IF NOT EXISTS "isPartial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "itemIds" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SiteSetting" ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TaxRecord" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "rating" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "isFeatured" SET NOT NULL,
ALTER COLUMN "suspendedUntil" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "creatorTermsAcceptedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserModeration" ALTER COLUMN "expiresAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "StripeTransfer" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "paymentId" TEXT,
    "stripeTransferId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "StripeTransfer_stripeTransferId_key" ON "StripeTransfer"("stripeTransferId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StripeTransfer_orderId_idx" ON "StripeTransfer"("orderId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StripeTransfer_creatorId_idx" ON "StripeTransfer"("creatorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StripeTransfer_stripeTransferId_idx" ON "StripeTransfer"("stripeTransferId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StripeTransfer_status_idx" ON "StripeTransfer"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Announcement_isPublished_idx" ON "Announcement"("isPublished");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Announcement_publishedAt_idx" ON "Announcement"("publishedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CreatorAllocation_transferId_idx" ON "CreatorAllocation"("transferId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CreatorAllocation_payoutId_idx" ON "CreatorAllocation"("payoutId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailMessage_scheduledAt_idx" ON "EmailMessage"("scheduledAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailMessage_idempotencyKey_idx" ON "EmailMessage"("idempotencyKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailTemplate_category_idx" ON "EmailTemplate"("category");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Payout_stripePayoutId_key" ON "Payout"("stripePayoutId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Payout_stripePayoutId_idx" ON "Payout"("stripePayoutId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ProductFile_productId_folder_idx" ON "ProductFile"("productId", "folder");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StaffPick_isActive_idx" ON "StaffPick"("isActive");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductVersion_productId_fkey' AND conrelid = '"ProductVersion"'::regclass AND contype = 'f') THEN
    ALTER TABLE "ProductVersion" ADD CONSTRAINT "ProductVersion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StripeTransfer_orderId_fkey' AND conrelid = '"StripeTransfer"'::regclass AND contype = 'f') THEN
    ALTER TABLE "StripeTransfer" ADD CONSTRAINT "StripeTransfer_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StripeTransfer_creatorId_fkey' AND conrelid = '"StripeTransfer"'::regclass AND contype = 'f') THEN
    ALTER TABLE "StripeTransfer" ADD CONSTRAINT "StripeTransfer_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StripeTransfer_paymentId_fkey' AND conrelid = '"StripeTransfer"'::regclass AND contype = 'f') THEN
    ALTER TABLE "StripeTransfer" ADD CONSTRAINT "StripeTransfer_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CreatorAllocation_transferId_fkey' AND conrelid = '"CreatorAllocation"'::regclass AND contype = 'f') THEN
    ALTER TABLE "CreatorAllocation" ADD CONSTRAINT "CreatorAllocation_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "StripeTransfer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CreatorAllocation_payoutId_fkey' AND conrelid = '"CreatorAllocation"'::regclass AND contype = 'f') THEN
    ALTER TABLE "CreatorAllocation" ADD CONSTRAINT "CreatorAllocation_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ModerationNote_reportId_fkey' AND conrelid = '"ModerationNote"'::regclass AND contype = 'f') THEN
    ALTER TABLE "ModerationNote" ADD CONSTRAINT "ModerationNote_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CreatorTerms_userId_fkey' AND conrelid = '"CreatorTerms"'::regclass AND contype = 'f') THEN
    ALTER TABLE "CreatorTerms" ADD CONSTRAINT "CreatorTerms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Appeal_userId_fkey' AND conrelid = '"Appeal"'::regclass AND contype = 'f') THEN
    ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FeedbackPost_userId_fkey' AND conrelid = '"FeedbackPost"'::regclass AND contype = 'f') THEN
    ALTER TABLE "FeedbackPost" ADD CONSTRAINT "FeedbackPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EmailMessage_templateKey_fkey' AND conrelid = '"EmailMessage"'::regclass AND contype = 'f') THEN
    ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_templateKey_fkey" FOREIGN KEY ("templateKey") REFERENCES "EmailTemplate"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- PrivacySettings: per-user privacy controls
-- ============================================================
CREATE TABLE IF NOT EXISTS "PrivacySettings" (
    "id"                  TEXT   NOT NULL,
    "userId"              TEXT   NOT NULL,
    "profileVisibility"   TEXT   NOT NULL DEFAULT 'public',
    "showEmail"           BOOLEAN NOT NULL DEFAULT false,
    "showLocation"        BOOLEAN NOT NULL DEFAULT true,
    "showWebsite"         BOOLEAN NOT NULL DEFAULT true,
    "showBio"             BOOLEAN NOT NULL DEFAULT true,
    "showPurchases"       BOOLEAN NOT NULL DEFAULT false,
    "showReviews"         BOOLEAN NOT NULL DEFAULT true,
    "showWishlist"        BOOLEAN NOT NULL DEFAULT false,
    "allowDataCollection" BOOLEAN NOT NULL DEFAULT true,
    "allowPersonalization" BOOLEAN NOT NULL DEFAULT true,
    "allowMarketing"      BOOLEAN NOT NULL DEFAULT false,
    "updatedAt"           TIMESTAMP(3) NOT NULL,
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrivacySettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PrivacySettings_userId_key" ON "PrivacySettings"("userId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PrivacySettings_userId_fkey') THEN
    ALTER TABLE "PrivacySettings" ADD CONSTRAINT "PrivacySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- RecentlyViewed: user recently viewed products tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS "RecentlyViewed" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "viewedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecentlyViewed_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RecentlyViewed_userId_productId_key" ON "RecentlyViewed" ("userId", "productId");
CREATE INDEX IF NOT EXISTS "RecentlyViewed_userId_viewedAt_idx" ON "RecentlyViewed" ("userId", "viewedAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RecentlyViewed_userId_fkey') THEN
    ALTER TABLE "RecentlyViewed" ADD CONSTRAINT "RecentlyViewed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RecentlyViewed_productId_fkey') THEN
    ALTER TABLE "RecentlyViewed" ADD CONSTRAINT "RecentlyViewed_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- HomepageSection: dynamic homepage configuration
-- ============================================================
CREATE TABLE IF NOT EXISTS "HomepageSection" (
    "id"            TEXT NOT NULL,
    "type"          TEXT NOT NULL,
    "enabled"       BOOLEAN NOT NULL DEFAULT true,
    "displayOrder"  INTEGER NOT NULL DEFAULT 0,
    "config"        JSONB,
    "isSeasonal"    BOOLEAN NOT NULL DEFAULT false,
    "seasonStart"   TIMESTAMP(3),
    "seasonEnd"     TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HomepageSection_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "HomepageSection_enabled_displayOrder_idx" ON "HomepageSection"("enabled", "displayOrder");
CREATE INDEX IF NOT EXISTS "HomepageSection_isSeasonal_seasonStart_seasonEnd_idx" ON "HomepageSection"("isSeasonal", "seasonStart", "seasonEnd");

-- Insert default homepage sections matching current hardcoded homepage
-- Using WHERE NOT EXISTS because duplicate type values already exist in production
INSERT INTO "HomepageSection" ("id", "type", "enabled", "displayOrder", "config", "isSeasonal", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'hero', true, 0, '{"showCTA": true, "ctaText": "Browse Marketplace", "ctaHref": "/browse", "secondaryCtaText": "Start Selling", "secondaryCtaHref": "/auth/signin"}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "HomepageSection" WHERE "type" = 'hero');

INSERT INTO "HomepageSection" ("id", "type", "enabled", "displayOrder", "config", "isSeasonal", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'featuredProducts', true, 1, '{"title": "Featured", "limit": 4, "showAction": true, "actionLabel": "All featured", "actionHref": "/browse?featured=true"}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "HomepageSection" WHERE "type" = 'featuredProducts');

INSERT INTO "HomepageSection" ("id", "type", "enabled", "displayOrder", "config", "isSeasonal", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'staffPicks', true, 2, '{"title": "Staff Picks", "limit": 6}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "HomepageSection" WHERE "type" = 'staffPicks');

INSERT INTO "HomepageSection" ("id", "type", "enabled", "displayOrder", "config", "isSeasonal", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'followingFeed', true, 3, '{"title": "Following"}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "HomepageSection" WHERE "type" = 'followingFeed');

INSERT INTO "HomepageSection" ("id", "type", "enabled", "displayOrder", "config", "isSeasonal", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'trendingProducts', true, 4, '{"title": "Trending", "subtitle": "Popular right now", "limit": 8, "showAction": true, "actionLabel": "See more", "actionHref": "/browse?sort=popular"}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "HomepageSection" WHERE "type" = 'trendingProducts');

INSERT INTO "HomepageSection" ("id", "type", "enabled", "displayOrder", "config", "isSeasonal", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'newDrops', true, 5, '{"title": "New Drops", "subtitle": "Recently published", "limit": 8, "showAction": true, "actionLabel": "See all new", "actionHref": "/browse?sort=newest"}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "HomepageSection" WHERE "type" = 'newDrops');

INSERT INTO "HomepageSection" ("id", "type", "enabled", "displayOrder", "config", "isSeasonal", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'categories', true, 6, '{"title": "Shop by Category", "limit": 8, "showAction": true, "actionLabel": "All categories", "actionHref": "/categories"}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "HomepageSection" WHERE "type" = 'categories');

INSERT INTO "HomepageSection" ("id", "type", "enabled", "displayOrder", "config", "isSeasonal", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'creatorSpotlight', true, 7, '{"title": "Creator Spotlight", "subtitle": "Meet the artists behind the assets", "showAction": true, "actionLabel": "View store"}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "HomepageSection" WHERE "type" = 'creatorSpotlight');

INSERT INTO "HomepageSection" ("id", "type", "enabled", "displayOrder", "config", "isSeasonal", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'freeProducts', true, 8, '{"title": "Free Products", "subtitle": "Hand-picked free assets", "limit": 8, "showAction": true, "actionLabel": "Free in all", "actionHref": "/browse?free=true"}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "HomepageSection" WHERE "type" = 'freeProducts');

-- Add default Bundles homepage section
INSERT INTO "HomepageSection" ("id", "type", "enabled", "displayOrder", "config", "isSeasonal", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'bundles', true, 9, '{"title": "Bundles", "subtitle": "Curated collections at a discount", "limit": 4, "showAction": true, "actionLabel": "All bundles", "actionHref": "/bundles"}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "HomepageSection" WHERE "type" = 'bundles');

-- ============================================================
-- Announcement: publishing columns (scheduledAt, isPinned, priority)
-- ============================================================
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3);
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "isPinned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "priority" INTEGER NOT NULL DEFAULT 0;

-- ============================================================
-- SiteSetting: updatedBy user reference
-- ============================================================
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- ============================================================
-- HomepageSection: publishing columns (publishedAt, version)
-- ============================================================
ALTER TABLE "HomepageSection" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "HomepageSection" ADD COLUMN IF NOT EXISTS "previousConfig" JSONB;

-- ============================================================
-- SystemMetric: real-time monitoring data
-- ============================================================
CREATE TABLE IF NOT EXISTS "SystemMetric" (
    "id"            TEXT NOT NULL,
    "metricType"    TEXT NOT NULL,
    "value"         DOUBLE PRECISION NOT NULL,
    "unit"          TEXT,
    "details"       JSONB,
    "recordedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SystemMetric_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SystemMetric_metricType_recordedAt_idx" ON "SystemMetric"("metricType", "recordedAt");

-- ============================================================
-- SystemAlert: active monitoring alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS "SystemAlert" (
    "id"             TEXT NOT NULL,
    "severity"       TEXT NOT NULL,
    "title"          TEXT NOT NULL,
    "message"        TEXT NOT NULL,
    "source"         TEXT,
    "metadata"       JSONB,
    "acknowledged"   BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,
    "resolvedAt"     TIMESTAMP(3),
    "resolvedBy"     TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SystemAlert_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SystemAlert_severity_idx" ON "SystemAlert"("severity");
CREATE INDEX IF NOT EXISTS "SystemAlert_acknowledged_idx" ON "SystemAlert"("acknowledged");
CREATE INDEX IF NOT EXISTS "SystemAlert_createdAt_idx" ON "SystemAlert"("createdAt");
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "deviceName" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================================
-- User: display preferences (language, currency, theme)
-- ============================================================
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'en';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "theme" TEXT NOT NULL DEFAULT 'system';

-- ============================================================
-- User: missing columns (accentColor, reduceMotion, MFA)
-- Added 2026-09-12 to fix Prisma schema drift
-- ============================================================
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accentColor" TEXT DEFAULT '#8B5CF6';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfaSecret" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfaEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfaBackupCodes" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "reduceMotion" BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- Download -> ProductFile relation
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Download_fileId_fkey' AND conrelid = '"Download"'::regclass AND contype = 'f') THEN
    ALTER TABLE "Download" ADD CONSTRAINT "Download_fileId_fkey"
      FOREIGN KEY ("fileId") REFERENCES "ProductFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "Download_fileId_idx" ON "Download"("fileId");

-- ============================================================
-- Backup: founder-only restore tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS "Backup" (
    "id"            TEXT NOT NULL,
    "label"         TEXT NOT NULL,
    "type"          TEXT NOT NULL DEFAULT 'manual',
    "storage"       TEXT NOT NULL DEFAULT 'database',
    "sizeBytes"     INTEGER,
    "checksum"      TEXT,
    "status"        TEXT NOT NULL DEFAULT 'COMPLETED',
    "filePath"      TEXT,
    "errorMessage"  TEXT,
    "metadata"      JSONB,
    "createdById"  TEXT,
    "restoredAt"   TIMESTAMP(3),
    "restoredById" TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Backup_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Backup_type_idx" ON "Backup"("type");
CREATE INDEX IF NOT EXISTS "Backup_status_idx" ON "Backup"("status");
CREATE INDEX IF NOT EXISTS "Backup_createdAt_idx" ON "Backup"("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Backup_createdById_fkey') THEN
    ALTER TABLE "Backup" ADD CONSTRAINT "Backup_createdById_fkey"
      FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- ErrorLog: application error monitoring
-- ============================================================
CREATE TABLE IF NOT EXISTS "ErrorLog" (
    "id"           TEXT NOT NULL,
    "severity"     TEXT NOT NULL DEFAULT 'ERROR',
    "message"      TEXT NOT NULL,
    "stack"        TEXT,
    "endpoint"     TEXT,
    "method"       TEXT,
    "statusCode"   INTEGER,
    "userAgent"    TEXT,
    "ipAddress"    TEXT,
    "userId"       TEXT,
    "context"      JSONB,
    "resolved"     BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt"   TIMESTAMP(3),
    "resolvedById" TEXT,
    "occurredAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ErrorLog_severity_idx" ON "ErrorLog"("severity");
CREATE INDEX IF NOT EXISTS "ErrorLog_resolved_idx" ON "ErrorLog"("resolved");
CREATE INDEX IF NOT EXISTS "ErrorLog_endpoint_idx" ON "ErrorLog"("endpoint");
CREATE INDEX IF NOT EXISTS "ErrorLog_occurredAt_idx" ON "ErrorLog"("occurredAt");
CREATE INDEX IF NOT EXISTS "ErrorLog_userId_idx" ON "ErrorLog"("userId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ErrorLog_userId_fkey') THEN
    ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- PublishingDraft: draft/preview/publish/schedule/version/rollback
-- ============================================================
CREATE TABLE IF NOT EXISTS "PublishingDraft" (
    "id"             TEXT NOT NULL,
    "resourceType"   TEXT NOT NULL,
    "resourceId"     TEXT,
    "title"          TEXT NOT NULL,
    "summary"        TEXT,
    "changes"        JSONB,
    "previousVersion" JSONB,
    "status"         TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledAt"    TIMESTAMP(3),
    "publishedAt"    TIMESTAMP(3),
    "publishedById"  TEXT,
    "rollbackOf"     TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PublishingDraft_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PublishingDraft_resourceType_idx" ON "PublishingDraft"("resourceType");
CREATE INDEX IF NOT EXISTS "PublishingDraft_status_idx" ON "PublishingDraft"("status");
CREATE INDEX IF NOT EXISTS "PublishingDraft_scheduledAt_idx" ON "PublishingDraft"("scheduledAt");
CREATE INDEX IF NOT EXISTS "PublishingDraft_createdAt_idx" ON "PublishingDraft"("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PublishingDraft_publishedById_fkey') THEN
    ALTER TABLE "PublishingDraft" ADD CONSTRAINT "PublishingDraft_publishedById_fkey"
      FOREIGN KEY ("publishedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- Tutorial: creator/developer/usage guides
-- ============================================================
CREATE TABLE IF NOT EXISTS "Tutorial" (
    "id"          TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "slug"        TEXT NOT NULL UNIQUE,
    "summary"     TEXT,
    "body"        TEXT NOT NULL,
    "category"    TEXT NOT NULL DEFAULT 'general',
    "tags"        TEXT[] DEFAULT '{}',
    "readTime"    INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "authorId"    TEXT NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Tutorial_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Tutorial_slug_key" ON "Tutorial"("slug");
CREATE INDEX IF NOT EXISTS "Tutorial_category_idx" ON "Tutorial"("category");
CREATE INDEX IF NOT EXISTS "Tutorial_isPublished_idx" ON "Tutorial"("isPublished");
CREATE INDEX IF NOT EXISTS "Tutorial_publishedAt_idx" ON "Tutorial"("publishedAt");
CREATE INDEX IF NOT EXISTS "Tutorial_displayOrder_idx" ON "Tutorial"("displayOrder");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Tutorial_authorId_fkey') THEN
    ALTER TABLE "Tutorial" ADD CONSTRAINT "Tutorial_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- APIDocument: public API documentation
-- ============================================================
CREATE TABLE IF NOT EXISTS "APIDocument" (
    "id"          TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "slug"        TEXT NOT NULL UNIQUE,
    "summary"     TEXT,
    "body"        TEXT NOT NULL,
    "endpoint"    TEXT,
    "method"      TEXT,
    "category"    TEXT NOT NULL DEFAULT 'general',
    "tags"        TEXT[] DEFAULT '{}',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "authorId"    TEXT NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "APIDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "APIDocument_slug_key" ON "APIDocument"("slug");
CREATE INDEX IF NOT EXISTS "APIDocument_category_idx" ON "APIDocument"("category");
CREATE INDEX IF NOT EXISTS "APIDocument_isPublished_idx" ON "APIDocument"("isPublished");
CREATE INDEX IF NOT EXISTS "APIDocument_endpoint_idx" ON "APIDocument"("endpoint");
CREATE INDEX IF NOT EXISTS "APIDocument_displayOrder_idx" ON "APIDocument"("displayOrder");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'APIDocument_authorId_fkey') THEN
    ALTER TABLE "APIDocument" ADD CONSTRAINT "APIDocument_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;
-- ============================================================
-- Recommendation: product recommendations engine
-- ============================================================
CREATE TABLE IF NOT EXISTS "Recommendation" (
    "id"            TEXT NOT NULL,
    "userId"        TEXT,
    "productId"     TEXT NOT NULL,
    "score"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reason"        TEXT,
    "type"          TEXT NOT NULL DEFAULT 'similar',
    "isClicked"     BOOLEAN NOT NULL DEFAULT false,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Recommendation_userId_idx" ON "Recommendation"("userId");
CREATE INDEX IF NOT EXISTS "Recommendation_productId_idx" ON "Recommendation"("productId");
CREATE INDEX IF NOT EXISTS "Recommendation_type_idx" ON "Recommendation"("type");
CREATE INDEX IF NOT EXISTS "Recommendation_createdAt_idx" ON "Recommendation"("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Recommendation_userId_fkey') THEN
    ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Recommendation_productId_fkey') THEN
    ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- SearchAnalytics: founder search analytics
-- ============================================================
CREATE TABLE IF NOT EXISTS "SearchAnalytics" (
    "id"          TEXT NOT NULL,
    "query"       TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "type"        TEXT NOT NULL DEFAULT 'all',
    "userId"      TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchAnalytics_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SearchAnalytics_query_idx" ON "SearchAnalytics"("query");
CREATE INDEX IF NOT EXISTS "SearchAnalytics_createdAt_idx" ON "SearchAnalytics"("createdAt");
CREATE INDEX IF NOT EXISTS "SearchAnalytics_userId_idx" ON "SearchAnalytics"("userId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SearchAnalytics_userId_fkey') THEN
    ALTER TABLE "SearchAnalytics" ADD CONSTRAINT "SearchAnalytics_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- CreatorBadge: creator achievement badges
-- ============================================================
CREATE TABLE IF NOT EXISTS "CreatorBadge" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "badgeType" TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "description" TEXT,
    "iconUrl"   TEXT,
    "earnedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreatorBadge_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CreatorBadge_userId_idx" ON "CreatorBadge"("userId");
CREATE INDEX IF NOT EXISTS "CreatorBadge_badgeType_idx" ON "CreatorBadge"("badgeType");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CreatorBadge_userId_fkey') THEN
    ALTER TABLE "CreatorBadge" ADD CONSTRAINT "CreatorBadge_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- CreatorAchievement: creator milestone achievements
-- ============================================================
CREATE TABLE IF NOT EXISTS "CreatorAchievement" (
    "id"              TEXT NOT NULL,
    "userId"          TEXT NOT NULL,
    "achievementType" TEXT NOT NULL,
    "title"           TEXT NOT NULL,
    "description"     TEXT,
    "progress"        INTEGER NOT NULL DEFAULT 0,
    "target"          INTEGER NOT NULL DEFAULT 100,
    "isCompleted"     BOOLEAN NOT NULL DEFAULT false,
    "earnedAt"        TIMESTAMP(3),
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreatorAchievement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CreatorAchievement_userId_idx" ON "CreatorAchievement"("userId");
CREATE INDEX IF NOT EXISTS "CreatorAchievement_achievementType_idx" ON "CreatorAchievement"("achievementType");
CREATE INDEX IF NOT EXISTS "CreatorAchievement_isCompleted_idx" ON "CreatorAchievement"("isCompleted");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CreatorAchievement_userId_fkey') THEN
    ALTER TABLE "CreatorAchievement" ADD CONSTRAINT "CreatorAchievement_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- ProductNotification: product update notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS "ProductNotification" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type"      TEXT NOT NULL DEFAULT 'update',
    "message"   TEXT NOT NULL,
    "isRead"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProductNotification_userId_idx" ON "ProductNotification"("userId");
CREATE INDEX IF NOT EXISTS "ProductNotification_productId_idx" ON "ProductNotification"("productId");
CREATE INDEX IF NOT EXISTS "ProductNotification_isRead_idx" ON "ProductNotification"("isRead");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductNotification_userId_fkey') THEN
    ALTER TABLE "ProductNotification" ADD CONSTRAINT "ProductNotification_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductNotification_productId_fkey') THEN
    ALTER TABLE "ProductNotification" ADD CONSTRAINT "ProductNotification_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- PlatformNews: platform news/blog posts
-- ============================================================
CREATE TABLE IF NOT EXISTS "PlatformNews" (
    "id"          TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "slug"        TEXT NOT NULL UNIQUE,
    "summary"     TEXT,
    "body"        TEXT NOT NULL,
    "category"    TEXT NOT NULL DEFAULT 'general',
    "imageUrl"    TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "authorId"    TEXT NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlatformNews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PlatformNews_slug_key" ON "PlatformNews"("slug");
CREATE INDEX IF NOT EXISTS "PlatformNews_category_idx" ON "PlatformNews"("category");
CREATE INDEX IF NOT EXISTS "PlatformNews_isPublished_idx" ON "PlatformNews"("isPublished");
CREATE INDEX IF NOT EXISTS "PlatformNews_publishedAt_idx" ON "PlatformNews"("publishedAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PlatformNews_authorId_fkey') THEN
    ALTER TABLE "PlatformNews" ADD CONSTRAINT "PlatformNews_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- Event: community events
-- ============================================================
CREATE TABLE IF NOT EXISTS "Event" (
    "id"          TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "slug"        TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "startDate"   TIMESTAMP(3) NOT NULL,
    "endDate"     TIMESTAMP(3),
    "location"    TEXT,
    "imageUrl"    TEXT,
    "creatorId"   TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Event_slug_key" ON "Event"("slug");
CREATE INDEX IF NOT EXISTS "Event_startDate_idx" ON "Event"("startDate");
CREATE INDEX IF NOT EXISTS "Event_isPublished_idx" ON "Event"("isPublished");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Event_creatorId_fkey') THEN
    ALTER TABLE "Event" ADD CONSTRAINT "Event_creatorId_fkey"
      FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- GiftCard: gift card system
-- ============================================================
CREATE TABLE IF NOT EXISTS "GiftCard" (
    "id"        TEXT NOT NULL,
    "code"      TEXT NOT NULL UNIQUE,
    "type"      TEXT NOT NULL DEFAULT 'fixed',
    "value"     DOUBLE PRECISION NOT NULL,
    "currency"  TEXT NOT NULL DEFAULT 'USD',
    "maxUses"   INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "minPurchase" DOUBLE PRECISION,
    "startsAt"  TIMESTAMP(3),
    "endsAt"    TIMESTAMP(3),
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "GiftCard_code_key" ON "GiftCard"("code");
CREATE INDEX IF NOT EXISTS "GiftCard_isActive_idx" ON "GiftCard"("isActive");
CREATE INDEX IF NOT EXISTS "GiftCard_endsAt_idx" ON "GiftCard"("endsAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GiftCard_createdById_fkey') THEN
    ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_createdById_fkey"
      FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- StoreCredit: creator store credit system
-- ============================================================
CREATE TABLE IF NOT EXISTS "StoreCredit" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "amount"    DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency"  TEXT NOT NULL DEFAULT 'USD',
    "reason"    TEXT,
    "expiresAt" TIMESTAMP(3),
    "isUsed"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoreCredit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "StoreCredit_userId_idx" ON "StoreCredit"("userId");
CREATE INDEX IF NOT EXISTS "StoreCredit_expiresAt_idx" ON "StoreCredit"("expiresAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StoreCredit_userId_fkey') THEN
    ALTER TABLE "StoreCredit" ADD CONSTRAINT "StoreCredit_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- Contributor: credits page contributors
-- ============================================================
CREATE TABLE IF NOT EXISTS "Contributor" (
    "id"                      TEXT   NOT NULL,
    "userId"                  TEXT,
    "displayName"             TEXT   NOT NULL,
    "username"                TEXT   NOT NULL,
    "avatar"                  TEXT,
    "role"                    TEXT   NOT NULL,
    "roleLabel"               TEXT   NOT NULL,
    "roleColor"               TEXT   NOT NULL DEFAULT 'gray',
    "contributionDescription" TEXT,
    "socialLinks"             JSONB,
    "startDate"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate"                 TIMESTAMP(3),
    "isCurrent"               BOOLEAN NOT NULL DEFAULT true,
    "isFounder"               BOOLEAN NOT NULL DEFAULT false,
    "isFormer"                BOOLEAN NOT NULL DEFAULT false,
    "createdAt"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"               TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Contributor_userId_key" ON "Contributor"("userId");
CREATE INDEX IF NOT EXISTS "Contributor_role_idx" ON "Contributor"("role");
CREATE INDEX IF NOT EXISTS "Contributor_isCurrent_idx" ON "Contributor"("isCurrent");
CREATE INDEX IF NOT EXISTS "Contributor_isFounder_idx" ON "Contributor"("isFounder");
CREATE INDEX IF NOT EXISTS "Contributor_isFormer_idx" ON "Contributor"("isFormer");
CREATE INDEX IF NOT EXISTS "Contributor_startDate_idx" ON "Contributor"("startDate");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Contributor_userId_fkey') THEN
    ALTER TABLE "Contributor" ADD CONSTRAINT "Contributor_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- ServiceProvider: generic service providers
-- ============================================================
CREATE TABLE IF NOT EXISTS "ServiceProvider" (
    "id"               TEXT   NOT NULL,
    "userId"           TEXT   NOT NULL UNIQUE,
    "serviceType"      TEXT   NOT NULL,
    "serviceCategory"  TEXT   NOT NULL,
    "title"            TEXT   NOT NULL,
    "description"      TEXT   NOT NULL,
    "startingPrice"    DOUBLE PRECISION NOT NULL,
    "currency"         TEXT   NOT NULL DEFAULT 'USD',
    "availability"     TEXT   NOT NULL DEFAULT 'open',
    "turnaroundDays"   INTEGER NOT NULL DEFAULT 7,
    "tags"             TEXT[] DEFAULT '{}',
    "isVerified"       BOOLEAN NOT NULL DEFAULT false,
    "isFeatured"       BOOLEAN NOT NULL DEFAULT false,
    "isActive"         BOOLEAN NOT NULL DEFAULT true,
    "rating"           DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount"      INTEGER NOT NULL DEFAULT 0,
    "completedOrders"  INTEGER NOT NULL DEFAULT 0,
    "portfolioImages"  TEXT[] DEFAULT '{}',
    "socialLinks"      JSONB,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ServiceProvider_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ServiceProvider_userId_key" ON "ServiceProvider"("userId");
CREATE INDEX IF NOT EXISTS "ServiceProvider_serviceType_idx" ON "ServiceProvider"("serviceType");
CREATE INDEX IF NOT EXISTS "ServiceProvider_serviceCategory_idx" ON "ServiceProvider"("serviceCategory");
CREATE INDEX IF NOT EXISTS "ServiceProvider_availability_idx" ON "ServiceProvider"("availability");
CREATE INDEX IF NOT EXISTS "ServiceProvider_isVerified_idx" ON "ServiceProvider"("isVerified");
CREATE INDEX IF NOT EXISTS "ServiceProvider_isFeatured_idx" ON "ServiceProvider"("isFeatured");
CREATE INDEX IF NOT EXISTS "ServiceProvider_isActive_idx" ON "ServiceProvider"("isActive");
CREATE INDEX IF NOT EXISTS "ServiceProvider_rating_idx" ON "ServiceProvider"("rating");
CREATE INDEX IF NOT EXISTS "ServiceProvider_createdAt_idx" ON "ServiceProvider"("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServiceProvider_userId_fkey') THEN
    ALTER TABLE "ServiceProvider" ADD CONSTRAINT "ServiceProvider_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- AvatarCommissioner: avatar commission services
-- ============================================================
CREATE TABLE IF NOT EXISTS "AvatarCommissioner" (
    "id"                    TEXT   NOT NULL,
    "userId"                TEXT   NOT NULL UNIQUE,
    "serviceType"           TEXT   NOT NULL DEFAULT 'avatar-commissions',
    "bio"                   TEXT,
    "profileImage"          TEXT,
    "bannerImage"           TEXT,
    "commissionTypes"       TEXT[] DEFAULT '{}',
    "availability"          TEXT   NOT NULL DEFAULT 'open',
    "openSlots"             INTEGER NOT NULL DEFAULT 1,
    "maxSlots"              INTEGER NOT NULL DEFAULT 5,
    "turnaroundDays"        INTEGER NOT NULL DEFAULT 14,
    "portfolioImages"       TEXT[] DEFAULT '{}',
    "tags"                  TEXT[] DEFAULT '{}',
    "categories"            TEXT[] DEFAULT '{}',
    "isVerified"            BOOLEAN NOT NULL DEFAULT false,
    "isFeatured"            BOOLEAN NOT NULL DEFAULT false,
    "isActive"              BOOLEAN NOT NULL DEFAULT true,
    "rating"                DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount"           INTEGER NOT NULL DEFAULT 0,
    "completedCommissions"  INTEGER NOT NULL DEFAULT 0,
    "socialLinks"           JSONB,
    "contactLinks"          JSONB,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AvatarCommissioner_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AvatarCommissioner_userId_key" ON "AvatarCommissioner"("userId");
CREATE INDEX IF NOT EXISTS "AvatarCommissioner_availability_idx" ON "AvatarCommissioner"("availability");
CREATE INDEX IF NOT EXISTS "AvatarCommissioner_isVerified_idx" ON "AvatarCommissioner"("isVerified");
CREATE INDEX IF NOT EXISTS "AvatarCommissioner_isFeatured_idx" ON "AvatarCommissioner"("isFeatured");
CREATE INDEX IF NOT EXISTS "AvatarCommissioner_isActive_idx" ON "AvatarCommissioner"("isActive");
CREATE INDEX IF NOT EXISTS "AvatarCommissioner_rating_idx" ON "AvatarCommissioner"("rating");
CREATE INDEX IF NOT EXISTS "AvatarCommissioner_turnaroundDays_idx" ON "AvatarCommissioner"("turnaroundDays");
CREATE INDEX IF NOT EXISTS "AvatarCommissioner_createdAt_idx" ON "AvatarCommissioner"("createdAt");
CREATE INDEX IF NOT EXISTS "AvatarCommissioner_categories_idx" ON "AvatarCommissioner"("categories");
CREATE INDEX IF NOT EXISTS "AvatarCommissioner_commissionTypes_idx" ON "AvatarCommissioner"("commissionTypes");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AvatarCommissioner_userId_fkey') THEN
    ALTER TABLE "AvatarCommissioner" ADD CONSTRAINT "AvatarCommissioner_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- AvatarCommissionPricing: avatar commission pricing tiers
-- ============================================================
CREATE TABLE IF NOT EXISTS "AvatarCommissionPricing" (
    "id"             TEXT   NOT NULL,
    "commissionerId" TEXT   NOT NULL,
    "type"           TEXT   NOT NULL,
    "minPrice"       DOUBLE PRECISION NOT NULL,
    "maxPrice"       DOUBLE PRECISION NOT NULL,
    "currency"       TEXT   NOT NULL DEFAULT 'USD',
    "description"    TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AvatarCommissionPricing_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AvatarCommissionPricing_commissionerId_idx" ON "AvatarCommissionPricing"("commissionerId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AvatarCommissionPricing_commissionerId_fkey') THEN
    ALTER TABLE "AvatarCommissionPricing" ADD CONSTRAINT "AvatarCommissionPricing_commissionerId_fkey"
      FOREIGN KEY ("commissionerId") REFERENCES "AvatarCommissioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- ArtCommissioner: art commission services
-- ============================================================
CREATE TABLE IF NOT EXISTS "ArtCommissioner" (
    "id"                    TEXT   NOT NULL,
    "userId"                TEXT   NOT NULL UNIQUE,
    "serviceType"           TEXT   NOT NULL DEFAULT 'art-commissions',
    "bio"                   TEXT,
    "profileImage"          TEXT,
    "bannerImage"           TEXT,
    "artStyles"             TEXT[] DEFAULT '{}',
    "commissionTypes"       TEXT[] DEFAULT '{}',
    "availability"          TEXT   NOT NULL DEFAULT 'open',
    "openSlots"             INTEGER NOT NULL DEFAULT 1,
    "maxSlots"              INTEGER NOT NULL DEFAULT 5,
    "turnaroundDays"        INTEGER NOT NULL DEFAULT 7,
    "portfolioImages"       TEXT[] DEFAULT '{}',
    "tags"                  TEXT[] DEFAULT '{}',
    "categories"            TEXT[] DEFAULT '{}',
    "isVerified"            BOOLEAN NOT NULL DEFAULT false,
    "isFeatured"            BOOLEAN NOT NULL DEFAULT false,
    "isActive"              BOOLEAN NOT NULL DEFAULT true,
    "rating"                DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount"           INTEGER NOT NULL DEFAULT 0,
    "completedCommissions"  INTEGER NOT NULL DEFAULT 0,
    "socialLinks"           JSONB,
    "contactLinks"          JSONB,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArtCommissioner_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ArtCommissioner_userId_key" ON "ArtCommissioner"("userId");
CREATE INDEX IF NOT EXISTS "ArtCommissioner_availability_idx" ON "ArtCommissioner"("availability");
CREATE INDEX IF NOT EXISTS "ArtCommissioner_isVerified_idx" ON "ArtCommissioner"("isVerified");
CREATE INDEX IF NOT EXISTS "ArtCommissioner_isFeatured_idx" ON "ArtCommissioner"("isFeatured");
CREATE INDEX IF NOT EXISTS "ArtCommissioner_isActive_idx" ON "ArtCommissioner"("isActive");
CREATE INDEX IF NOT EXISTS "ArtCommissioner_rating_idx" ON "ArtCommissioner"("rating");
CREATE INDEX IF NOT EXISTS "ArtCommissioner_turnaroundDays_idx" ON "ArtCommissioner"("turnaroundDays");
CREATE INDEX IF NOT EXISTS "ArtCommissioner_createdAt_idx" ON "ArtCommissioner"("createdAt");
CREATE INDEX IF NOT EXISTS "ArtCommissioner_categories_idx" ON "ArtCommissioner"("categories");
CREATE INDEX IF NOT EXISTS "ArtCommissioner_commissionTypes_idx" ON "ArtCommissioner"("commissionTypes");
CREATE INDEX IF NOT EXISTS "ArtCommissioner_artStyles_idx" ON "ArtCommissioner"("artStyles");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArtCommissioner_userId_fkey') THEN
    ALTER TABLE "ArtCommissioner" ADD CONSTRAINT "ArtCommissioner_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- ArtCommissionPricing: art commission pricing tiers
-- ============================================================
CREATE TABLE IF NOT EXISTS "ArtCommissionPricing" (
    "id"             TEXT   NOT NULL,
    "commissionerId" TEXT   NOT NULL,
    "type"           TEXT   NOT NULL,
    "minPrice"       DOUBLE PRECISION NOT NULL,
    "maxPrice"       DOUBLE PRECISION NOT NULL,
    "currency"       TEXT   NOT NULL DEFAULT 'USD',
    "description"    TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArtCommissionPricing_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ArtCommissionPricing_commissionerId_idx" ON "ArtCommissionPricing"("commissionerId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArtCommissionPricing_commissionerId_fkey') THEN
    ALTER TABLE "ArtCommissionPricing" ADD CONSTRAINT "ArtCommissionPricing_commissionerId_fkey"
      FOREIGN KEY ("commissionerId") REFERENCES "ArtCommissioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- ThreeDServiceProvider: 3D services
-- ============================================================
CREATE TABLE IF NOT EXISTS "ThreeDServiceProvider" (
    "id"                TEXT   NOT NULL,
    "userId"            TEXT   NOT NULL UNIQUE,
    "serviceType"       TEXT   NOT NULL DEFAULT '3d-services',
    "bio"               TEXT,
    "profileImage"      TEXT,
    "bannerImage"       TEXT,
    "serviceTypes"      TEXT[] DEFAULT '{}',
    "specializations"   TEXT[] DEFAULT '{}',
    "availability"      TEXT   NOT NULL DEFAULT 'open',
    "openSlots"         INTEGER NOT NULL DEFAULT 1,
    "maxSlots"          INTEGER NOT NULL DEFAULT 5,
    "turnaroundDays"    INTEGER NOT NULL DEFAULT 14,
    "portfolioImages"   TEXT[] DEFAULT '{}',
    "tags"              TEXT[] DEFAULT '{}',
    "categories"        TEXT[] DEFAULT '{}',
    "software"          TEXT[] DEFAULT '{}',
    "isVerified"        BOOLEAN NOT NULL DEFAULT false,
    "isFeatured"        BOOLEAN NOT NULL DEFAULT false,
    "isActive"          BOOLEAN NOT NULL DEFAULT true,
    "rating"            DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount"       INTEGER NOT NULL DEFAULT 0,
    "completedOrders"   INTEGER NOT NULL DEFAULT 0,
    "socialLinks"       JSONB,
    "contactLinks"      JSONB,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ThreeDServiceProvider_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ThreeDServiceProvider_userId_key" ON "ThreeDServiceProvider"("userId");
CREATE INDEX IF NOT EXISTS "ThreeDServiceProvider_availability_idx" ON "ThreeDServiceProvider"("availability");
CREATE INDEX IF NOT EXISTS "ThreeDServiceProvider_isVerified_idx" ON "ThreeDServiceProvider"("isVerified");
CREATE INDEX IF NOT EXISTS "ThreeDServiceProvider_isFeatured_idx" ON "ThreeDServiceProvider"("isFeatured");
CREATE INDEX IF NOT EXISTS "ThreeDServiceProvider_isActive_idx" ON "ThreeDServiceProvider"("isActive");
CREATE INDEX IF NOT EXISTS "ThreeDServiceProvider_rating_idx" ON "ThreeDServiceProvider"("rating");
CREATE INDEX IF NOT EXISTS "ThreeDServiceProvider_turnaroundDays_idx" ON "ThreeDServiceProvider"("turnaroundDays");
CREATE INDEX IF NOT EXISTS "ThreeDServiceProvider_createdAt_idx" ON "ThreeDServiceProvider"("createdAt");
CREATE INDEX IF NOT EXISTS "ThreeDServiceProvider_categories_idx" ON "ThreeDServiceProvider"("categories");
CREATE INDEX IF NOT EXISTS "ThreeDServiceProvider_serviceTypes_idx" ON "ThreeDServiceProvider"("serviceTypes");
CREATE INDEX IF NOT EXISTS "ThreeDServiceProvider_software_idx" ON "ThreeDServiceProvider"("software");
CREATE INDEX IF NOT EXISTS "ThreeDServiceProvider_specializations_idx" ON "ThreeDServiceProvider"("specializations");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ThreeDServiceProvider_userId_fkey') THEN
    ALTER TABLE "ThreeDServiceProvider" ADD CONSTRAINT "ThreeDServiceProvider_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- ThreeDServicePricing: 3D service pricing
-- ============================================================
CREATE TABLE IF NOT EXISTS "ThreeDServicePricing" (
    "id"        TEXT   NOT NULL,
    "providerId" TEXT  NOT NULL,
    "type"      TEXT   NOT NULL,
    "minPrice"  DOUBLE PRECISION NOT NULL,
    "maxPrice"  DOUBLE PRECISION NOT NULL,
    "currency"  TEXT   NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ThreeDServicePricing_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ThreeDServicePricing_providerId_idx" ON "ThreeDServicePricing"("providerId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ThreeDServicePricing_providerId_fkey') THEN
    ALTER TABLE "ThreeDServicePricing" ADD CONSTRAINT "ThreeDServicePricing_providerId_fkey"
      FOREIGN KEY ("providerId") REFERENCES "ThreeDServiceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- DevelopmentServiceProvider: development services
-- ============================================================
CREATE TABLE IF NOT EXISTS "DevelopmentServiceProvider" (
    "id"                TEXT   NOT NULL,
    "userId"            TEXT   NOT NULL UNIQUE,
    "serviceType"       TEXT   NOT NULL DEFAULT 'development',
    "bio"               TEXT,
    "profileImage"      TEXT,
    "bannerImage"       TEXT,
    "serviceTypes"      TEXT[] DEFAULT '{}',
    "technologies"      TEXT[] DEFAULT '{}',
    "availability"      TEXT   NOT NULL DEFAULT 'open',
    "openSlots"         INTEGER NOT NULL DEFAULT 1,
    "maxSlots"          INTEGER NOT NULL DEFAULT 5,
    "turnaroundDays"    INTEGER NOT NULL DEFAULT 14,
    "portfolioImages"   TEXT[] DEFAULT '{}',
    "tags"              TEXT[] DEFAULT '{}',
    "categories"        TEXT[] DEFAULT '{}',
    "isVerified"        BOOLEAN NOT NULL DEFAULT false,
    "isFeatured"        BOOLEAN NOT NULL DEFAULT false,
    "isActive"          BOOLEAN NOT NULL DEFAULT true,
    "rating"            DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount"       INTEGER NOT NULL DEFAULT 0,
    "completedOrders"   INTEGER NOT NULL DEFAULT 0,
    "socialLinks"       JSONB,
    "contactLinks"      JSONB,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DevelopmentServiceProvider_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DevelopmentServiceProvider_userId_key" ON "DevelopmentServiceProvider"("userId");
CREATE INDEX IF NOT EXISTS "DevelopmentServiceProvider_availability_idx" ON "DevelopmentServiceProvider"("availability");
CREATE INDEX IF NOT EXISTS "DevelopmentServiceProvider_isVerified_idx" ON "DevelopmentServiceProvider"("isVerified");
CREATE INDEX IF NOT EXISTS "DevelopmentServiceProvider_isFeatured_idx" ON "DevelopmentServiceProvider"("isFeatured");
CREATE INDEX IF NOT EXISTS "DevelopmentServiceProvider_isActive_idx" ON "DevelopmentServiceProvider"("isActive");
CREATE INDEX IF NOT EXISTS "DevelopmentServiceProvider_rating_idx" ON "DevelopmentServiceProvider"("rating");
CREATE INDEX IF NOT EXISTS "DevelopmentServiceProvider_turnaroundDays_idx" ON "DevelopmentServiceProvider"("turnaroundDays");
CREATE INDEX IF NOT EXISTS "DevelopmentServiceProvider_createdAt_idx" ON "DevelopmentServiceProvider"("createdAt");
CREATE INDEX IF NOT EXISTS "DevelopmentServiceProvider_categories_idx" ON "DevelopmentServiceProvider"("categories");
CREATE INDEX IF NOT EXISTS "DevelopmentServiceProvider_serviceTypes_idx" ON "DevelopmentServiceProvider"("serviceTypes");
CREATE INDEX IF NOT EXISTS "DevelopmentServiceProvider_technologies_idx" ON "DevelopmentServiceProvider"("technologies");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DevelopmentServiceProvider_userId_fkey') THEN
    ALTER TABLE "DevelopmentServiceProvider" ADD CONSTRAINT "DevelopmentServiceProvider_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- DevelopmentServicePricing: development service pricing
-- ============================================================
CREATE TABLE IF NOT EXISTS "DevelopmentServicePricing" (
    "id"        TEXT   NOT NULL,
    "providerId" TEXT  NOT NULL,
    "type"      TEXT   NOT NULL,
    "minPrice"  DOUBLE PRECISION NOT NULL,
    "maxPrice"  DOUBLE PRECISION NOT NULL,
    "currency"  TEXT   NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DevelopmentServicePricing_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DevelopmentServicePricing_providerId_idx" ON "DevelopmentServicePricing"("providerId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DevelopmentServicePricing_providerId_fkey') THEN
    ALTER TABLE "DevelopmentServicePricing" ADD CONSTRAINT "DevelopmentServicePricing_providerId_fkey"
      FOREIGN KEY ("providerId") REFERENCES "DevelopmentServiceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- VideoEditingServiceProvider: video editing services
-- ============================================================
CREATE TABLE IF NOT EXISTS "VideoEditingServiceProvider" (
    "id"                TEXT   NOT NULL,
    "userId"            TEXT   NOT NULL UNIQUE,
    "serviceType"       TEXT   NOT NULL DEFAULT 'video-editing',
    "bio"               TEXT,
    "profileImage"      TEXT,
    "bannerImage"       TEXT,
    "serviceTypes"      TEXT[] DEFAULT '{}',
    "software"          TEXT[] DEFAULT '{}',
    "availability"      TEXT   NOT NULL DEFAULT 'open',
    "openSlots"         INTEGER NOT NULL DEFAULT 1,
    "maxSlots"          INTEGER NOT NULL DEFAULT 5,
    "turnaroundDays"    INTEGER NOT NULL DEFAULT 7,
    "portfolioImages"   TEXT[] DEFAULT '{}',
    "tags"              TEXT[] DEFAULT '{}',
    "categories"        TEXT[] DEFAULT '{}',
    "isVerified"        BOOLEAN NOT NULL DEFAULT false,
    "isFeatured"        BOOLEAN NOT NULL DEFAULT false,
    "isActive"          BOOLEAN NOT NULL DEFAULT true,
    "rating"            DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount"       INTEGER NOT NULL DEFAULT 0,
    "completedOrders"   INTEGER NOT NULL DEFAULT 0,
    "socialLinks"       JSONB,
    "contactLinks"      JSONB,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VideoEditingServiceProvider_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VideoEditingServiceProvider_userId_key" ON "VideoEditingServiceProvider"("userId");
CREATE INDEX IF NOT EXISTS "VideoEditingServiceProvider_availability_idx" ON "VideoEditingServiceProvider"("availability");
CREATE INDEX IF NOT EXISTS "VideoEditingServiceProvider_isVerified_idx" ON "VideoEditingServiceProvider"("isVerified");
CREATE INDEX IF NOT EXISTS "VideoEditingServiceProvider_isFeatured_idx" ON "VideoEditingServiceProvider"("isFeatured");
CREATE INDEX IF NOT EXISTS "VideoEditingServiceProvider_isActive_idx" ON "VideoEditingServiceProvider"("isActive");
CREATE INDEX IF NOT EXISTS "VideoEditingServiceProvider_rating_idx" ON "VideoEditingServiceProvider"("rating");
CREATE INDEX IF NOT EXISTS "VideoEditingServiceProvider_turnaroundDays_idx" ON "VideoEditingServiceProvider"("turnaroundDays");
CREATE INDEX IF NOT EXISTS "VideoEditingServiceProvider_createdAt_idx" ON "VideoEditingServiceProvider"("createdAt");
CREATE INDEX IF NOT EXISTS "VideoEditingServiceProvider_categories_idx" ON "VideoEditingServiceProvider"("categories");
CREATE INDEX IF NOT EXISTS "VideoEditingServiceProvider_serviceTypes_idx" ON "VideoEditingServiceProvider"("serviceTypes");
CREATE INDEX IF NOT EXISTS "VideoEditingServiceProvider_software_idx" ON "VideoEditingServiceProvider"("software");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VideoEditingServiceProvider_userId_fkey') THEN
    ALTER TABLE "VideoEditingServiceProvider" ADD CONSTRAINT "VideoEditingServiceProvider_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ============================================================
-- VideoEditingServicePricing: video editing service pricing
-- ============================================================
CREATE TABLE IF NOT EXISTS "VideoEditingServicePricing" (
    "id"        TEXT   NOT NULL,
    "providerId" TEXT  NOT NULL,
    "type"      TEXT   NOT NULL,
    "minPrice"  DOUBLE PRECISION NOT NULL,
    "maxPrice"  DOUBLE PRECISION NOT NULL,
    "currency"  TEXT   NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VideoEditingServicePricing_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "VideoEditingServicePricing_providerId_idx" ON "VideoEditingServicePricing"("providerId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VideoEditingServicePricing_providerId_fkey') THEN
    ALTER TABLE "VideoEditingServicePricing" ADD CONSTRAINT "VideoEditingServicePricing_providerId_fkey"
      FOREIGN KEY ("providerId") REFERENCES "VideoEditingServiceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;
