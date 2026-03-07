-- CreateTable
CREATE TABLE "PostCommentReaction" (
    "id" SERIAL NOT NULL,
    "postCommentId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "reaction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostCommentReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostCommentReaction_postCommentId_memberId_key" ON "PostCommentReaction"("postCommentId", "memberId");

-- AddForeignKey
ALTER TABLE "PostCommentReaction" ADD CONSTRAINT "PostCommentReaction_postCommentId_fkey" FOREIGN KEY ("postCommentId") REFERENCES "PostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCommentReaction" ADD CONSTRAINT "PostCommentReaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
