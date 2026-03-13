-- AlterTable
ALTER TABLE "ConversationParticipant" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "archivedAt" TIMESTAMP(3);
