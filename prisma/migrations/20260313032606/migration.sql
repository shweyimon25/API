-- CreateTable
CREATE TABLE "Block" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "blockedMemberId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Block_memberId_blockedMemberId_key" ON "Block"("memberId", "blockedMemberId");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedMemberId_fkey" FOREIGN KEY ("blockedMemberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
