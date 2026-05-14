-- CreateTable
CREATE TABLE "RequestType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "stages_flow" JSONB NOT NULL,
    "declaration_text" TEXT NOT NULL,

    CONSTRAINT "RequestType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "key" TEXT NOT NULL,
    "header" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "schema" JSONB,
    "options" JSONB,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "selectItem" (
    "list_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "selectItem_pkey" PRIMARY KEY ("name","list_name")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "request_type_id" INTEGER NOT NULL,
    "user_identity" TEXT NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "last_change_status" TIMESTAMP(3) NOT NULL,
    "was_sent" BOOLEAN NOT NULL DEFAULT false,
    "was_received" BOOLEAN NOT NULL DEFAULT false,
    "amount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestDetails" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "data" TEXT,

    CONSTRAINT "RequestDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stage_key_key" ON "Stage"("key");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_request_type_id_fkey" FOREIGN KEY ("request_type_id") REFERENCES "RequestType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDetails" ADD CONSTRAINT "RequestDetails_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
