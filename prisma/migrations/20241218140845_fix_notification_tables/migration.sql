/*
  Warnings:

  - Made the column `title` on table `notification` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "notification" ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "title" SET DEFAULT 'untitled';
