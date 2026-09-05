-- Phase 6: Orders + Licenses + Customer Library

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'REVOKED', 'REFUNDED', 'DISPUTED', 'SUSPENDED');

-- AlterTable: License
ALTER TABLE "License" 
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "LicenseStatus" USING "status"::"LicenseStatus",
  ALTER COLUMN "status" SET DEFAULT 'ACTIVE',
  ADD COLUMN "currentVersion" TEXT,
  ADD COLUMN "lastAccessedAt" TIMESTAMP(3),
  ADD COLUMN "refundedAt" TIMESTAMP(3),
  ADD COLUMN "disputedAt" TIMESTAMP(3),
  ADD COLUMN "suspendedAt" TIMESTAMP(3);

-- AlterTable: OrderItem
ALTER TABLE "OrderItem" 
  ADD COLUMN "productTitleSnapshot" TEXT,
  ADD COLUMN "productSlugSnapshot" TEXT,
  ADD COLUMN "productVersionSnapshot" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "License_userId_productId_key" ON "License"("userId", "productId");
CREATE INDEX "License_currentVersion_idx" ON "License"("currentVersion");
CREATE INDEX "License_lastAccessedAt_idx" ON "License"("lastAccessedAt");

-- Update existing licenses to ACTIVE enum
UPDATE "License" SET "status" = 'ACTIVE' WHERE "status" = 'ACTIVE';
UPDATE "License" SET "status" = 'REVOKED' WHERE "status" = 'REVOKED';
UPDATE "License" SET "status" = 'REFUNDED' WHERE "status" = 'REFUNDED';
UPDATE "License" SET "status" = 'DISPUTED' WHERE "status" = 'DISPUTED';
UPDATE "License" SET "status" = 'SUSPENDED' WHERE "status" = 'SUSPENDED';