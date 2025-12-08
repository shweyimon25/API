/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Member` ADD COLUMN `phone` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Member_phone_key` ON `Member`(`phone`);
