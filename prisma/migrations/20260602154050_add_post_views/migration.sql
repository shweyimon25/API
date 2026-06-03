-- CreateTable
CREATE TABLE "PostViews" (
    "id" SERIAL NOT NULL,
    "socialPostId" INTEGER,
    "shopPostId" INTEGER,
    "memberId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostViews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostViews" ADD CONSTRAINT "PostViews_socialPostId_fkey" FOREIGN KEY ("socialPostId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostViews" ADD CONSTRAINT "PostViews_shopPostId_fkey" FOREIGN KEY ("shopPostId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostViews" ADD CONSTRAINT "PostViews_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
