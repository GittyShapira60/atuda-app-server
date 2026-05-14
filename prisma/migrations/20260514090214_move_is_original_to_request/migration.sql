/*
  Warnings:

  - You are about to drop the column `Is_Original` on the `RequestType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "Is_Original" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "RequestType" DROP COLUMN "Is_Original";
