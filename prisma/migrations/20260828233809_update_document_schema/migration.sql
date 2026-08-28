/*
  Warnings:

  - You are about to drop the column `metadata` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `originalName` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `storedName` on the `Document` table. All the data in the column will be lost.
  - Added the required column `fileName` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileType` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileUrl` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Document_storedName_key";

-- AlterTable
-- Step 1: Add all new columns (nullable for now to allow migration)
ALTER TABLE "Document"
ADD COLUMN     "description" TEXT,
ADD COLUMN     "extractedText" TEXT,
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processingError" TEXT,
ADD COLUMN     "title" TEXT;

-- Step 2: Migrate data from old columns to new columns
-- Use originalName as title, storedName as fileName, mimeType as fileType, size as fileSize
UPDATE "Document" SET
  "title" = "originalName",
  "fileName" = "storedName",
  "fileType" = "mimeType",
  "fileSize" = "size",
  "fileUrl" = CONCAT('https://ngz5i9qy.vercel.app/', "storedName")
WHERE "originalName" IS NOT NULL OR "storedName" IS NOT NULL;

-- Step 3: Make columns non-nullable
ALTER TABLE "Document"
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "fileName" SET NOT NULL,
ALTER COLUMN "fileType" SET NOT NULL,
ALTER COLUMN "fileSize" SET NOT NULL,
ALTER COLUMN "fileUrl" SET NOT NULL;

-- Step 4: Drop old columns
ALTER TABLE "Document" DROP COLUMN "metadata",
DROP COLUMN "mimeType",
DROP COLUMN "originalName",
DROP COLUMN "size",
DROP COLUMN "storedName";

-- CreateIndex
CREATE INDEX "Document_fileType_idx" ON "Document"("fileType");
