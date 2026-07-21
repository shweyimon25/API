-- AlterTable
ALTER TABLE "PostReaction" ADD COLUMN "reaction" TEXT,
ADD COLUMN "type" TEXT;

-- Backfill existing rows
UPDATE "PostReaction" pr
SET
  "reaction" = COALESCE(pr."reaction", '👍'),
  "type" = COALESCE(
    pr."type",
    CASE
      WHEN p."shopId" IS NULL THEN 'social'
      ELSE 'shop'
    END
  )
FROM "Post" p
WHERE pr."postId" = p."id";

-- Set NOT NULL after backfill
ALTER TABLE "PostReaction"
ALTER COLUMN "reaction" SET NOT NULL,
ALTER COLUMN "type" SET NOT NULL;
