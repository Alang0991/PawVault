-- Fix: Add missing User columns that exist in schema.prisma but not in production DB.
-- Safe & additive: all columns are nullable or have safe defaults. No data is modified or lost.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accentColor" TEXT DEFAULT '#8B5CF6';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfaSecret" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfaEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfaBackupCodes" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "reduceMotion" BOOLEAN NOT NULL DEFAULT false;
