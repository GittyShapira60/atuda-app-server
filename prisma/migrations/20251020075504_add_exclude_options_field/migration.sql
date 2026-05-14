-- AlterTable
ALTER TABLE "RequestType" ADD COLUMN     "excludeReasons" TEXT[] DEFAULT ARRAY[]::TEXT[];
