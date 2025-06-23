/*
  Warnings:

  - You are about to drop the column `image` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Client" DROP COLUMN "image",
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "imageUrl" TEXT;
