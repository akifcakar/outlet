/*
  Warnings:

  - Added the required column `deliveryAddress` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "itemPriceKurus" INTEGER NOT NULL,
    "shippingKurus" INTEGER NOT NULL,
    "totalKurus" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_payment',
    "deliveryAddress" TEXT NOT NULL,
    "guestSessionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("buyerId", "createdAt", "id", "itemPriceKurus", "listingId", "sellerId", "shippingKurus", "status", "totalKurus") SELECT "buyerId", "createdAt", "id", "itemPriceKurus", "listingId", "sellerId", "shippingKurus", "status", "totalKurus" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE INDEX "Order_guestSessionId_idx" ON "Order"("guestSessionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
