/*
  Warnings:

  - You are about to drop the column `type` on the `PostReaction` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ShopPostReaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PostReaction" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "ShopPostReaction" DROP COLUMN "type";
