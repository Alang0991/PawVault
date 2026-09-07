-- AlterTable
ALTER TABLE "ProductMedia" ADD COLUMN "processingStatus" TEXT NOT NULL DEFAULT 'READY';
ALTER TABLE "ProductMedia" ADD COLUMN "width" INTEGER;
ALTER TABLE "ProductMedia" ADD COLUMN "height" INTEGER;
ALTER TABLE "ProductMedia" ADD COLUMN "duration" INTEGER;
ALTER TABLE "ProductMedia" ADD COLUMN "mimeType" TEXT;
ALTER TABLE "ProductMedia" ADD COLUMN "checksum" TEXT;
ALTER TABLE "ProductMedia" ADD COLUMN "thumbnailUrl" TEXT;
ALTER TABLE "ProductMedia" ADD COLUMN "blurDataUrl" TEXT;
ALTER TABLE "ProductMedia" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
