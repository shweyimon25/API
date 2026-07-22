/*
  Warnings:

  - You are about to drop the column `mentionMemberIds` on the `PostComment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PostComment" DROP COLUMN "mentionMemberIds",
ADD COLUMN     "mentionIds" JSONB NOT NULL DEFAULT '[]';
