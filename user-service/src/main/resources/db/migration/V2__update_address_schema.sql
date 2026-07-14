-- Update user_addresses table to support Open API v2 structure without district dependency
ALTER TABLE user_addresses ALTER COLUMN district DROP NOT NULL;

-- Add new columns for administrative unit codes
ALTER TABLE user_addresses ADD COLUMN IF NOT EXISTS province_code VARCHAR(20);
ALTER TABLE user_addresses ADD COLUMN IF NOT EXISTS ward_code VARCHAR(20);
