-- DropForeignKey
ALTER TABLE "PostReport" DROP CONSTRAINT "PostReport_memberId_fkey";

-- AlterTable
ALTER TABLE "PostReport" ALTER COLUMN "memberId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PostReport" ADD CONSTRAINT "PostReport_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
