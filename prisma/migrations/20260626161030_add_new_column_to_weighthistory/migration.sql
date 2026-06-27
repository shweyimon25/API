/*
  Warnings:

  - Added the required column `armRight` to the `WeightHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bpf` to the `WeightHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thighRight` to the `WeightHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WeightHistory" ADD COLUMN     "armRight" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "bpf" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "thighRight" DOUBLE PRECISION NOT NULL;
