/*
  Warnings:

  - A unique constraint covering the columns `[memberId]` on the table `MemberFcmToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MemberFcmToken_memberId_key" ON "MemberFcmToken"("memberId");
