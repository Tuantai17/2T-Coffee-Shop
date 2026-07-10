-- V2: Beverage Domain Schema Expansion

-- Variants (Sizes like S, M, L)
CREATE TABLE IF NOT EXISTS product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    size_name VARCHAR(50) NOT NULL,
    price_adjustment NUMERIC(19, 2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Option Groups (Ice Level, Sugar Level)
CREATE TABLE IF NOT EXISTS option_groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    is_multi_select BOOLEAN NOT NULL DEFAULT FALSE
);

-- Options (100% Ice, 50% Sugar, etc.)
CREATE TABLE IF NOT EXISTS options (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price_adjustment NUMERIC(19, 2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_options_group FOREIGN KEY (group_id) REFERENCES option_groups(id) ON DELETE CASCADE
);

-- Mapping Products to Option Groups
CREATE TABLE IF NOT EXISTS product_option_groups (
    product_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    PRIMARY KEY (product_id, group_id),
    CONSTRAINT fk_pog_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_pog_group FOREIGN KEY (group_id) REFERENCES option_groups(id) ON DELETE CASCADE
);

-- Toppings
CREATE TABLE IF NOT EXISTS toppings (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(19, 2) NOT NULL DEFAULT 0,
    image_url VARCHAR(255)
);

-- Mapping Products to available Toppings
CREATE TABLE IF NOT EXISTS product_toppings (
    product_id BIGINT NOT NULL,
    topping_id BIGINT NOT NULL,
    PRIMARY KEY (product_id, topping_id),
    CONSTRAINT fk_pt_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_pt_topping FOREIGN KEY (topping_id) REFERENCES toppings(id) ON DELETE CASCADE
);
