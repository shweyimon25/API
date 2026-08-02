-- Normalize existing free-text RAG values to Rag enum values.
UPDATE "Project"
SET "rag" = CASE
  WHEN lower("rag") IN ('red') THEN 'RED'
  WHEN lower("rag") IN ('amber', 'yellow', 'orange') THEN 'AMBER'
  WHEN lower("rag") IN ('green') THEN 'GREEN'
  WHEN "rag" IN ('RED', 'AMBER', 'GREEN') THEN "rag"
  ELSE NULL
END
WHERE "rag" IS NOT NULL;
