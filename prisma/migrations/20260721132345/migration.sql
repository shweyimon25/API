/*
  Warnings:

  - Added the required column `reaction` to the `PostReaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `PostReaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostReaction" ADD COLUMN     "reaction" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
