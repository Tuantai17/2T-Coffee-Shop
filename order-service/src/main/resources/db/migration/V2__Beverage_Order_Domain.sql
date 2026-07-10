-- V2: Beverage Order Domain fields

-- 1. Add fulfillment type and idempotency key to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS fulfillment_type VARCHAR(50) DEFAULT 'DELIVERY',
ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255);

-- Ensure idempotency key is unique
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS uk_order_idempotency_key;

ALTER TABLE orders
ADD CONSTRAINT uk_order_idempotency_key UNIQUE (idempotency_key);


-- 2. Add detailed beverage snapshots and note to items
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS variant_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS options_snapshot VARCHAR(1000),
ADD COLUMN IF NOT EXISTS toppings_snapshot VARCHAR(1000),
ADD COLUMN IF NOT EXISTS note VARCHAR(1000);
