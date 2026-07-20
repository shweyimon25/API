/*
  Warnings:

  - Added the required column `type` to the `PostComment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostComment" ADD COLUMN     "type" TEXT NOT NULL;
