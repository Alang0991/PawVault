-- Add localization and display preference columns to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'en';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "theme" TEXT NOT NULL DEFAULT 'system';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accentColor" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "reduceMotion" BOOLEAN NOT NULL DEFAULT false;

-- Create CurrencyRate table
CREATE TABLE IF NOT EXISTS "CurrencyRate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimalDigits" INTEGER NOT NULL DEFAULT 2,
    "rateToBase" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CurrencyRate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CurrencyRate_code_key" ON "CurrencyRate"("code");
CREATE INDEX IF NOT EXISTS "CurrencyRate_isEnabled_idx" ON "CurrencyRate"("isEnabled");

-- Create SeasonalTheme table
CREATE TABLE IF NOT EXISTS "SeasonalTheme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "config" JSONB,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SeasonalTheme_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SeasonalTheme_slug_key" ON "SeasonalTheme"("slug");
CREATE INDEX IF NOT EXISTS "SeasonalTheme_isEnabled_startDate_endDate_idx" ON "SeasonalTheme"("isEnabled", "startDate", "endDate");
CREATE INDEX IF NOT EXISTS "SeasonalTheme_displayOrder_idx" ON "SeasonalTheme"("displayOrder");

-- Seed default currency rates
INSERT INTO "CurrencyRate" ("id", "code", "name", "symbol", "decimalDigits", "rateToBase", "isEnabled", "updatedAt")
SELECT gen_random_uuid()::text, 'USD', 'US Dollar', '$', 2, 1, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CurrencyRate" WHERE "code" = 'USD');
INSERT INTO "CurrencyRate" ("id", "code", "name", "symbol", "decimalDigits", "rateToBase", "isEnabled", "updatedAt")
SELECT gen_random_uuid()::text, 'EUR', 'Euro', '€', 2, 1.08, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CurrencyRate" WHERE "code" = 'EUR');
INSERT INTO "CurrencyRate" ("id", "code", "name", "symbol", "decimalDigits", "rateToBase", "isEnabled", "updatedAt")
SELECT gen_random_uuid()::text, 'GBP', 'British Pound', '£', 2, 1.27, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CurrencyRate" WHERE "code" = 'GBP');
INSERT INTO "CurrencyRate" ("id", "code", "name", "symbol", "decimalDigits", "rateToBase", "isEnabled", "updatedAt")
SELECT gen_random_uuid()::text, 'JPY', 'Japanese Yen', '¥', 0, 149.0, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CurrencyRate" WHERE "code" = 'JPY');
INSERT INTO "CurrencyRate" ("id", "code", "name", "symbol", "decimalDigits", "rateToBase", "isEnabled", "updatedAt")
SELECT gen_random_uuid()::text, 'CAD', 'Canadian Dollar', 'CA$', 2, 1.36, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CurrencyRate" WHERE "code" = 'CAD');
INSERT INTO "CurrencyRate" ("id", "code", "name", "symbol", "decimalDigits", "rateToBase", "isEnabled", "updatedAt")
SELECT gen_random_uuid()::text, 'AUD', 'Australian Dollar', 'A$', 2, 1.52, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CurrencyRate" WHERE "code" = 'AUD');
INSERT INTO "CurrencyRate" ("id", "code", "name", "symbol", "decimalDigits", "rateToBase", "isEnabled", "updatedAt")
SELECT gen_random_uuid()::text, 'KRW', 'South Korean Won', '₩', 0, 1330.0, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CurrencyRate" WHERE "code" = 'KRW');
INSERT INTO "CurrencyRate" ("id", "code", "name", "symbol", "decimalDigits", "rateToBase", "isEnabled", "updatedAt")
SELECT gen_random_uuid()::text, 'CNY', 'Chinese Yuan', '¥', 2, 7.2, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CurrencyRate" WHERE "code" = 'CNY');
INSERT INTO "CurrencyRate" ("id", "code", "name", "symbol", "decimalDigits", "rateToBase", "isEnabled", "updatedAt")
SELECT gen_random_uuid()::text, 'CHF', 'Swiss Franc', 'CHF', 2, 0.88, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CurrencyRate" WHERE "code" = 'CHF');
INSERT INTO "CurrencyRate" ("id", "code", "name", "symbol", "decimalDigits", "rateToBase", "isEnabled", "updatedAt")
SELECT gen_random_uuid()::text, 'INR', 'Indian Rupee', '₹', 2, 83.0, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CurrencyRate" WHERE "code" = 'INR');
INSERT INTO "CurrencyRate" ("id", "code", "name", "symbol", "decimalDigits", "rateToBase", "isEnabled", "updatedAt")
SELECT gen_random_uuid()::text, 'BRL', 'Brazilian Real', 'R$', 2, 5.1, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CurrencyRate" WHERE "code" = 'BRL');
INSERT INTO "CurrencyRate" ("id", "code", "name", "symbol", "decimalDigits", "rateToBase", "isEnabled", "updatedAt")
SELECT gen_random_uuid()::text, 'MXN', 'Mexican Peso', '$', 2, 16.8, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CurrencyRate" WHERE "code" = 'MXN');

-- Seed a New Year seasonal theme as an example custom theme
INSERT INTO "SeasonalTheme" ("id", "name", "slug", "description", "isEnabled", "config", "displayOrder", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'New Year', 'new-year', 'New Year celebration theme', false, '{"effects":[{"id":"confetti","name":"Fireworks","density":"heavy"}],"colors":{"primary":"#FBBF24"}}', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "SeasonalTheme" WHERE "slug" = 'new-year');

-- Create TranslationKey table for founder-managed translations
CREATE TABLE IF NOT EXISTS "TranslationKey" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TranslationKey_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "TranslationKey_locale_namespace_key_key" ON "TranslationKey"("locale", "namespace", "key");
CREATE INDEX IF NOT EXISTS "TranslationKey_locale_idx" ON "TranslationKey"("locale");
CREATE INDEX IF NOT EXISTS "TranslationKey_namespace_idx" ON "TranslationKey"("namespace");
