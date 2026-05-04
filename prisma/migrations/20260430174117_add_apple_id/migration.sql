/*
  Warnings:

  - A unique constraint covering the columns `[appleId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "appleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Member_appleId_key" ON "Member"("appleId");
