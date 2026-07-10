CREATE TABLE daily_revenue (
    date DATE PRIMARY KEY,
    total_orders BIGINT NOT NULL DEFAULT 0,
    total_revenue NUMERIC(19, 2) NOT NULL DEFAULT 0.00,
    delivery_revenue NUMERIC(19, 2) NOT NULL DEFAULT 0.00,
    pickup_revenue NUMERIC(19, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_stats (
    product_id BIGINT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    total_quantity BIGINT NOT NULL DEFAULT 0,
    total_revenue NUMERIC(19, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE topping_stats (
    topping_id BIGINT PRIMARY KEY,
    topping_name VARCHAR(255) NOT NULL,
    total_quantity BIGINT NOT NULL DEFAULT 0,
    total_revenue NUMERIC(19, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE interaction_stats (
    date DATE PRIMARY KEY,
    checkin_count BIGINT NOT NULL DEFAULT 0,
    minigame_count BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE processed_events (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL UNIQUE,
    event_type VARCHAR(50) NOT NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
