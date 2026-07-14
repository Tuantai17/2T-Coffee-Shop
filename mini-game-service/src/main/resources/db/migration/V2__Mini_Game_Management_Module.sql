CREATE TABLE IF NOT EXISTS mini_games (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE,
    code VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(40) NOT NULL,
    thumbnail_url VARCHAR(500),
    banner_url VARCHAR(500),
    short_description VARCHAR(500),
    description TEXT,
    rules TEXT,
    daily_play_limit INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    version VARCHAR(30) NOT NULL DEFAULT 'v1.0.0',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mini_games_type ON mini_games(type);
CREATE INDEX IF NOT EXISTS idx_mini_games_status ON mini_games(status);
CREATE INDEX IF NOT EXISTS idx_mini_games_visible ON mini_games(is_visible);
CREATE INDEX IF NOT EXISTS idx_mini_games_deleted ON mini_games(is_deleted);

CREATE TABLE IF NOT EXISTS game_rewards (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES mini_games(id),
    reward_name VARCHAR(150) NOT NULL,
    reward_type VARCHAR(30) NOT NULL,
    point_value BIGINT,
    voucher_id VARCHAR(100),
    probability NUMERIC(5,2) NOT NULL DEFAULT 0,
    total_quantity INT NOT NULL DEFAULT 0,
    remaining_quantity INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_game_rewards_game_id ON game_rewards(game_id);
CREATE INDEX IF NOT EXISTS idx_game_rewards_status ON game_rewards(status);

CREATE TABLE IF NOT EXISTS game_play_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    game_id BIGINT NOT NULL REFERENCES mini_games(id),
    reward_id BIGINT REFERENCES game_rewards(id),
    score INT,
    point_earned BIGINT,
    voucher_id VARCHAR(100),
    result VARCHAR(30) NOT NULL,
    play_data_json TEXT,
    device_info VARCHAR(255),
    ip_address VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
    played_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_game_play_sessions_game_id ON game_play_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_play_sessions_user_id ON game_play_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_play_sessions_played_at ON game_play_sessions(played_at);

CREATE TABLE IF NOT EXISTS game_user_limits (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    game_id BIGINT NOT NULL REFERENCES mini_games(id),
    play_date DATE NOT NULL,
    used_count INT NOT NULL DEFAULT 0,
    max_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_game_user_limit UNIQUE (user_id, game_id, play_date)
);

CREATE INDEX IF NOT EXISTS idx_game_user_limits_game_id ON game_user_limits(game_id);
CREATE INDEX IF NOT EXISTS idx_game_user_limits_user_id ON game_user_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_game_user_limits_play_date ON game_user_limits(play_date);

INSERT INTO mini_games (
    name,
    slug,
    code,
    type,
    thumbnail_url,
    banner_url,
    short_description,
    description,
    rules,
    daily_play_limit,
    status,
    is_visible,
    is_featured,
    version,
    created_by,
    updated_by
)
SELECT
    'Memory Match',
    'memory-match',
    'MEMORY_MATCH',
    'MEMORY_MATCH',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&q=80',
    'Lật thẻ và tìm đủ cặp hình để nhận điểm hoặc voucher.',
    'Memory Match là mini game ghi nhớ vị trí thẻ. Người chơi cần hoàn thành bàn chơi trong thời gian ngắn nhất để nhận phần thưởng ngẫu nhiên.',
    '1. Mỗi ngày có tối đa 5 lượt chơi. 2. Hoàn thành bàn chơi để mở thưởng. 3. Phần thưởng được chọn ngẫu nhiên theo xác suất đã cấu hình.',
    5,
    'ACTIVE',
    TRUE,
    TRUE,
    'v1.0.0',
    'seed',
    'seed'
WHERE NOT EXISTS (
    SELECT 1 FROM mini_games WHERE code = 'MEMORY_MATCH'
);

INSERT INTO mini_games (
    name,
    slug,
    code,
    type,
    thumbnail_url,
    banner_url,
    short_description,
    description,
    rules,
    daily_play_limit,
    status,
    is_visible,
    is_featured,
    version,
    created_by,
    updated_by
)
SELECT
    'Lucky Spin',
    'lucky-spin',
    'LUCKY_SPIN',
    'LUCKY_SPIN',
    'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1400&q=80',
    'Quay vòng may mắn để săn điểm và voucher mỗi ngày.',
    'Lucky Spin là mini game quay thưởng nhanh. Mỗi lượt quay sẽ trả về phần thưởng theo cấu hình xác suất và tồn kho phần thưởng.',
    '1. Mỗi ngày có tối đa 1 lượt quay. 2. Hệ thống quay thưởng theo xác suất cấu hình. 3. Một số lượt có thể không trúng phần thưởng.',
    1,
    'ACTIVE',
    TRUE,
    TRUE,
    'v1.0.0',
    'seed',
    'seed'
WHERE NOT EXISTS (
    SELECT 1 FROM mini_games WHERE code = 'LUCKY_SPIN'
);

INSERT INTO game_rewards (game_id, reward_name, reward_type, point_value, voucher_id, probability, total_quantity, remaining_quantity, status)
SELECT mg.id, seed.reward_name, seed.reward_type, seed.point_value, seed.voucher_id, seed.probability, seed.total_quantity, seed.remaining_quantity, seed.status
FROM mini_games mg
JOIN (
    VALUES
        ('MEMORY_MATCH', '10 điểm', 'POINT', 10::BIGINT, NULL::VARCHAR, 45.00::NUMERIC, 1000, 245, 'ACTIVE'),
        ('MEMORY_MATCH', '20 điểm', 'POINT', 20::BIGINT, NULL::VARCHAR, 30.00::NUMERIC, 1000, 430, 'ACTIVE'),
        ('MEMORY_MATCH', '50 điểm', 'POINT', 50::BIGINT, NULL::VARCHAR, 15.00::NUMERIC, 500, 150, 'ACTIVE'),
        ('MEMORY_MATCH', 'Voucher 30K', 'VOUCHER', NULL::BIGINT, 'TIER_UPGRADE_30K', 7.00::NUMERIC, 300, 50, 'ACTIVE'),
        ('MEMORY_MATCH', 'Voucher 50K', 'VOUCHER', NULL::BIGINT, 'TIER_UPGRADE_50K', 3.00::NUMERIC, 200, 20, 'ACTIVE'),
        ('LUCKY_SPIN', '20 điểm', 'POINT', 20::BIGINT, NULL::VARCHAR, 25.00::NUMERIC, 1000, 320, 'ACTIVE'),
        ('LUCKY_SPIN', '50 điểm', 'POINT', 50::BIGINT, NULL::VARCHAR, 20.00::NUMERIC, 800, 150, 'ACTIVE'),
        ('LUCKY_SPIN', '100 điểm', 'POINT', 100::BIGINT, NULL::VARCHAR, 10.00::NUMERIC, 500, 90, 'ACTIVE'),
        ('LUCKY_SPIN', 'Voucher 30K', 'VOUCHER', NULL::BIGINT, 'TIER_UPGRADE_30K', 8.00::NUMERIC, 250, 35, 'ACTIVE'),
        ('LUCKY_SPIN', 'Voucher 50K', 'VOUCHER', NULL::BIGINT, 'TIER_UPGRADE_50K', 5.00::NUMERIC, 180, 18, 'ACTIVE'),
        ('LUCKY_SPIN', 'Freeship', 'VOUCHER', NULL::BIGINT, 'TIER_FREESHIP', 2.00::NUMERIC, 500, 200, 'ACTIVE')
) AS seed(game_code, reward_name, reward_type, point_value, voucher_id, probability, total_quantity, remaining_quantity, status)
    ON seed.game_code = mg.code
WHERE NOT EXISTS (
    SELECT 1
    FROM game_rewards gr
    WHERE gr.game_id = mg.id
      AND gr.reward_name = seed.reward_name
      AND COALESCE(gr.voucher_id, '') = COALESCE(seed.voucher_id, '')
);
