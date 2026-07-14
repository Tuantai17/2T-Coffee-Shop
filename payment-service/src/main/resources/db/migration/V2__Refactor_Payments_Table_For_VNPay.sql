-- Rename table
ALTER TABLE payments RENAME TO payment_transactions;

-- Add new columns
ALTER TABLE payment_transactions
    ADD COLUMN provider VARCHAR(50),
    ADD COLUMN txn_ref VARCHAR(100),
    ADD COLUMN provider_transaction_no VARCHAR(100),
    ADD COLUMN response_code VARCHAR(20),
    ADD COLUMN transaction_status VARCHAR(20),
    ADD COLUMN bank_code VARCHAR(50),
    ADD COLUMN bank_transaction_no VARCHAR(100),
    ADD COLUMN card_type VARCHAR(50),
    ADD COLUMN payment_url TEXT,
    ADD COLUMN failure_reason TEXT,
    ADD COLUMN expired_at TIMESTAMP,
    ADD COLUMN paid_at TIMESTAMP;

-- Data migration (if any existing transactions exist, we map them)
UPDATE payment_transactions
SET provider = 'VNPAY',
    txn_ref = transaction_id
WHERE payment_method = 'VNPAY';

UPDATE payment_transactions
SET provider = 'COD'
WHERE payment_method = 'COD';

-- Create constraints
ALTER TABLE payment_transactions ADD CONSTRAINT uk_payment_txn_ref UNIQUE (txn_ref);

-- Update indexes
ALTER INDEX idx_payments_order_id RENAME TO idx_payment_transactions_order_id;
-- Drop old transaction_id index as we use txn_ref now
DROP INDEX IF EXISTS idx_payments_transaction_id;
CREATE INDEX idx_payment_transactions_txn_ref ON payment_transactions(txn_ref);

-- Rename foreign key column in payment_logs for clarity if we want, but let's keep it as payment_id for now.
