-- CreateTable
CREATE TABLE "PostCommentMentionMember" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "postCommentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostCommentMentionMember_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostCommentMentionMember" ADD CONSTRAINT "PostCommentMentionMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCommentMentionMember" ADD CONSTRAINT "PostCommentMentionMember_postCommentId_fkey" FOREIGN KEY ("postCommentId") REFERENCES "PostComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
