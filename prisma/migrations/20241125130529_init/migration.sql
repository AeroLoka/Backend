/*
  Warnings:

  - You are about to drop the column `city` on the `airports` table. All the data in the column will be lost.
  - Added the required column `cityId` to the `airports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `continent` to the `airports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `flight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "airports" DROP COLUMN "city",
ADD COLUMN     "cityId" INTEGER NOT NULL,
ADD COLUMN     "continent" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "duration" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "city" (
    "id" SERIAL NOT NULL,
    "shortname" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,

    CONSTRAINT "city_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "airports" ADD CONSTRAINT "airports_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
