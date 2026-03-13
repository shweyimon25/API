/*
  Warnings:

  - You are about to drop the column `mealTypeId` on the `Meal` table. All the data in the column will be lost.
  - You are about to drop the `MealType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Meal" DROP CONSTRAINT "Meal_mealTypeId_fkey";

-- DropForeignKey
ALTER TABLE "MealType" DROP CONSTRAINT "MealType_createdById_fkey";

-- DropForeignKey
ALTER TABLE "MealType" DROP CONSTRAINT "MealType_updatedById_fkey";

-- AlterTable
ALTER TABLE "Meal" DROP COLUMN "mealTypeId",
ADD COLUMN     "mealType" TEXT;

-- DropTable
DROP TABLE "MealType";
