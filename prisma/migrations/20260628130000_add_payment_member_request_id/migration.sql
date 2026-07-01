-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "memberRequestId" INTEGER;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_memberRequestId_fkey" FOREIGN KEY ("memberRequestId") REFERENCES "MemberRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
