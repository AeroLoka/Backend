/*
  Warnings:

  - Added the required column `imageUrl` to the `flight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "imageUrl" TEXT NOT NULL;
