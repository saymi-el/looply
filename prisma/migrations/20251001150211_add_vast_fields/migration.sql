-- AlterTable
ALTER TABLE "VideoJob" ADD COLUMN     "cloudProvider" TEXT,
ADD COLUMN     "metadata" TEXT,
ADD COLUMN     "vastJobId" TEXT,
ADD COLUMN     "videoUrl" TEXT;
