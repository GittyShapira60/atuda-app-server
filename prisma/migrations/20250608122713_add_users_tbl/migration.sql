-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "tz" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_tz_key" ON "Users"("tz");
