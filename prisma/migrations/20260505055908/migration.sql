-- AlterTable
ALTER TABLE "OTP" ADD COLUMN     "address" TEXT,
ADD COLUMN     "device_info" "DeviceType" NOT NULL DEFAULT 'ANDROID',
ADD COLUMN     "firebase_token" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "voip_token" TEXT;
