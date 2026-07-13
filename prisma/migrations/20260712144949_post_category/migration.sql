/*
  Warnings:

  - You are about to drop the column `content` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `tagId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_tagId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_updatedById_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "content",
DROP COLUMN "tagId",
ADD COLUMN     "caption" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "postCategoryId" INTEGER,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Tag";

-- CreateTable
CREATE TABLE "PostCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostCategory_name_key" ON "PostCategory"("name");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_postCategoryId_fkey" FOREIGN KEY ("postCategoryId") REFERENCES "PostCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
