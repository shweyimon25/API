/*
  Warnings:

  - You are about to drop the column `deviceType` on the `MemberFcmToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MemberFcmToken" DROP COLUMN "deviceType";

-- DropEnum
DROP TYPE "DeviceType";
