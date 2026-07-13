/*
  Warnings:

  - The values [PRIVATE] on the enum `PrivencyType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PrivencyType_new" AS ENUM ('PUBLIC', 'FRIEND', 'ONLY_ME');
ALTER TABLE "public"."Post" ALTER COLUMN "privencyType" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "privencyType" TYPE "PrivencyType_new" USING ("privencyType"::text::"PrivencyType_new");
ALTER TYPE "PrivencyType" RENAME TO "PrivencyType_old";
ALTER TYPE "PrivencyType_new" RENAME TO "PrivencyType";
DROP TYPE "public"."PrivencyType_old";
ALTER TABLE "Post" ALTER COLUMN "privencyType" SET DEFAULT 'PUBLIC';
COMMIT;
