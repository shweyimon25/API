/*
  Warnings:

  - You are about to alter the column `status` on the `Member` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(8))`.
  - You are about to alter the column `status` on the `MemberPlan` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(8))`.
  - You are about to alter the column `status` on the `Shop` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(8))`.
  - You are about to alter the column `status` on the `ShopLevel` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(8))`.
  - You are about to alter the column `status` on the `User` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(8))`.

*/
-- AlterTable
ALTER TABLE `Member` MODIFY `status` ENUM('ACTIVE', 'INACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `MemberPlan` MODIFY `status` ENUM('ACTIVE', 'INACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `Shop` MODIFY `status` ENUM('ACTIVE', 'INACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `ShopLevel` MODIFY `status` ENUM('ACTIVE', 'INACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `User` MODIFY `status` ENUM('ACTIVE', 'INACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE';
