-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;
