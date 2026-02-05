-- CreateTable
CREATE TABLE "ShopPostReaction" (
    "id" SERIAL NOT NULL,
    "shopPostId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopPostReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostReaction" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopPostReaction_shopPostId_memberId_key" ON "ShopPostReaction"("shopPostId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "PostReaction_postId_memberId_key" ON "PostReaction"("postId", "memberId");

-- AddForeignKey
ALTER TABLE "ShopPostReaction" ADD CONSTRAINT "ShopPostReaction_shopPostId_fkey" FOREIGN KEY ("shopPostId") REFERENCES "ShopPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopPostReaction" ADD CONSTRAINT "ShopPostReaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
