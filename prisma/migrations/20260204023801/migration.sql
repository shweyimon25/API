-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('ANDROID', 'IOS', 'WEB');

-- AlterTable
ALTER TABLE "MemberFcmToken" ADD COLUMN     "deviceType" "DeviceType" NOT NULL DEFAULT 'ANDROID';
