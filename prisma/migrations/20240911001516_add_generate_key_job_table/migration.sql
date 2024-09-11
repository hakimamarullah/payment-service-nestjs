-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "generate_key_job" (
    "job_id" SERIAL NOT NULL,
    "ref_id" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'OPEN',
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generate_key_job_pkey" PRIMARY KEY ("job_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "generate_key_job_ref_id_key" ON "generate_key_job"("ref_id");

-- CreateIndex
CREATE INDEX "generate_key_job_ref_id_idx" ON "generate_key_job"("ref_id");
