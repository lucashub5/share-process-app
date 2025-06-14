/*
  Warnings:

  - You are about to drop the column `createdAt` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `processes` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `processes` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `processes` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `processes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clients" DROP COLUMN "createdAt",
DROP COLUMN "createdBy",
DROP COLUMN "updatedAt",
DROP COLUMN "updatedBy";

-- AlterTable
ALTER TABLE "processes" DROP COLUMN "createdAt",
DROP COLUMN "createdBy",
DROP COLUMN "updatedAt",
DROP COLUMN "updatedBy";
