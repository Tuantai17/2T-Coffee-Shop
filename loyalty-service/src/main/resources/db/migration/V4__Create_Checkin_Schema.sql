-- V4__Create_Checkin_Schema.sql

-- 1. checkin_configs
CREATE TABLE checkin_configs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    start_time TIME,
    end_time TIME,
    max_checkins_per_day INT DEFAULT 1,
    base_points INT DEFAULT 10,
    reset_on_miss BOOLEAN DEFAULT TRUE,
    allow_recovery BOOLEAN DEFAULT FALSE,
    max_recovery_per_month INT DEFAULT 0,
    recovery_fee INT DEFAULT 0,
    recovery_days INT DEFAULT 0,
    cycle_type VARCHAR(50) DEFAULT 'MONTHLY',
    hero_title VARCHAR(255),
    hero_desc TEXT,
    hero_image VARCHAR(255),
    checkin_button_text VARCHAR(100),
    after_checkin_text VARCHAR(100),
    enable_confetti BOOLEAN DEFAULT TRUE,
    enable_animation BOOLEAN DEFAULT TRUE,
    enable_lucky_day BOOLEAN DEFAULT TRUE,
    enable_mystery_box BOOLEAN DEFAULT TRUE,
    enable_mission BOOLEAN DEFAULT TRUE,
    enable_achievement BOOLEAN DEFAULT TRUE,
    enable_leaderboard BOOLEAN DEFAULT FALSE,
    enable_reward_store BOOLEAN DEFAULT FALSE,
    version INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- 2. checkin_records (thay thế logic của daily_checkins cũ)
CREATE TABLE checkin_records (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    business_date DATE NOT NULL,
    checkin_time TIMESTAMP NOT NULL,
    streak_before INT NOT NULL,
    streak_after INT NOT NULL,
    points_earned INT NOT NULL,
    voucher_earned VARCHAR(100),
    is_lucky_day BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) NOT NULL, -- SUCCESS, FAILED, DUPLICATE, ADJUSTED
    transaction_id VARCHAR(100),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    CONSTRAINT uk_user_date UNIQUE (user_id, business_date)
);
CREATE INDEX idx_checkin_records_user_id ON checkin_records(user_id);
CREATE INDEX idx_checkin_records_date ON checkin_records(business_date);

-- 3. user_checkin_streaks
CREATE TABLE user_checkin_streaks (
    user_id BIGINT PRIMARY KEY,
    current_streak INT DEFAULT 0,
    best_streak INT DEFAULT 0,
    total_checkins INT DEFAULT 0,
    total_points INT DEFAULT 0,
    total_vouchers INT DEFAULT 0,
    last_checkin_date DATE,
    version INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. checkin_reward_cycles
CREATE TABLE checkin_reward_cycles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    days INT NOT NULL,
    cycle_type VARCHAR(50) NOT NULL, -- ONE_TIME, WEEKLY, MONTHLY, AFTER_COMPLETION, CUSTOM
    start_date DATE,
    end_date DATE,
    is_repeatable BOOLEAN DEFAULT TRUE,
    total_participants INT DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- 5. checkin_reward_cycle_items
CREATE TABLE checkin_reward_cycle_items (
    id SERIAL PRIMARY KEY,
    cycle_id BIGINT NOT NULL REFERENCES checkin_reward_cycles(id),
    day_number INT NOT NULL,
    reward_type VARCHAR(50) NOT NULL, -- POINTS, VOUCHER, COFFEE, PRODUCT, PERCENTAGE, AMOUNT, MYSTERY_BOX, ACHIEVEMENT, NONE
    reward_value VARCHAR(100),
    icon VARCHAR(100),
    description TEXT,
    CONSTRAINT uk_cycle_day UNIQUE (cycle_id, day_number)
);

-- 6. checkin_calendar_events
CREATE TABLE checkin_calendar_events (
    id SERIAL PRIMARY KEY,
    event_date DATE NOT NULL,
    type VARCHAR(50) NOT NULL, -- LUCKY_DAY, VOUCHER, MAINTENANCE, PAUSED, EVENT
    status VARCHAR(50) DEFAULT 'ACTIVE',
    base_points INT,
    multiplier DECIMAL(3,1) DEFAULT 1.0,
    bonus_points INT DEFAULT 0,
    voucher_id VARCHAR(100),
    reward_id BIGINT,
    quantity_limit INT,
    start_time TIME,
    end_time TIME,
    display_text VARCHAR(255),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);
CREATE INDEX idx_calendar_event_date ON checkin_calendar_events(event_date);

-- 7. checkin_missions
CREATE TABLE checkin_missions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    event_type VARCHAR(100) NOT NULL, -- e.g., ORDER_PLACED, MINI_GAME_PLAYED
    target_value INT NOT NULL,
    cycle VARCHAR(50) NOT NULL, -- DAILY, WEEKLY, MONTHLY, ONE_TIME
    reward_points INT DEFAULT 0,
    reward_voucher_id VARCHAR(100),
    display_order INT DEFAULT 0,
    start_date DATE,
    end_date DATE,
    total_completed INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- 8. checkin_mission_progress
CREATE TABLE checkin_mission_progress (
    id SERIAL PRIMARY KEY,
    mission_id BIGINT NOT NULL REFERENCES checkin_missions(id),
    user_id BIGINT NOT NULL,
    current_value INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    business_date DATE, -- For daily cycle
    version INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mission_progress_user ON checkin_mission_progress(user_id, mission_id, business_date);

-- 9. checkin_rewards (Stand-alone physical or digital rewards)
CREATE TABLE checkin_rewards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    reward_type VARCHAR(50) NOT NULL,
    value VARCHAR(100),
    image_url VARCHAR(255),
    quantity INT,
    issued INT DEFAULT 0,
    remaining INT,
    valid_until TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- 10. mystery_boxes
CREATE TABLE mystery_boxes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    required_days INT NOT NULL,
    max_opens INT DEFAULT 1,
    start_date DATE,
    end_date DATE,
    is_repeatable BOOLEAN DEFAULT FALSE,
    total_opens INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- 11. mystery_box_items
CREATE TABLE mystery_box_items (
    id SERIAL PRIMARY KEY,
    box_id BIGINT NOT NULL REFERENCES mystery_boxes(id),
    name VARCHAR(255) NOT NULL,
    reward_type VARCHAR(50) NOT NULL,
    value VARCHAR(100),
    probability DECIMAL(5,2) NOT NULL,
    weight INT NOT NULL,
    quantity_limit INT,
    issued_quantity INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

-- 12. mystery_box_openings
CREATE TABLE mystery_box_openings (
    id SERIAL PRIMARY KEY,
    box_id BIGINT NOT NULL REFERENCES mystery_boxes(id),
    user_id BIGINT NOT NULL,
    item_id BIGINT REFERENCES mystery_box_items(id),
    opened_at TIMESTAMP NOT NULL,
    business_date DATE,
    status VARCHAR(50) NOT NULL
);

-- 13. checkin_achievements
CREATE TABLE checkin_achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    badge_color VARCHAR(50),
    condition_type VARCHAR(50) NOT NULL, -- STREAK, TOTAL_CHECKINS, TOTAL_VOUCHERS, TOTAL_POINTS
    target_value INT NOT NULL,
    reward_points INT DEFAULT 0,
    reward_voucher_id VARCHAR(100),
    show_progress BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    total_achieved INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- 14. user_checkin_achievements
CREATE TABLE user_checkin_achievements (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    achievement_id BIGINT NOT NULL REFERENCES checkin_achievements(id),
    current_progress INT DEFAULT 0,
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_achievement UNIQUE (user_id, achievement_id)
);

-- 15. checkin_faqs
CREATE TABLE checkin_faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- 16. checkin_admin_audit_logs
CREATE TABLE checkin_admin_audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id VARCHAR(100) NOT NULL,
    admin_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    old_data JSONB,
    new_data JSONB,
    reason TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default Config Initialization
INSERT INTO checkin_configs (
    name, is_active, max_checkins_per_day, base_points, cycle_type, hero_title, hero_desc, checkin_button_text, after_checkin_text
) VALUES (
    'Default Check-in Program', true, 1, 10, 'MONTHLY', 'Điểm danh hằng ngày', 'Điểm danh mỗi ngày để nhận điểm Loyalty và nhiều phần thưởng hấp dẫn!', 'ĐIỂM DANH NGAY', 'Bạn đã điểm danh thành công!'
);

-- Initial 7-Day Cycle
INSERT INTO checkin_reward_cycles (name, days, cycle_type) VALUES ('Chuỗi điểm danh 7 ngày', 7, 'WEEKLY');

-- Cycle Items
INSERT INTO checkin_reward_cycle_items (cycle_id, day_number, reward_type, reward_value) VALUES 
(1, 1, 'POINTS', '10'),
(1, 2, 'POINTS', '10'),
(1, 3, 'POINTS', '15'),
(1, 4, 'POINTS', '15'),
(1, 5, 'POINTS', '20'),
(1, 6, 'POINTS', '20'),
(1, 7, 'VOUCHER', 'FREE_TOPPING_7DAYS');
