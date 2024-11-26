/*
  Warnings:

  - You are about to drop the column `destination` on the `flight` table. All the data in the column will be lost.
  - You are about to drop the column `origin` on the `flight` table. All the data in the column will be lost.
  - Added the required column `destinationCityId` to the `flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originCityId` to the `flight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "flight" DROP COLUMN "destination",
DROP COLUMN "origin",
ADD COLUMN     "destinationCityId" INTEGER NOT NULL,
ADD COLUMN     "originCityId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_originCityId_fkey" FOREIGN KEY ("originCityId") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_destinationCityId_fkey" FOREIGN KEY ("destinationCityId") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
