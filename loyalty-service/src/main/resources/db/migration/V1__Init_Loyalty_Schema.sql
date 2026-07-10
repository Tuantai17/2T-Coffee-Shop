CREATE TABLE membership_tiers (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    minimum_completed_orders INT NOT NULL,
    minimum_eligible_spending BIGINT NOT NULL,
    evaluation_months INT NOT NULL DEFAULT 6,
    daily_checkin_points BIGINT NOT NULL DEFAULT 0,
    daily_spin_count INT NOT NULL DEFAULT 0,
    upgrade_voucher_value BIGINT NOT NULL DEFAULT 0,
    birthday_voucher_value BIGINT NOT NULL DEFAULT 0,
    monthly_freeship_count INT NOT NULL DEFAULT 0,
    priority_support BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE loyalty_accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    available_points BIGINT NOT NULL DEFAULT 0,
    pending_points BIGINT NOT NULL DEFAULT 0,
    reserved_points BIGINT NOT NULL DEFAULT 0,
    lifetime_earned_points BIGINT NOT NULL DEFAULT 0,
    lifetime_used_points BIGINT NOT NULL DEFAULT 0,
    current_tier_code VARCHAR(30) NOT NULL DEFAULT 'MEMBER',
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE point_transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_code VARCHAR(80) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    type VARCHAR(30) NOT NULL, -- EARN, SPEND, RESERVE, RELEASE, REVERSE, EXPIRE, ADJUST
    source VARCHAR(30) NOT NULL, -- ORDER, CHECKIN, MINIGAME, BIRTHDAY, MEMBER_DAY, UPGRADE_REWARD, ADMIN_ADJUSTMENT
    points BIGINT NOT NULL,
    balance_before BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    reference_type VARCHAR(30),
    reference_id VARCHAR(100),
    status VARCHAR(30) NOT NULL,
    description VARCHAR(500),
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_point_user_created ON point_transactions (user_id, created_at);
CREATE INDEX idx_point_reference ON point_transactions (reference_type, reference_id);

CREATE TABLE member_tier_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    old_tier_code VARCHAR(30),
    new_tier_code VARCHAR(30) NOT NULL,
    completed_orders_6_months INT NOT NULL,
    eligible_spending_6_months BIGINT NOT NULL,
    reason VARCHAR(255),
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE membership_qualification_snapshots (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    completed_order_count INT NOT NULL,
    eligible_spending BIGINT NOT NULL,
    qualified_tier_code VARCHAR(30) NOT NULL,
    evaluated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE processed_events (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL UNIQUE,
    event_type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100),
    status VARCHAR(30) NOT NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default tiers
INSERT INTO membership_tiers 
(code, name, minimum_completed_orders, minimum_eligible_spending, evaluation_months, daily_checkin_points, daily_spin_count, upgrade_voucher_value, birthday_voucher_value, monthly_freeship_count, priority_support, display_order) 
VALUES
('MEMBER', 'Thành viên', 0, 0, 6, 50, 1, 0, 10000, 0, FALSE, 1),
('SILVER', 'Bạc', 3, 1000000, 6, 75, 1, 10000, 20000, 1, FALSE, 2),
('GOLD', 'Vàng', 20, 5000000, 6, 100, 2, 30000, 50000, 2, TRUE, 3),
('DIAMOND', 'Kim Cương', 75, 15000000, 6, 150, 3, 50000, 100000, 4, TRUE, 4);
