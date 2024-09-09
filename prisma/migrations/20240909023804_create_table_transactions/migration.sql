-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adminFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "customer_name" VARCHAR(50) NOT NULL,
    "tier_id" INTEGER NOT NULL,
    "payment_type" TEXT,
    "vendor_name" TEXT,
    "vendor_trx_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

COMMENT ON COLUMN "transactions"."status" IS 'PENDING, PAID, CANCELLED';
COMMENT ON COLUMN "transactions"."currency" IS 'IDR, USD, EUR';
COMMENT ON COLUMN "transactions"."payment_type" IS 'Payment type (e.g. CREDIT, DEBIT, QR_CODE)';
COMMENT ON COLUMN "transactions"."vendor_name" IS 'Vendor name (e.g. Midtrans, Xendir, etc.)';
COMMENT ON COLUMN "transactions"."vendor_trx_id" IS 'Vendor transaction ID';
COMMENT ON COLUMN "transactions"."note" IS 'Note';
COMMENT ON COLUMN "transactions"."adminFee" IS 'Admin fee';
COMMENT ON COLUMN "transactions"."tier_id" IS 'Tier ID (References Tier ID on api_key_tier)';
COMMENT ON COLUMN "transactions"."customer_name" IS 'Customer username on table users';
COMMENT ON COLUMN "transactions"."amount" IS 'Payment amount in gross';
COMMENT ON COLUMN "transactions"."id" IS 'Transaction ID default as UUID';
