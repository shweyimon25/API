/*
  Warnings:

  - You are about to drop the column `username` on the `Member` table. All the data in the column will be lost.
  - The values [OTP] on the enum `MemberProviderType_providerType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Member_username_key` ON `Member`;

-- AlterTable
ALTER TABLE `Member` DROP COLUMN `username`,
    ADD COLUMN `code` VARCHAR(191) NOT NULL,
    ADD COLUMN `language` ENUM('ENG', 'MM') NOT NULL DEFAULT 'ENG',
    ADD COLUMN `theme` ENUM('DARK', 'PINK', 'LIGHT') NOT NULL DEFAULT 'LIGHT';

-- AlterTable
ALTER TABLE `MemberProfile` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `coverPhoto` VARCHAR(191) NULL,
    ADD COLUMN `profilePhoto` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `MemberProviderType` MODIFY `providerType` ENUM('GOOGLE', 'FACEBOOK', 'APPLE', 'EMAIL', 'PHONE') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Member_code_key` ON `Member`(`code`);
