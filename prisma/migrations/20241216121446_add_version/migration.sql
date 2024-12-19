-- DropIndex
DROP INDEX "user_phoneNumber_key";

-- AlterTable
ALTER TABLE "seat" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;
