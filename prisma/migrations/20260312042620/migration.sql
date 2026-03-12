-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "bodyGoalId" INTEGER,
ADD COLUMN     "proficientLevelId" INTEGER;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_bodyGoalId_fkey" FOREIGN KEY ("bodyGoalId") REFERENCES "BodyGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_proficientLevelId_fkey" FOREIGN KEY ("proficientLevelId") REFERENCES "ProficientLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
