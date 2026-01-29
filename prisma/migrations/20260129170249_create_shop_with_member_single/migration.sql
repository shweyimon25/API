/*
  Warnings:

  - The `timeAgo` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `memberId` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Shop" DROP CONSTRAINT "Shop_memberId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "memberId" INTEGER NOT NULL,
DROP COLUMN "timeAgo",
ADD COLUMN     "timeAgo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Shop" ALTER COLUMN "memberId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
