-- Add deliveryCharge column to Products table
ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS "deliveryCharge" DECIMAL(10,2) DEFAULT 0;

-- Update existing products with default delivery charge
UPDATE "Products" SET "deliveryCharge" = 0 WHERE "deliveryCharge" IS NULL;