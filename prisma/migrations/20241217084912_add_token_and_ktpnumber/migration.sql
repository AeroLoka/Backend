-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "snap_token" TEXT;

-- AlterTable
ALTER TABLE "passenger" ADD COLUMN     "ktpNumber" TEXT,
ALTER COLUMN "passportNumber" DROP NOT NULL,
ALTER COLUMN "passportExpiry" DROP NOT NULL;
