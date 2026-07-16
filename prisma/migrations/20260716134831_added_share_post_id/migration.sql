-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "sharePostId" INTEGER;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_sharePostId_fkey" FOREIGN KEY ("sharePostId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
