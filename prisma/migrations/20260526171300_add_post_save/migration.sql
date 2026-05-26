-- CreateTable
CREATE TABLE "PostSave" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "socialPostId" INTEGER,
    "shopPostId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostSave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostSave_memberId_socialPostId_key" ON "PostSave"("memberId", "socialPostId");

-- CreateIndex
CREATE UNIQUE INDEX "PostSave_memberId_shopPostId_key" ON "PostSave"("memberId", "shopPostId");

-- AddForeignKey
ALTER TABLE "PostSave" ADD CONSTRAINT "PostSave_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostSave" ADD CONSTRAINT "PostSave_socialPostId_fkey" FOREIGN KEY ("socialPostId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostSave" ADD CONSTRAINT "PostSave_shopPostId_fkey" FOREIGN KEY ("shopPostId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
