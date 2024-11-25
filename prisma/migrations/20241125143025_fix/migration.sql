/*
  Warnings:

  - Added the required column `destination` to the `flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin` to the `flight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "destination" TEXT NOT NULL,
ADD COLUMN     "origin" TEXT NOT NULL;
