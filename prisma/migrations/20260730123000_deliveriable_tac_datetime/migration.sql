-- RedefineTable
CREATE TABLE "new_deliveriable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deliverable" TEXT NOT NULL,
    "tac" DATETIME NOT NULL,
    "completedPercentage" REAL NOT NULL DEFAULT 0,
    "projectId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "deliveriable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_deliveriable" ("id", "deliverable", "tac", "completedPercentage", "projectId", "status", "createdAt", "updatedAt")
SELECT
    "id",
    "deliverable",
    CASE
        WHEN typeof("tac") = 'text'
            AND length("tac") >= 10
            AND substr("tac", 5, 1) = '-'
            AND substr("tac", 8, 1) = '-'
            AND date("tac") IS NOT NULL
        THEN datetime("tac")
        ELSE CURRENT_TIMESTAMP
    END,
    "completedPercentage",
    "projectId",
    "status",
    "createdAt",
    "updatedAt"
FROM "deliveriable";

DROP TABLE "deliveriable";
ALTER TABLE "new_deliveriable" RENAME TO "deliveriable";
