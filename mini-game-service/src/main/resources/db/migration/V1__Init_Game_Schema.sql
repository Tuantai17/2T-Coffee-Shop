CREATE TABLE game_levels (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    rows INT NOT NULL,
    cols INT NOT NULL,
    time_limit_seconds INT NOT NULL,
    reward_points BIGINT NOT NULL DEFAULT 0,
    reward_voucher VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE game_sessions (
    id VARCHAR(50) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    level_id BIGINT NOT NULL,
    deck_layout TEXT NOT NULL, -- JSON array of cards
    status VARCHAR(30) NOT NULL, -- PLAYING, WON, LOST, ABANDONED
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    reward_type VARCHAR(30), -- POINTS, VOUCHER
    reward_value VARCHAR(50),
    moves INT DEFAULT 0,
    time_taken_seconds INT,
    FOREIGN KEY (level_id) REFERENCES game_levels(id)
);

CREATE TABLE processed_events (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL UNIQUE,
    event_type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100),
    status VARCHAR(30) NOT NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed Levels
INSERT INTO game_levels (name, code, rows, cols, time_limit_seconds, reward_points) VALUES
('Dễ', 'EASY', 4, 4, 60, 10),
('Trung Bình', 'MEDIUM', 4, 5, 90, 25),
('Khó', 'HARD', 4, 6, 120, 50);
