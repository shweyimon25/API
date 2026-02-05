/*
  Warnings:

  - Made the column `password` on table `Member` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "password" SET NOT NULL;
