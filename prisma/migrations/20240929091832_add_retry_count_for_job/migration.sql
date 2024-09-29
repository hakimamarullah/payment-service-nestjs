-- AlterEnum
ALTER TYPE "JobStatus" ADD VALUE 'RETRY';

-- AlterTable
ALTER TABLE "generate_key_job" ADD COLUMN     "retry_count" INTEGER NOT NULL DEFAULT 0;
