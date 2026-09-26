-- Phase 7B: Collections + Storefront Foundation

-- Add isPublic and updatedAt to Collection
ALTER TABLE "Collection" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE "Collection" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
