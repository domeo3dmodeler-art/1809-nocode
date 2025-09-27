/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Calculator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PriceRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quote` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Calculator" DROP CONSTRAINT "Calculator_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_productId_fkey";

-- DropForeignKey
ALTER TABLE "PriceRule" DROP CONSTRAINT "PriceRule_calculatorId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_calculatorId_fkey";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "password",
DROP COLUMN "role",
ADD COLUMN     "passwordHash" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Calculator";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Image";

-- DropTable
DROP TABLE "PriceRule";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "Quote";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "category" TEXT DEFAULT 'doors',
    "model" TEXT NOT NULL,
    "style" TEXT,
    "finish" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "rrc_price" DECIMAL(12,2),
    "model_photo" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kits" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" INTEGER,
    "price_rrc" DECIMAL(12,2),

    CONSTRAINT "kits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "supplier_name" TEXT,
    "supplier_sku" TEXT,
    "price_opt" DECIMAL(12,2),
    "price_rrc" DECIMAL(12,2),
    "price_group_multiplier" DECIMAL(8,2),

    CONSTRAINT "handles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doors_catalog" (
    "id" SERIAL NOT NULL,
    "supplierSku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "series" TEXT,
    "material" TEXT,
    "finish" TEXT,
    "color" TEXT,
    "widthMm" INTEGER,
    "heightMm" INTEGER,
    "thicknessMm" INTEGER,
    "hardwareSet" TEXT,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "validFrom" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "model" TEXT,
    "source" TEXT,

    CONSTRAINT "doors_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doors_media" (
    "id" SERIAL NOT NULL,
    "supplierSku" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "relativePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doors_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_model_idx" ON "products"("model");

-- CreateIndex
CREATE INDEX "products_style_idx" ON "products"("style");

-- CreateIndex
CREATE INDEX "products_finish_color_type_width_height_idx" ON "products"("finish", "color", "type", "width", "height");

-- CreateIndex
CREATE UNIQUE INDEX "doors_catalog_supplierSku_key" ON "doors_catalog"("supplierSku");

-- CreateIndex
CREATE INDEX "doors_catalog_supplierSku_idx" ON "doors_catalog"("supplierSku");

-- CreateIndex
CREATE INDEX "doors_catalog_isActive_series_idx" ON "doors_catalog"("isActive", "series");

-- CreateIndex
CREATE INDEX "doors_catalog_name_idx" ON "doors_catalog"("name");

-- CreateIndex
CREATE INDEX "doors_media_supplierSku_idx" ON "doors_media"("supplierSku");

-- AddForeignKey
ALTER TABLE "doors_media" ADD CONSTRAINT "doors_media_supplierSku_fkey" FOREIGN KEY ("supplierSku") REFERENCES "doors_catalog"("supplierSku") ON DELETE RESTRICT ON UPDATE CASCADE;
