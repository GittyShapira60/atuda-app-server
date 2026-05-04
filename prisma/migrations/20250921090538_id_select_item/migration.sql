/*
  Warnings:

  - Added the required column `id` to the `selectItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "selectItem" ADD COLUMN     "id" TEXT NOT NULL;
