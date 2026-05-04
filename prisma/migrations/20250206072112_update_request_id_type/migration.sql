/*
  Warnings:

  - The primary key for the `Request` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "RequestDetails" DROP CONSTRAINT "RequestDetails_request_id_fkey";

-- AlterTable
ALTER TABLE "Request" DROP CONSTRAINT "Request_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Request_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Request_id_seq";

-- AlterTable
ALTER TABLE "RequestDetails" ALTER COLUMN "request_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "RequestType" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "RequestType_id_seq";

-- AddForeignKey
ALTER TABLE "RequestDetails" ADD CONSTRAINT "RequestDetails_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
