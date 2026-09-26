-- DropForeignKey
ALTER TABLE "CreatorAllocation" DROP CONSTRAINT "CreatorAllocation_productId_fkey";

-- DropForeignKey
ALTER TABLE "ModerationNote" DROP CONSTRAINT "ModerationNote_reportId_fkey";

-- DropIndex
DROP INDEX "Announcement_authorId_idx";

-- DropIndex
DROP INDEX "Announcement_createdAt_idx";

-- DropIndex
DROP INDEX "License_currentVersion_idx";

-- DropIndex
DROP INDEX "License_lastAccessedAt_idx";

-- DropIndex
DROP INDEX "ModerationNote_authorId_idx";

-- DropIndex
DROP INDEX "Product_contentRating_idx";

-- DropIndex
DROP INDEX "ProductFile_folder_idx";

-- DropIndex
DROP INDEX "StaffPick_pickedBy_idx";

-- DropIndex
DROP INDEX "User_creatorStatus_idx";

-- DropIndex
DROP INDEX "User_isInternal_idx";

-- DropIndex
DROP INDEX "User_status_idx";

-- AlterTable
ALTER TABLE "Announcement" ALTER COLUMN "publishedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Appeal" ALTER COLUMN "reviewedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Bundle" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Collection" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Coupon" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "minPurchase" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "CreatorApplication" ALTER COLUMN "reviewedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CreatorTerms" ALTER COLUMN "acceptedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Discount" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "MediaProcessingJob" ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "progress" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ModerationNote" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "total" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Payout" ADD COLUMN     "availableAt" TIMESTAMP(3),
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "stripePayoutId" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "salePrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "wholesalePrice" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ProductFile" ALTER COLUMN "folder" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProductMedia" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProductModeration" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ProductVersion" ADD COLUMN     "isCurrent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPrerelease" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Refund" ADD COLUMN     "isPartial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "itemIds" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SiteSetting" ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TaxRecord" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "rating" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "isFeatured" SET NOT NULL,
ALTER COLUMN "suspendedUntil" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "creatorTermsAcceptedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserModeration" ALTER COLUMN "expiresAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "StripeTransfer" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "paymentId" TEXT,
    "stripeTransferId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeTransfer_stripeTransferId_key" ON "StripeTransfer"("stripeTransferId");

-- CreateIndex
CREATE INDEX "StripeTransfer_orderId_idx" ON "StripeTransfer"("orderId");

-- CreateIndex
CREATE INDEX "StripeTransfer_creatorId_idx" ON "StripeTransfer"("creatorId");

-- CreateIndex
CREATE INDEX "StripeTransfer_stripeTransferId_idx" ON "StripeTransfer"("stripeTransferId");

-- CreateIndex
CREATE INDEX "StripeTransfer_status_idx" ON "StripeTransfer"("status");

-- CreateIndex
CREATE INDEX "Announcement_isPublished_idx" ON "Announcement"("isPublished");

-- CreateIndex
CREATE INDEX "Announcement_publishedAt_idx" ON "Announcement"("publishedAt");

-- CreateIndex
CREATE INDEX "CreatorAllocation_transferId_idx" ON "CreatorAllocation"("transferId");

-- CreateIndex
CREATE INDEX "CreatorAllocation_payoutId_idx" ON "CreatorAllocation"("payoutId");

-- CreateIndex
CREATE INDEX "EmailMessage_scheduledAt_idx" ON "EmailMessage"("scheduledAt");

-- CreateIndex
CREATE INDEX "EmailMessage_idempotencyKey_idx" ON "EmailMessage"("idempotencyKey");

-- CreateIndex
CREATE INDEX "EmailTemplate_category_idx" ON "EmailTemplate"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_stripePayoutId_key" ON "Payout"("stripePayoutId");

-- CreateIndex
CREATE INDEX "Payout_stripePayoutId_idx" ON "Payout"("stripePayoutId");

-- CreateIndex
CREATE INDEX "ProductFile_productId_folder_idx" ON "ProductFile"("productId", "folder");

-- CreateIndex
CREATE INDEX "StaffPick_isActive_idx" ON "StaffPick"("isActive");

-- AddForeignKey
ALTER TABLE "ProductVersion" ADD CONSTRAINT "ProductVersion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeTransfer" ADD CONSTRAINT "StripeTransfer_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeTransfer" ADD CONSTRAINT "StripeTransfer_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeTransfer" ADD CONSTRAINT "StripeTransfer_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorAllocation" ADD CONSTRAINT "CreatorAllocation_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "StripeTransfer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorAllocation" ADD CONSTRAINT "CreatorAllocation_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationNote" ADD CONSTRAINT "ModerationNote_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorTerms" ADD CONSTRAINT "CreatorTerms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackPost" ADD CONSTRAINT "FeedbackPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_templateKey_fkey" FOREIGN KEY ("templateKey") REFERENCES "EmailTemplate"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
