/*
  Warnings:

  - Made the column `code` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "achievements" TEXT,
    "nextPlans" TEXT,
    "remark" TEXT,
    "department" TEXT,
    "keyProjects" TEXT,
    "projectPhase" TEXT,
    "objectives" TEXT,
    "keyResults" TEXT,
    "rag" TEXT,
    "risk" TEXT,
    "strategicAlignment" TEXT,
    "currentStatus" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "stage" TEXT NOT NULL DEFAULT 'INITIATION',
    "totalPercentage" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Project" ("achievements", "code", "createdAt", "currentStatus", "department", "id", "keyProjects", "keyResults", "name", "nextPlans", "objectives", "projectPhase", "rag", "remark", "risk", "stage", "strategicAlignment", "updatedAt") SELECT "achievements", "code", "createdAt", "currentStatus", "department", "id", "keyProjects", "keyResults", "name", "nextPlans", "objectives", "projectPhase", "rag", "remark", "risk", "stage", "strategicAlignment", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
