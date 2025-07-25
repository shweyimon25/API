/*
  Warnings:

  - You are about to alter the column `language` on the `CustomerProfile` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `CustomerProfile` MODIFY `language` ENUM('thai', 'en') NOT NULL DEFAULT 'en';
