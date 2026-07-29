-- AlterTable
ALTER TABLE "Project" ADD COLUMN "code" TEXT;

-- Backfill existing projects
UPDATE "Project"
SET "code" = 'PMO' || printf('%04d', (
  SELECT COUNT(*)
  FROM "Project" AS p2
  WHERE p2.id <= "Project".id
))
WHERE "code" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");
