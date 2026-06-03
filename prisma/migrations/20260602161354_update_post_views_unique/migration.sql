/*
  Warnings:

  - A unique constraint covering the columns `[memberId,socialPostId]` on the table `PostViews` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[memberId,shopPostId]` on the table `PostViews` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PostViews_memberId_socialPostId_key" ON "PostViews"("memberId", "socialPostId");

-- CreateIndex
CREATE UNIQUE INDEX "PostViews_memberId_shopPostId_key" ON "PostViews"("memberId", "shopPostId");
