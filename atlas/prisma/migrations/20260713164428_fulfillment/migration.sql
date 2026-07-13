-- AlterTable
ALTER TABLE "Order" ADD COLUMN "completedAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "gradeMatched" BOOLEAN;
ALTER TABLE "Order" ADD COLUMN "shippedAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "trackingNo" TEXT;
