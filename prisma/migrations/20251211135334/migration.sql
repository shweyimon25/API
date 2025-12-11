/*
  Warnings:

  - The values [DELETED] on the enum `Shop_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [DELETED] on the enum `Shop_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [DELETED] on the enum `Shop_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [DELETED] on the enum `Shop_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [DELETED] on the enum `Shop_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Member` MODIFY `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `MemberPlan` MODIFY `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `Shop` MODIFY `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `ShopLevel` MODIFY `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `User` MODIFY `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';
