-- Add missing enums if they do not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductStatus') THEN
    CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'HIDDEN', 'ARCHIVED', 'REJECTED', 'SUSPENDED', 'CHANGES_REQUESTED', 'REMOVED');
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CreatorStatus') THEN
    CREATE TYPE "CreatorStatus" AS ENUM ('NONE', 'APPLICATION_DRAFT', 'APPLICATION_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED', 'BANNED', 'WITHDRAWN');
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserStatus') THEN
    CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StoreVisibility') THEN
    CREATE TYPE "StoreVisibility" AS ENUM ('PUBLISHED', 'HIDDEN', 'SUSPENDED', 'ARCHIVED');
  END IF;
END;
$$;

-- User missing columns
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "suspendedUntil" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "suspendedReason" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bannedReason" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "customPermissions" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creatorStatus" "CreatorStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creatorTermsAcceptedAt" TIMESTAMP(3);

-- Store missing column
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "visibility" "StoreVisibility" NOT NULL DEFAULT 'PUBLISHED';

-- Product missing columns
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "contentRating" "ContentRating" NOT NULL DEFAULT 'SFW';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT';

-- ProductFile missing columns
ALTER TABLE "ProductFile" ADD COLUMN IF NOT EXISTS "folder" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ProductFile" ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
ALTER TABLE "ProductFile" ADD COLUMN IF NOT EXISTS "checksum" TEXT;
ALTER TABLE "ProductFile" ADD COLUMN IF NOT EXISTS "downloadCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProductFile" ADD COLUMN IF NOT EXISTS "lastDownloadedAt" TIMESTAMP(3);
ALTER TABLE "ProductFile" ADD COLUMN IF NOT EXISTS "processingStatus" TEXT NOT NULL DEFAULT 'READY';

-- CreateTable: StaffPick
CREATE TABLE IF NOT EXISTS "StaffPick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "pickedBy" TEXT NOT NULL,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StaffPick_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StaffPick_pickedBy_fkey" FOREIGN KEY ("pickedBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: PromotedProduct
CREATE TABLE IF NOT EXISTS "PromotedProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "stripeAccountId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PromotedProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PromotedProduct_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: CreatorAllocation
CREATE TABLE IF NOT EXISTS "CreatorAllocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "grossAmount" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "transferId" TEXT,
    "payoutId" TEXT,
    "isReversed" BOOLEAN NOT NULL DEFAULT false,
    "reversedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CreatorAllocation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreatorAllocation_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreatorAllocation_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreatorAllocation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: UserModeration
CREATE TABLE IF NOT EXISTS "UserModeration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserModeration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserModeration_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: ProductModeration
CREATE TABLE IF NOT EXISTS "ProductModeration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductModeration_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductModeration_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: CreatorApplication
CREATE TABLE IF NOT EXISTS "CreatorApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "website" TEXT,
    "socialLinks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CreatorApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreatorApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: CreatorTerms
CREATE TABLE IF NOT EXISTS "CreatorTerms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "version" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    CONSTRAINT "CreatorTerms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: Appeal
CREATE TABLE IF NOT EXISTS "Appeal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "evidence" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Appeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appeal_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: FeedbackPost
CREATE TABLE IF NOT EXISTS "FeedbackPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "votes" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "duplicateOf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FeedbackPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: FeedbackVote
CREATE TABLE IF NOT EXISTS "FeedbackVote" (
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedbackVote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "FeedbackPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeedbackVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("postId", "userId")
);

-- CreateTable: FeedbackComment
CREATE TABLE IF NOT EXISTS "FeedbackComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedbackComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "FeedbackPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeedbackComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: RoadmapItem
CREATE TABLE IF NOT EXISTS "RoadmapItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "feedbackId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RoadmapItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: ChangelogEntry
CREATE TABLE IF NOT EXISTS "ChangelogEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT,
    "feedbackId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChangelogEntry_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: EmailTemplate
CREATE TABLE IF NOT EXISTS "EmailTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "version" INTEGER NOT NULL DEFAULT 1,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "subject" TEXT NOT NULL,
    "htmlBody" TEXT NOT NULL,
    "textBody" TEXT,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable: EmailMessage
CREATE TABLE IF NOT EXISTS "EmailMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "toEmail" TEXT NOT NULL,
    "toUserId" TEXT,
    "templateKey" TEXT NOT NULL,
    "templateVersion" INTEGER,
    "payload" JSONB,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "providerMessageId" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "idempotencyKey" TEXT UNIQUE,
    CONSTRAINT "EmailMessage_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: EmailPreference
CREATE TABLE IF NOT EXISTS "EmailPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "security" BOOLEAN NOT NULL DEFAULT true,
    "account" BOOLEAN NOT NULL DEFAULT true,
    "orders" BOOLEAN NOT NULL DEFAULT true,
    "refunds" BOOLEAN NOT NULL DEFAULT true,
    "support" BOOLEAN NOT NULL DEFAULT true,
    "moderation" BOOLEAN NOT NULL DEFAULT true,
    "productUpdates" BOOLEAN NOT NULL DEFAULT true,
    "followedCreators" BOOLEAN NOT NULL DEFAULT false,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: UploadSession
CREATE TABLE IF NOT EXISTS "UploadSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "folder" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "chunkSize" INTEGER NOT NULL DEFAULT 5242880,
    "uploadedBytes" INTEGER NOT NULL DEFAULT 0,
    "completedKey" TEXT,
    "completedUrl" TEXT,
    "completedSize" INTEGER,
    "completedMimeType" TEXT,
    "checksum" TEXT,
    "validationError" TEXT,
    "processingError" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UploadSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: MediaProcessingJob
CREATE TABLE IF NOT EXISTS "MediaProcessingJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mediaId" TEXT,
    "fileId" TEXT,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "inputKey" TEXT NOT NULL,
    "outputKey" TEXT,
    "inputSize" INTEGER,
    "outputSize" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "checksum" TEXT,
    "thumbnailUrl" TEXT,
    "blurDataUrl" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MediaProcessingJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MediaProcessingJob_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "ProductMedia" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MediaProcessingJob_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "ProductFile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StaffPick_productId_idx" ON "StaffPick"("productId");
CREATE INDEX IF NOT EXISTS "StaffPick_pickedBy_idx" ON "StaffPick"("pickedBy");
CREATE UNIQUE INDEX IF NOT EXISTS "StaffPick_productId_pickedBy_key" ON "StaffPick"("productId", "pickedBy");

CREATE INDEX IF NOT EXISTS "PromotedProduct_productId_idx" ON "PromotedProduct"("productId");
CREATE INDEX IF NOT EXISTS "PromotedProduct_creatorId_idx" ON "PromotedProduct"("creatorId");
CREATE INDEX IF NOT EXISTS "PromotedProduct_status_idx" ON "PromotedProduct"("status");

CREATE UNIQUE INDEX IF NOT EXISTS "CreatorAllocation_orderItemId_key" ON "CreatorAllocation"("orderItemId");
CREATE INDEX IF NOT EXISTS "CreatorAllocation_orderId_idx" ON "CreatorAllocation"("orderId");
CREATE INDEX IF NOT EXISTS "CreatorAllocation_creatorId_idx" ON "CreatorAllocation"("creatorId");
CREATE INDEX IF NOT EXISTS "CreatorAllocation_productId_idx" ON "CreatorAllocation"("productId");
CREATE INDEX IF NOT EXISTS "CreatorAllocation_isReversed_idx" ON "CreatorAllocation"("isReversed");

CREATE INDEX IF NOT EXISTS "UserModeration_userId_idx" ON "UserModeration"("userId");
CREATE INDEX IF NOT EXISTS "UserModeration_actorId_idx" ON "UserModeration"("actorId");

CREATE INDEX IF NOT EXISTS "ProductModeration_productId_idx" ON "ProductModeration"("productId");
CREATE INDEX IF NOT EXISTS "ProductModeration_actorId_idx" ON "ProductModeration"("actorId");

CREATE INDEX IF NOT EXISTS "CreatorApplication_status_idx" ON "CreatorApplication"("status");
CREATE INDEX IF NOT EXISTS "CreatorApplication_userId_idx" ON "CreatorApplication"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "CreatorTerms_userId_key" ON "CreatorTerms"("userId");

CREATE INDEX IF NOT EXISTS "Appeal_userId_idx" ON "Appeal"("userId");
CREATE INDEX IF NOT EXISTS "Appeal_status_idx" ON "Appeal"("status");

CREATE INDEX IF NOT EXISTS "FeedbackPost_userId_idx" ON "FeedbackPost"("userId");
CREATE INDEX IF NOT EXISTS "FeedbackPost_status_idx" ON "FeedbackPost"("status");

CREATE INDEX IF NOT EXISTS "RoadmapItem_status_idx" ON "RoadmapItem"("status");
CREATE INDEX IF NOT EXISTS "RoadmapItem_priority_idx" ON "RoadmapItem"("priority");

CREATE UNIQUE INDEX IF NOT EXISTS "EmailTemplate_key_key" ON "EmailTemplate"("key");
CREATE INDEX IF NOT EXISTS "EmailTemplate_key_idx" ON "EmailTemplate"("key");

CREATE INDEX IF NOT EXISTS "EmailMessage_status_idx" ON "EmailMessage"("status");
CREATE INDEX IF NOT EXISTS "EmailMessage_toUserId_idx" ON "EmailMessage"("toUserId");
CREATE UNIQUE INDEX IF NOT EXISTS "EmailMessage_idempotencyKey_key" ON "EmailMessage"("idempotencyKey");

CREATE INDEX IF NOT EXISTS "EmailPreference_userId_idx" ON "EmailPreference"("userId");

CREATE INDEX IF NOT EXISTS "UploadSession_userId_idx" ON "UploadSession"("userId");
CREATE INDEX IF NOT EXISTS "UploadSession_entityType_entityId_idx" ON "UploadSession"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "UploadSession_status_idx" ON "UploadSession"("status");

CREATE INDEX IF NOT EXISTS "MediaProcessingJob_userId_idx" ON "MediaProcessingJob"("userId");
CREATE INDEX IF NOT EXISTS "MediaProcessingJob_mediaId_idx" ON "MediaProcessingJob"("mediaId");
CREATE INDEX IF NOT EXISTS "MediaProcessingJob_fileId_idx" ON "MediaProcessingJob"("fileId");
CREATE INDEX IF NOT EXISTS "MediaProcessingJob_status_idx" ON "MediaProcessingJob"("status");

-- User columns indexes
CREATE INDEX IF NOT EXISTS "User_status_idx" ON "User"("status");
CREATE INDEX IF NOT EXISTS "User_creatorStatus_idx" ON "User"("creatorStatus");

-- Product columns indexes
CREATE INDEX IF NOT EXISTS "Product_status_idx" ON "Product"("status");
CREATE INDEX IF NOT EXISTS "Product_contentRating_idx" ON "Product"("contentRating");
