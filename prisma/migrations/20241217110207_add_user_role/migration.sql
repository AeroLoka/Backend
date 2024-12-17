-- CreateEnum
CREATE TYPE "userRole" AS ENUM ('admin', 'user');

-- AlterTable
ALTER TABLE "passenger" ALTER COLUMN "lastName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "userRole" NOT NULL DEFAULT 'user';
