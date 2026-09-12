-- Add bundle publishing flag, item ordering, and cart bundle tracking

ALTER TABLE "Bundle" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS "Bundle_slug_key" ON "Bundle"("slug");
CREATE INDEX IF NOT EXISTS "Bundle_isPublished_idx" ON "Bundle"("isPublished");

ALTER TABLE "BundleItem" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "CartItem" ADD COLUMN "bundleId" TEXT;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_bundleId_fkey"
  FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "CartItem_bundleId_idx" ON "CartItem"("bundleId");
