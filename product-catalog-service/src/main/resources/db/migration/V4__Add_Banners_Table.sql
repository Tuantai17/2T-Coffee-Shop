-- V4: Add Banners Table

CREATE TABLE IF NOT EXISTS banners (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255),
    subtitle VARCHAR(1000),
    image_url VARCHAR(2000),
    target_url VARCHAR(255),
    position VARCHAR(255),
    sort_order INT,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
