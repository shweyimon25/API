/*
  Warnings:

  - You are about to drop the column `memberPlanId` on the `Cons` table. All the data in the column will be lost.
  - You are about to drop the column `memberPlanId` on the `Pros` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Cons` DROP FOREIGN KEY `Cons_memberPlanId_fkey`;

-- DropForeignKey
ALTER TABLE `Pros` DROP FOREIGN KEY `Pros_memberPlanId_fkey`;

-- DropIndex
DROP INDEX `Cons_memberPlanId_fkey` ON `Cons`;

-- DropIndex
DROP INDEX `Pros_memberPlanId_fkey` ON `Pros`;

-- AlterTable
ALTER TABLE `Cons` DROP COLUMN `memberPlanId`;

-- AlterTable
ALTER TABLE `Pros` DROP COLUMN `memberPlanId`;

-- CreateTable
CREATE TABLE `_MemberPlanToPros` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_MemberPlanToPros_AB_unique`(`A`, `B`),
    INDEX `_MemberPlanToPros_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ConsToMemberPlan` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ConsToMemberPlan_AB_unique`(`A`, `B`),
    INDEX `_ConsToMemberPlan_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_MemberPlanToPros` ADD CONSTRAINT `_MemberPlanToPros_A_fkey` FOREIGN KEY (`A`) REFERENCES `MemberPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MemberPlanToPros` ADD CONSTRAINT `_MemberPlanToPros_B_fkey` FOREIGN KEY (`B`) REFERENCES `Pros`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ConsToMemberPlan` ADD CONSTRAINT `_ConsToMemberPlan_A_fkey` FOREIGN KEY (`A`) REFERENCES `Cons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ConsToMemberPlan` ADD CONSTRAINT `_ConsToMemberPlan_B_fkey` FOREIGN KEY (`B`) REFERENCES `MemberPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
