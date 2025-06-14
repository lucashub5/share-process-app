/*
  Warnings:

  - You are about to drop the column `clientId` on the `processes` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `processes` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `processes` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `processes` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `processes` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `processes` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `clients` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "processes" DROP CONSTRAINT "processes_clientId_fkey";

-- AlterTable
ALTER TABLE "processes" DROP COLUMN "clientId",
DROP COLUMN "createdAt",
DROP COLUMN "createdBy",
DROP COLUMN "date",
DROP COLUMN "updatedAt",
DROP COLUMN "updatedBy";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "clients";
