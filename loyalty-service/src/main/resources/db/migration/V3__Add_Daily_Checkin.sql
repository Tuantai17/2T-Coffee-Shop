CREATE TABLE daily_checkins (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    checkin_date DATE NOT NULL,
    streak_count INT NOT NULL DEFAULT 1,
    reward_type VARCHAR(30) NOT NULL, -- POINTS, VOUCHER
    reward_value VARCHAR(50) NOT NULL, -- e.g. "5", "FREE_TOPPING_7DAYS"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_daily_checkins_user_date ON daily_checkins (user_id, checkin_date);

-- Seed the FREE_TOPPING_7DAYS voucher definition
INSERT INTO voucher_definitions 
(code, name, description, type, min_order_value, max_claims_per_user, claimed_quantity, active, valid_from, created_at, updated_at)
VALUES 
('FREE_TOPPING_7DAYS', 'Miễn phí Topping', 'Voucher tặng miễn phí 1 loại topping bất kỳ khi điểm danh 7 ngày liên tiếp', 'FREE_ITEM', 0, 99999, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;
