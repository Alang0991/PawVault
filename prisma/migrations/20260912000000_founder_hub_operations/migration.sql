-- Founder Hub operational configuration: analytics, feature flags, marketplace rules, appearance, finance

-- Analytics events (page views and custom events)
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

-- Daily aggregated page view rollups for fast analytics dashboards
CREATE TABLE IF NOT EXISTS "PageViewDaily" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PageViewDaily_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PageViewDaily_path_date_key" ON "PageViewDaily"("path", "date");
CREATE INDEX IF NOT EXISTS "PageViewDaily_date_idx" ON "PageViewDaily"("date");

-- Feature flags for founder-controlled platform toggles
CREATE TABLE IF NOT EXISTS "FeatureFlag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercent" INTEGER NOT NULL DEFAULT 0,
    "targetUsers" JSONB,
    "targetRoles" JSONB,
    "environment" TEXT NOT NULL DEFAULT "production",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FeatureFlag_key_key" ON "FeatureFlag"("key");
CREATE INDEX IF NOT EXISTS "FeatureFlag_enabled_idx" ON "FeatureFlag"("enabled");
CREATE INDEX IF NOT EXISTS "FeatureFlag_environment_idx" ON "FeatureFlag"("environment");

-- Marketplace rules for listing, pricing, and moderation controls
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketplaceRule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "MarketplaceRule_ruleType_idx" ON "MarketplaceRule"("ruleType");
CREATE INDEX IF NOT EXISTS "MarketplaceRule_scope_idx" ON "MarketplaceRule"("scope");
CREATE INDEX IF NOT EXISTS "MarketplaceRule_isActive_idx" ON "MarketplaceRule"("isActive");
CREATE INDEX IF NOT EXISTS "MarketplaceRule_priority_idx" ON "MarketplaceRule"("priority");

-- Singleton appearance configuration for the public site
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AppearanceConfig_pkey" PRIMARY KEY ("id")
);

-- Singleton finance configuration for platform fee and payout rules
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinanceConfig_pkey" PRIMARY KEY ("id")
);

-- Seed default singleton rows so reads never miss
INSERT INTO "AppearanceConfig" ("id", "createdAt", "updatedAt")
SELECT 'singleton', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "AppearanceConfig" WHERE "id" = 'singleton');

INSERT INTO "FinanceConfig" ("id", "createdAt", "updatedAt")
SELECT 'singleton', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "FinanceConfig" WHERE "id" = 'singleton');