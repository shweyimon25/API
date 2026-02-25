-- AlterEnum
ALTER TYPE "ConversationType" ADD VALUE 'TRAINER_GROUP';

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "bodyGoalId" INTEGER,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "memberPlanId" INTEGER,
ADD COLUMN     "proficientLevelId" INTEGER;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_memberPlanId_fkey" FOREIGN KEY ("memberPlanId") REFERENCES "MemberPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_proficientLevelId_fkey" FOREIGN KEY ("proficientLevelId") REFERENCES "ProficientLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_bodyGoalId_fkey" FOREIGN KEY ("bodyGoalId") REFERENCES "BodyGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
