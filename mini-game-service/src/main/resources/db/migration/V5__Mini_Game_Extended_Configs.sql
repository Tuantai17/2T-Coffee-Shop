ALTER TABLE mini_games ADD COLUMN ui_config TEXT;
ALTER TABLE mini_games ADD COLUMN theme_config TEXT;
ALTER TABLE mini_games ADD COLUMN reward_config TEXT;
ALTER TABLE mini_games ADD COLUMN analytics_config TEXT;
ALTER TABLE mini_games ADD COLUMN publish_state VARCHAR(20) DEFAULT 'DRAFT';
