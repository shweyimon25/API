/*
  Warnings:

  - You are about to drop the column `providerType` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `profileType` on the `MemberProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Member` DROP COLUMN `providerType`;

-- AlterTable
ALTER TABLE `MemberProfile` DROP COLUMN `profileType`;

-- CreateTable
CREATE TABLE `MemberProviderType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `providerType` ENUM('GOOGLE', 'FACEBOOK', 'APPLE', 'OTP') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MemberProviderType_memberId_providerType_key`(`memberId`, `providerType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MemberProviderType` ADD CONSTRAINT `MemberProviderType_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
