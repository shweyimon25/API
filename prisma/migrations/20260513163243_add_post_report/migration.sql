/*
  Warnings:

  - You are about to drop the column `reportCategoryId` on the `PostReport` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostReport" DROP CONSTRAINT "PostReport_reportCategoryId_fkey";

-- AlterTable
ALTER TABLE "PostReport" DROP COLUMN "reportCategoryId",
ALTER COLUMN "socialPostId" DROP NOT NULL,
ALTER COLUMN "shopPostId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_PostReportToReportCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PostReportToReportCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PostReportToReportCategory_B_index" ON "_PostReportToReportCategory"("B");

-- AddForeignKey
ALTER TABLE "_PostReportToReportCategory" ADD CONSTRAINT "_PostReportToReportCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "PostReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostReportToReportCategory" ADD CONSTRAINT "_PostReportToReportCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "ReportCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
