-- Add JSON column for ordered mention member ids
ALTER TABLE "PostComment" ADD COLUMN "mentionMemberIds" JSONB NOT NULL DEFAULT '[]';

-- Migrate existing mention rows into JSON array (preserving insert order)
UPDATE "PostComment" pc
SET "mentionMemberIds" = COALESCE(
  (
    SELECT jsonb_agg(pcm."memberId" ORDER BY pcm."id")
    FROM "PostCommentMentionMember" pcm
    WHERE pcm."postCommentId" = pc."id"
  ),
  '[]'::jsonb
);

-- Drop old mention join table
ALTER TABLE "PostCommentMentionMember" DROP CONSTRAINT "PostCommentMentionMember_memberId_fkey";
ALTER TABLE "PostCommentMentionMember" DROP CONSTRAINT "PostCommentMentionMember_postCommentId_fkey";
DROP TABLE "PostCommentMentionMember";
