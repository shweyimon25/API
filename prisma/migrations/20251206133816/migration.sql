/*
  Warnings:

  - A unique constraint covering the columns `[memberId]` on the table `Shop` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Shop` ADD COLUMN `shopLevelId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Shop_memberId_key` ON `Shop`(`memberId`);

-- AddForeignKey
ALTER TABLE `Shop` ADD CONSTRAINT `Shop_shopLevelId_fkey` FOREIGN KEY (`shopLevelId`) REFERENCES `ShopLevel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
