CREATE TABLE voucher_definitions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    type VARCHAR(30) NOT NULL, -- PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING, FREE_ITEM
    discount_amount BIGINT,
    discount_percentage INT,
    max_discount_amount BIGINT,
    min_order_value BIGINT NOT NULL DEFAULT 0,
    required_tier_code VARCHAR(30), -- Member tier required to claim/use
    points_required BIGINT NOT NULL DEFAULT 0, -- Cost to redeem this voucher using points
    max_claims_per_user INT NOT NULL DEFAULT 1,
    total_quantity INT, -- Null means unlimited
    claimed_quantity INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_vouchers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    voucher_definition_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL, -- Can be the generic code or unique generated code
    status VARCHAR(30) NOT NULL, -- AVAILABLE, USED, EXPIRED
    acquired_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP,
    order_id BIGINT,
    expires_at TIMESTAMP,
    FOREIGN KEY (voucher_definition_id) REFERENCES voucher_definitions(id)
);

CREATE INDEX idx_user_vouchers_user ON user_vouchers (user_id);
CREATE INDEX idx_user_vouchers_status ON user_vouchers (status);
