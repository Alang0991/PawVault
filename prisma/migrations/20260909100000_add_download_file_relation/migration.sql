-- Add Download -> ProductFile relation

ALTER TABLE "Download" ADD CONSTRAINT "Download_fileId_fkey"
  FOREIGN KEY ("fileId") REFERENCES "ProductFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "Download_fileId_idx" ON "Download"("fileId");
