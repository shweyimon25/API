/*
  Warnings:

  - You are about to drop the `GymMemberProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrainerMemberProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `GymMemberProfile` DROP FOREIGN KEY `GymMemberProfile_memberId_fkey`;

-- DropForeignKey
ALTER TABLE `TrainerMemberProfile` DROP FOREIGN KEY `TrainerMemberProfile_memberId_fkey`;

-- DropTable
DROP TABLE `GymMemberProfile`;

-- DropTable
DROP TABLE `TrainerMemberProfile`;

-- CreateTable
CREATE TABLE `MemberProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `profileType` ENUM('GYM', 'TRAINER') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MemberProfile_memberId_key`(`memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MemberProfile` ADD CONSTRAINT `MemberProfile_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
