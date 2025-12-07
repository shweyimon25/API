-- AlterTable
ALTER TABLE `Post` MODIFY `privencyType` ENUM('PUBLIC', 'PRIVATE', 'FRIEND') NOT NULL DEFAULT 'PUBLIC';

-- CreateTable
CREATE TABLE `ShopPost` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `caption` VARCHAR(191) NOT NULL,
    `privencyType` ENUM('PUBLIC', 'PRIVATE', 'FRIEND') NOT NULL DEFAULT 'PUBLIC',
    `images` JSON NOT NULL,
    `shopId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopPostComment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shopPostId` INTEGER NOT NULL,
    `memberId` INTEGER NOT NULL,
    `comment` JSON NOT NULL,
    `parentId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ShopPost` ADD CONSTRAINT `ShopPost_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopPostComment` ADD CONSTRAINT `ShopPostComment_shopPostId_fkey` FOREIGN KEY (`shopPostId`) REFERENCES `ShopPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopPostComment` ADD CONSTRAINT `ShopPostComment_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopPostComment` ADD CONSTRAINT `ShopPostComment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `ShopPostComment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
