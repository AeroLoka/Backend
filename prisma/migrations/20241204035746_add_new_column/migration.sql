/*
  Warnings:

  - You are about to drop the column `passengerId` on the `seat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bookingCode]` on the table `booking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "bookingStatus" AS ENUM ('paid', 'unpaid', 'cancelled');

-- DropForeignKey
ALTER TABLE "seat" DROP CONSTRAINT "seat_passengerId_fkey";

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "bookingCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "status" "bookingStatus" NOT NULL DEFAULT 'unpaid';

-- AlterTable
ALTER TABLE "seat" DROP COLUMN "passengerId";

-- CreateIndex
CREATE UNIQUE INDEX "booking_bookingCode_key" ON "booking"("bookingCode");
