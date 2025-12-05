/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `MemberPlan` table. All the data in the column will be lost.
  - You are about to drop the `ShopMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ShopMember` DROP FOREIGN KEY `ShopMember_memberId_fkey`;

-- DropForeignKey
ALTER TABLE `ShopMember` DROP FOREIGN KEY `ShopMember_shopLevelId_fkey`;

-- AlterTable
ALTER TABLE `MemberPlan` DROP COLUMN `imageUrl`,
    ADD COLUMN `image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ShopLevel` ADD COLUMN `postLimit` INTEGER NOT NULL DEFAULT 10,
    ADD COLUMN `status` BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE `ShopMember`;

-- CreateTable
CREATE TABLE `Shop` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `memberId` INTEGER NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopRating` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rate` INTEGER NOT NULL DEFAULT 0,
    `review` TEXT NULL,
    `memberId` INTEGER NOT NULL,
    `shopId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Shop` ADD CONSTRAINT `Shop_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopRating` ADD CONSTRAINT `ShopRating_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopRating` ADD CONSTRAINT `ShopRating_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
