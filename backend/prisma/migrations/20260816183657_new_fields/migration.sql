/*
  Warnings:

  - Added the required column `categoryName` to the `SaleItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_productId_fkey";

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "categoryName" TEXT NOT NULL,
ADD COLUMN     "productName" TEXT NOT NULL,
ALTER COLUMN "productId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
