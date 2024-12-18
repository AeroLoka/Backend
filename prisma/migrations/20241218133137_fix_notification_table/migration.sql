/*
  Warnings:

  - You are about to drop the column `snap_token` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `ktpNumber` on the `passenger` table. All the data in the column will be lost.
  - You are about to drop the column `passportCountry` on the `passenger` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `user` table. All the data in the column will be lost.
  - Added the required column `name` to the `notification` table without a default value. This is not possible if the table is not empty.
  - Made the column `lastName` on table `passenger` required. This step will fail if there are existing NULL values in that column.
  - Made the column `passportNumber` on table `passenger` required. This step will fail if there are existing NULL values in that column.
  - Made the column `passportExpiry` on table `passenger` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "booking" DROP COLUMN "snap_token";

-- AlterTable
ALTER TABLE "notification" DROP COLUMN "createdAt",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "passenger" DROP COLUMN "ktpNumber",
DROP COLUMN "passportCountry",
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "passportNumber" SET NOT NULL,
ALTER COLUMN "passportExpiry" SET NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "role";

-- DropEnum
DROP TYPE "userRole";
