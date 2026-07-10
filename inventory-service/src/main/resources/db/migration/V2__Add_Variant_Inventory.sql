-- Add variant_id to inventories
ALTER TABLE inventories ADD COLUMN variant_id BIGINT;
-- Drop unique constraint on product_id
ALTER TABLE inventories DROP CONSTRAINT IF EXISTS inventories_product_id_key;
ALTER TABLE inventories DROP CONSTRAINT IF EXISTS uk_inventories_product_id;
-- Add composite unique constraint
ALTER TABLE inventories ADD CONSTRAINT uk_inventories_product_variant UNIQUE (product_id, variant_id);

-- Add variant_id to inventory_reservations
ALTER TABLE inventory_reservations ADD COLUMN variant_id BIGINT;
ALTER TABLE inventory_reservations DROP CONSTRAINT IF EXISTS inventory_reservations_order_id_product_id_key;
ALTER TABLE inventory_reservations DROP CONSTRAINT IF EXISTS uk_inventory_reservations_order_product;

-- Add variant_id to inventory_transactions
ALTER TABLE inventory_transactions ADD COLUMN variant_id BIGINT;
