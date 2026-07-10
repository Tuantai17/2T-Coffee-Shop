CREATE TABLE IF NOT EXISTS refunds (
    id BIGSERIAL PRIMARY KEY,
    refund_code VARCHAR(255) UNIQUE NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    request_hash VARCHAR(255),
    order_id BIGINT NOT NULL,
    payment_transaction_id BIGINT,
    provider_refund_id VARCHAR(255),
    refund_type VARCHAR(255) NOT NULL,
    refund_amount BIGINT NOT NULL,
    refunded_eligible_amount BIGINT NOT NULL,
    reason TEXT,
    status VARCHAR(255) NOT NULL,
    requested_by BIGINT,
    created_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason TEXT,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON refunds(created_at);

CREATE TABLE IF NOT EXISTS refund_items (
    id BIGSERIAL PRIMARY KEY,
    refund_id BIGINT NOT NULL,
    order_item_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_refund_amount BIGINT NOT NULL,
    eligible_refund_amount BIGINT NOT NULL,
    restock_required BOOLEAN NOT NULL DEFAULT false,
    FOREIGN KEY (refund_id) REFERENCES refunds(id)
);

ALTER TABLE outbox_events ADD COLUMN IF NOT EXISTS event_id UUID;
ALTER TABLE outbox_events ADD COLUMN IF NOT EXISTS business_key VARCHAR(255);
ALTER TABLE outbox_events ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0;
ALTER TABLE outbox_events ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE outbox_events ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP;
ALTER TABLE outbox_events ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMP;
ALTER TABLE outbox_events ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMP;
ALTER TABLE outbox_events ADD COLUMN IF NOT EXISTS claimed_by VARCHAR(255);
ALTER TABLE outbox_events ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;

-- Backfill data
UPDATE outbox_events SET event_id = gen_random_uuid() WHERE event_id IS NULL;
UPDATE outbox_events SET business_key = 'OLD:' || id WHERE business_key IS NULL;
UPDATE outbox_events SET status = 'PUBLISHED' WHERE status = 'COMPLETED';

-- Ensure Constraints
ALTER TABLE outbox_events DROP CONSTRAINT IF EXISTS uk_outbox_event_id;
ALTER TABLE outbox_events ADD CONSTRAINT uk_outbox_event_id UNIQUE (event_id);

ALTER TABLE outbox_events DROP CONSTRAINT IF EXISTS uk_outbox_business_key;
ALTER TABLE outbox_events ADD CONSTRAINT uk_outbox_business_key UNIQUE (business_key);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
