/*
  Warnings:

  - Added the required column `timeAgo` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Post` ADD COLUMN `timeAgo` VARCHAR(191) NOT NULL;
