/*
  Warnings:

  - You are about to drop the `ShopPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShopPostComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShopPostReaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_tagId_fkey";

-- DropForeignKey
ALTER TABLE "ShopPost" DROP CONSTRAINT "ShopPost_shopId_fkey";

-- DropForeignKey
ALTER TABLE "ShopPostComment" DROP CONSTRAINT "ShopPostComment_memberId_fkey";

-- DropForeignKey
ALTER TABLE "ShopPostComment" DROP CONSTRAINT "ShopPostComment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "ShopPostComment" DROP CONSTRAINT "ShopPostComment_shopPostId_fkey";

-- DropForeignKey
ALTER TABLE "ShopPostReaction" DROP CONSTRAINT "ShopPostReaction_memberId_fkey";

-- DropForeignKey
ALTER TABLE "ShopPostReaction" DROP CONSTRAINT "ShopPostReaction_shopPostId_fkey";

-- AlterTable
ALTER TABLE "MemberPlan" ADD COLUMN     "expiredAt" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "shopId" INTEGER,
ALTER COLUMN "tagId" DROP NOT NULL,
ALTER COLUMN "privencyType" DROP NOT NULL;

-- DropTable
DROP TABLE "ShopPost";

-- DropTable
DROP TABLE "ShopPostComment";

-- DropTable
DROP TABLE "ShopPostReaction";

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
