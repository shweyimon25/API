-- RenameTable
ALTER TABLE "deliveriable" RENAME TO "Task";

-- RenameColumn
ALTER TABLE "Task" RENAME COLUMN "deliverable" TO "name";
