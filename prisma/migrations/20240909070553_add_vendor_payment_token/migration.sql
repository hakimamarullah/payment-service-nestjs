-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "vendor_payment_token" VARCHAR(500);

COMMENT ON COLUMN "transactions"."vendor_payment_token" IS 'Vendor payment token (e.g. SnapToken from Midtrans)';
