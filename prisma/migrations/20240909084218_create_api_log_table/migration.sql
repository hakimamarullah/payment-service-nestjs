-- CreateTable
CREATE TABLE "api_log" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "response_message" TEXT,
    "response_code" INTEGER,
    "query" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_log_pkey" PRIMARY KEY ("id")
);
