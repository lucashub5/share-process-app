-- CreateEnum
CREATE TYPE "ProcessType" AS ENUM ('file', 'folder');

-- AlterTable
ALTER TABLE "processes" ADD COLUMN     "type" "ProcessType" NOT NULL DEFAULT 'folder';
