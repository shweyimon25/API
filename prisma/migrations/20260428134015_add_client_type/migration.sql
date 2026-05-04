-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('user', 'gym_member', 'trainer', 'king', 'queen', 'admin');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "clientType" "ClientType" NOT NULL DEFAULT 'user';
