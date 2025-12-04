/*
  Warnings:

  - You are about to drop the column `code` on the `Cons` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Pros` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[guard]` on the table `Cons` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[guard]` on the table `Pros` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `guard` to the `Cons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guard` to the `Pros` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Cons_code_key` ON `Cons`;

-- DropIndex
DROP INDEX `Pros_code_key` ON `Pros`;

-- AlterTable
ALTER TABLE `Cons` DROP COLUMN `code`,
    ADD COLUMN `guard` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Pros` DROP COLUMN `code`,
    ADD COLUMN `guard` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Cons_guard_key` ON `Cons`(`guard`);

-- CreateIndex
CREATE UNIQUE INDEX `Pros_guard_key` ON `Pros`(`guard`);
