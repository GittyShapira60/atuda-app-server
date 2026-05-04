/*
  Warnings:

  - The primary key for the `RequestType` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_request_type_id_fkey";

-- AlterTable
ALTER TABLE "Request" ALTER COLUMN "request_type_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "RequestType" DROP CONSTRAINT "RequestType_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "RequestType_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_request_type_id_fkey" FOREIGN KEY ("request_type_id") REFERENCES "RequestType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
