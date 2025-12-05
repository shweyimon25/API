/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Cons` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Pros` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Cons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Pros` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Cons` ADD COLUMN `code` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Pros` ADD COLUMN `code` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Cons_code_key` ON `Cons`(`code`);

-- CreateIndex
CREATE UNIQUE INDEX `Pros_code_key` ON `Pros`(`code`);
