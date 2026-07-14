CREATE TABLE IF NOT EXISTS game_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL,
    actor_id BIGINT,
    action_type VARCHAR(80) NOT NULL,
    action_detail TEXT,
    metadata_json TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_game_activity_logs_game
        FOREIGN KEY (game_id) REFERENCES mini_games(id)
);

CREATE INDEX IF NOT EXISTS idx_game_activity_logs_game_id_created_at
    ON game_activity_logs(game_id, created_at DESC);
