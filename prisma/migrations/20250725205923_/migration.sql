/*
  Warnings:

  - You are about to drop the column `walletBalance` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `password` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Customer` DROP COLUMN `walletBalance`,
    ADD COLUMN `balance` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `password` VARCHAR(191) NOT NULL;
