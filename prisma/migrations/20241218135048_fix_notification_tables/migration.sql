/*
  Warnings:

  - You are about to drop the column `name` on the `notification` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "userRole" AS ENUM ('admin', 'user');

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "snap_token" TEXT;

-- AlterTable
ALTER TABLE "notification" DROP COLUMN "name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'notifikasi';

-- AlterTable
ALTER TABLE "passenger" ADD COLUMN     "ktpNumber" TEXT,
ADD COLUMN     "passportCountry" TEXT,
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "passportNumber" DROP NOT NULL,
ALTER COLUMN "passportExpiry" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "userRole" NOT NULL DEFAULT 'user';
