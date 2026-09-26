-- ============================================================================
-- PawVault - missing schema objects for Supabase
-- Target:    public schema (Supabase SQL Editor -> New query -> Run)
-- Generated: from a live read-only diff of the production database against
--            prisma/schema.prisma on 2026-09-26
--
-- WHY THIS FILE EXISTS
-- All 26 Prisma migrations in prisma/migrations are already recorded as
-- applied in the production _prisma_migrations table, so `prisma migrate
-- deploy` is a no-op and will NOT create anything. These objects are declared
-- in prisma/schema.prisma but were never captured by a migration, so the
-- database is behind the schema.
--
-- This script is idempotent. It is safe to run more than once.
--
-- WHAT BREAKS WITHOUT PART 1
--   prisma.appearanceConfig  -> /site-settings, /api/site-settings,
--                               /admin/founder/appearance, /admin/founder/security
--   prisma.featureFlag       -> /admin/founder/feature-flags, /api/admin/feature-flags
--   prisma.financeConfig     -> /admin/founder/financials, /api/admin/financials
--   prisma.marketplaceRule   -> /admin/founder/rules, /api/admin/rules
--   EmailPreference columns  -> /api/account/preferences (GET and PUT both 500)
-- Each of these throws "relation does not exist" until Part 1 is applied.
-- ============================================================================


-- ============================================================================
-- PART 1 - REQUIRED
-- ============================================================================

-- --- AppearanceConfig ------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AppearanceConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "brandName" TEXT NOT NULL DEFAULT 'PawMart',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#8B5CF6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#EC4899',
    "accentColor" TEXT NOT NULL DEFAULT '#F59E0B',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "headingFontFamily" TEXT,
    "borderRadius" TEXT NOT NULL DEFAULT '0.5rem',
    "shadowIntensity" TEXT NOT NULL DEFAULT 'md',
    "motionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "density" TEXT NOT NULL DEFAULT 'comfortable',
    "customCss" TEXT,
    "customJs" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImageUrl" TEXT,
    "analyticsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "analyticsProvider" TEXT,
    "analyticsId" TEXT,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppearanceConfig_pkey" PRIMARY KEY ("id")
);

-- --- FinanceConfig ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS "FinanceConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "platformFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "moderatorFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "serverFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRatePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxLabel" TEXT,
    "minimumPayout" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "payoutSchedule" TEXT NOT NULL DEFAULT 'WEEKLY',
    "payoutHoldDays" INTEGER NOT NULL DEFAULT 7,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
    "supportedCurrencies" JSONB,
    "stripeConnectEnabled" BOOLEAN NOT NULL DEFAULT true,
    "stripeWebhookSigningSecret" TEXT,
    "invoiceEnabled" BOOLEAN NOT NULL DEFAULT false,
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV',
    "refundWindowDays" INTEGER NOT NULL DEFAULT 30,
    "disputeWindowDays" INTEGER NOT NULL DEFAULT 14,
    "chargebackReservePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceConfig_pkey" PRIMARY KEY ("id")
);

-- --- FeatureFlag -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "FeatureFlag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercent" INTEGER NOT NULL DEFAULT 0,
    "targetUsers" JSONB,
    "targetRoles" JSONB,
    "environment" TEXT NOT NULL DEFAULT 'production',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "FeatureFlag_key_key" ON "FeatureFlag"("key");
CREATE INDEX IF NOT EXISTS "FeatureFlag_enabled_idx" ON "FeatureFlag"("enabled");
CREATE INDEX IF NOT EXISTS "FeatureFlag_environment_idx" ON "FeatureFlag"("environment");

-- --- MarketplaceRule -------------------------------------------------------
CREATE TABLE IF NOT EXISTS "MarketplaceRule" (
    "id" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "scopeId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceRule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MarketplaceRule_ruleType_idx" ON "MarketplaceRule"("ruleType");
CREATE INDEX IF NOT EXISTS "MarketplaceRule_scope_idx" ON "MarketplaceRule"("scope");
CREATE INDEX IF NOT EXISTS "MarketplaceRule_isActive_idx" ON "MarketplaceRule"("isActive");
CREATE INDEX IF NOT EXISTS "MarketplaceRule_priority_idx" ON "MarketplaceRule"("priority");

-- --- AnalyticsEvent --------------------------------------------------------
-- Declared in schema.prisma but not referenced anywhere in src/ at present.
-- Created so the schema and the database agree.
CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "eventType" TEXT NOT NULL,
    "path" TEXT,
    "title" TEXT,
    "referrer" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AnalyticsEvent_eventType_idx" ON "AnalyticsEvent"("eventType");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_path_idx" ON "AnalyticsEvent"("path");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");

-- --- PageViewDaily ---------------------------------------------------------
-- Declared in schema.prisma but not referenced anywhere in src/ at present.
CREATE TABLE IF NOT EXISTS "PageViewDaily" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageViewDaily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PageViewDaily_path_date_key" ON "PageViewDaily"("path", "date");
CREATE INDEX IF NOT EXISTS "PageViewDaily_date_idx" ON "PageViewDaily"("date");

-- --- EmailPreference: 11 missing columns -----------------------------------
-- /api/account/preferences reads and writes every one of these. The table
-- currently holds 0 rows, so adding NOT NULL columns with a default is safe.
ALTER TABLE "EmailPreference"
    ADD COLUMN IF NOT EXISTS "creatorAnnouncements"  BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "creatorApproval"       BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "newProductFollowed"    BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "paymentNotifications"  BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "payoutNotifications"   BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "reviewNotifications"   BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "securityNotifications" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "systemAnnouncements"   BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "wishlistAvailable"     BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "wishlistPriceChange"   BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "wishlistSale"          BOOLEAN NOT NULL DEFAULT true;

-- --- PublishingDraft.changes NOT NULL --------------------------------------
-- Verified 0 rows in PublishingDraft, so this cannot fail on existing data.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'PublishingDraft_changes_not_null'
    ) THEN
        ALTER TABLE "PublishingDraft"
            ALTER COLUMN "changes" SET NOT NULL;
        COMMENT ON COLUMN "PublishingDraft"."changes" IS NULL;
    END IF;
END $$;


-- ============================================================================
-- PART 2 - OPTIONAL (schema bookkeeping only, no behaviour change)
--
-- These columns exist but carry a database-level DEFAULT that prisma/schema.prisma
-- does not declare. Prisma supplies the value client-side, so removing the
-- server default changes nothing at runtime. Apply only to make
-- `prisma migrate diff` report a clean, empty result.
-- ============================================================================

-- ALTER TABLE "APIDocument" ALTER COLUMN "tags" DROP DEFAULT;
-- ALTER TABLE "ArtCommissioner" ALTER COLUMN "artStyles" DROP DEFAULT,
--     ALTER COLUMN "commissionTypes" DROP DEFAULT,
--     ALTER COLUMN "portfolioImages" DROP DEFAULT,
--     ALTER COLUMN "tags" DROP DEFAULT,
--     ALTER COLUMN "categories" DROP DEFAULT;
-- ALTER TABLE "AvatarCommissioner" ALTER COLUMN "commissionTypes" DROP DEFAULT,
--     ALTER COLUMN "portfolioImages" DROP DEFAULT,
--     ALTER COLUMN "tags" DROP DEFAULT,
--     ALTER COLUMN "categories" DROP DEFAULT;
-- ALTER TABLE "CurrencyRate" ALTER COLUMN "updatedAt" DROP DEFAULT;
-- ALTER TABLE "DevelopmentServiceProvider" ALTER COLUMN "serviceTypes" DROP DEFAULT,
--     ALTER COLUMN "technologies" DROP DEFAULT,
--     ALTER COLUMN "portfolioImages" DROP DEFAULT,
--     ALTER COLUMN "tags" DROP DEFAULT,
--     ALTER COLUMN "categories" DROP DEFAULT;
-- ALTER TABLE "SeasonalTheme" ALTER COLUMN "updatedAt" DROP DEFAULT;
-- ALTER TABLE "ServiceProvider" ALTER COLUMN "tags" DROP DEFAULT,
--     ALTER COLUMN "portfolioImages" DROP DEFAULT;
-- ALTER TABLE "ThreeDServiceProvider" ALTER COLUMN "serviceTypes" DROP DEFAULT,
--     ALTER COLUMN "specializations" DROP DEFAULT,
--     ALTER COLUMN "portfolioImages" DROP DEFAULT,
--     ALTER COLUMN "tags" DROP DEFAULT,
--     ALTER COLUMN "categories" DROP DEFAULT,
--     ALTER COLUMN "software" DROP DEFAULT;
-- ALTER TABLE "TranslationKey" ALTER COLUMN "updatedAt" DROP DEFAULT;
-- ALTER TABLE "Tutorial" ALTER COLUMN "tags" DROP DEFAULT;
-- ALTER TABLE "VideoEditingServiceProvider" ALTER COLUMN "serviceTypes" DROP DEFAULT,
--     ALTER COLUMN "software" DROP DEFAULT,
--     ALTER COLUMN "portfolioImages" DROP DEFAULT,
--     ALTER COLUMN "tags" DROP DEFAULT,
--     ALTER COLUMN "categories" DROP DEFAULT;

-- Indexes declared in schema.prisma that were never created in the database.
-- CREATE INDEX IF NOT EXISTS "Announcement_isPinned_idx"    ON "Announcement"("isPinned");
-- CREATE INDEX IF NOT EXISTS "Announcement_priority_idx"    ON "Announcement"("priority");
-- CREATE INDEX IF NOT EXISTS "CurrencyRate_code_idx"        ON "CurrencyRate"("code");
-- CREATE INDEX IF NOT EXISTS "GiftCard_code_idx"            ON "GiftCard"("code");
-- CREATE INDEX IF NOT EXISTS "PrivacySettings_userId_idx"    ON "PrivacySettings"("userId");


-- ============================================================================
-- VERIFY
-- Re-run the drift check after applying. Expected: no missing model tables and
-- an empty `prisma migrate diff`.
--   node scripts/check-schema-drift.js
-- ============================================================================
