-- V5__Refactor_Checkin_Single_Module.sql

-- Drop all old tables
DROP TABLE IF EXISTS user_checkin_achievements CASCADE;
DROP TABLE IF EXISTS checkin_achievements CASCADE;
DROP TABLE IF EXISTS mystery_box_openings CASCADE;
DROP TABLE IF EXISTS mystery_box_items CASCADE;
DROP TABLE IF EXISTS mystery_boxes CASCADE;
DROP TABLE IF EXISTS checkin_rewards CASCADE;
DROP TABLE IF EXISTS checkin_mission_progress CASCADE;
DROP TABLE IF EXISTS checkin_missions CASCADE;
DROP TABLE IF EXISTS checkin_calendar_events CASCADE;
DROP TABLE IF EXISTS checkin_reward_cycle_items CASCADE;
DROP TABLE IF EXISTS checkin_reward_cycles CASCADE;
DROP TABLE IF EXISTS user_checkin_streaks CASCADE;
DROP TABLE IF EXISTS checkin_records CASCADE;
DROP TABLE IF EXISTS checkin_configs CASCADE;
DROP TABLE IF EXISTS checkin_faqs CASCADE;
DROP TABLE IF EXISTS checkin_admin_audit_logs CASCADE;

-- Create new tables for single module

-- 1. checkin_programs
CREATE TABLE checkin_programs (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    program_type VARCHAR(50) DEFAULT 'CONSECUTIVE',
    total_days INT NOT NULL,
    require_consecutive BOOLEAN DEFAULT TRUE,
    reset_on_miss BOOLEAN DEFAULT TRUE,
    allow_repeat BOOLEAN DEFAULT FALSE,
    repeat_type VARCHAR(50) DEFAULT 'NONE',
    start_date DATE,
    end_date DATE,
    checkin_start_time TIME,
    checkin_end_time TIME,
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    status VARCHAR(50) DEFAULT 'DRAFT',
    hero_title VARCHAR(255),
    hero_description TEXT,
    button_text VARCHAR(100),
    checked_button_text VARCHAR(100),
    confetti_enabled BOOLEAN DEFAULT TRUE,
    animation_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);
CREATE INDEX idx_checkin_programs_status ON checkin_programs(status);

-- 2. checkin_program_rewards
CREATE TABLE checkin_program_rewards (
    id SERIAL PRIMARY KEY,
    program_id BIGINT NOT NULL REFERENCES checkin_programs(id),
    day_number INT NOT NULL,
    reward_type VARCHAR(50) NOT NULL, -- POINTS, VOUCHER, PRODUCT, PERCENTAGE, AMOUNT, NONE
    reward_value VARCHAR(100),
    voucher_id VARCHAR(100),
    product_id VARCHAR(100),
    display_name VARCHAR(255),
    description TEXT,
    icon_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_program_rewards_program ON checkin_program_rewards(program_id, day_number);

-- 3. checkin_program_lucky_days
CREATE TABLE checkin_program_lucky_days (
    id SERIAL PRIMARY KEY,
    program_id BIGINT NOT NULL REFERENCES checkin_programs(id),
    lucky_date DATE NOT NULL,
    multiplier DECIMAL(3,1) DEFAULT 1.0,
    bonus_points INT DEFAULT 0,
    voucher_id VARCHAR(100),
    quantity_limit INT,
    quantity_used INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

-- 4. checkin_records
CREATE TABLE checkin_records (
    id SERIAL PRIMARY KEY,
    program_id BIGINT NOT NULL REFERENCES checkin_programs(id),
    user_id BIGINT NOT NULL,
    business_date DATE NOT NULL,
    checkin_time TIMESTAMP NOT NULL,
    day_number INT NOT NULL,
    streak_before INT NOT NULL,
    streak_after INT NOT NULL,
    points_awarded INT DEFAULT 0,
    voucher_id VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    idempotency_key VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_program_user_date UNIQUE (program_id, user_id, business_date)
);
CREATE INDEX idx_checkin_records_user ON checkin_records(user_id);
CREATE INDEX idx_checkin_records_program ON checkin_records(program_id);
CREATE INDEX idx_checkin_records_date ON checkin_records(business_date);

-- 5. user_checkin_progress
CREATE TABLE user_checkin_progress (
    id SERIAL PRIMARY KEY,
    program_id BIGINT NOT NULL REFERENCES checkin_programs(id),
    user_id BIGINT NOT NULL,
    current_day INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    total_checkins INT DEFAULT 0,
    last_checkin_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_progress_user_program UNIQUE (program_id, user_id)
);

-- 6. checkin_settings
CREATE TABLE checkin_settings (
    id SERIAL PRIMARY KEY,
    enabled BOOLEAN DEFAULT TRUE,
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    allow_streak_restore BOOLEAN DEFAULT FALSE,
    max_restore_per_month INT DEFAULT 0,
    rate_limit INT DEFAULT 1,
    reminder_enabled BOOLEAN DEFAULT FALSE,
    reminder_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. checkin_audit_logs
CREATE TABLE checkin_audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Initial Settings
INSERT INTO checkin_settings (enabled, timezone, rate_limit) VALUES (TRUE, 'Asia/Ho_Chi_Minh', 1);

-- Insert Initial Active Program
INSERT INTO checkin_programs (code, name, description, total_days, start_date, end_date, status, hero_title)
VALUES ('DEFAULT_7_DAYS', 'Chuỗi điểm danh 7 ngày', 'Điểm danh hằng ngày nhận ưu đãi', 7, CURRENT_DATE, CURRENT_DATE + interval '1 year', 'ACTIVE', 'Điểm danh 7 ngày liên tiếp');

-- Insert Initial Rewards for the default program
INSERT INTO checkin_program_rewards (program_id, day_number, reward_type, reward_value, display_name) VALUES
(1, 1, 'POINTS', '10', '10 Điểm'),
(1, 2, 'POINTS', '10', '10 Điểm'),
(1, 3, 'POINTS', '15', '15 Điểm'),
(1, 4, 'POINTS', '15', '15 Điểm'),
(1, 5, 'POINTS', '20', '20 Điểm'),
(1, 6, 'POINTS', '20', '20 Điểm'),
(1, 7, 'VOUCHER', 'FREE_TOPPING_7DAYS', 'Voucher Giảm 20%');

