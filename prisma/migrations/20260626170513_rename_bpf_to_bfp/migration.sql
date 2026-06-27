/*
  Warnings:

  - You are about to drop the column `bpf` on the `WeightHistory` table. All the data in the column will be lost.
  - Added the required column `bfp` to the `WeightHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WeightHistory" DROP COLUMN "bpf",
ADD COLUMN     "bfp" DOUBLE PRECISION NOT NULL;
