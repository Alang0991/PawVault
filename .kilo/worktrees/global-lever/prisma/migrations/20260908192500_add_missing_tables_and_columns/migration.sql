-- Add missing columns to ProductVersion
ALTER TABLE "ProductVersion" ADD COLUMN IF NOT EXISTS "isCurrent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProductVersion" ADD COLUMN IF NOT EXISTS "isPrerelease" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: Announcement
CREATE TABLE IF NOT EXISTS "Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Announcement_isPublished_idx" ON "Announcement"("isPublished");
CREATE INDEX IF NOT EXISTS "Announcement_publishedAt_idx" ON "Announcement"("publishedAt");

-- CreateTable: SiteSetting
CREATE TABLE IF NOT EXISTS "SiteSetting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT
);

-- CreateTable: ModerationNote
CREATE TABLE IF NOT EXISTS "ModerationNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT,
    "productId" TEXT,
    "userId" TEXT,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ModerationNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ModerationNote_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ModerationNote_reportId_idx" ON "ModerationNote"("reportId");
CREATE INDEX IF NOT EXISTS "ModerationNote_productId_idx" ON "ModerationNote"("productId");
CREATE INDEX IF NOT EXISTS "ModerationNote_userId_idx" ON "ModerationNote"("userId");
