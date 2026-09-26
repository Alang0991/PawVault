ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isInternal" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "User_isInternal_idx" ON "User"("isInternal");
