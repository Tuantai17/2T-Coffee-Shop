-- V1: Initial Catalog Schema (Toy Domain Baseline)

CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE,
    image_url VARCHAR(255),
    parent_id BIGINT,
    sort_order INT
);

CREATE TABLE IF NOT EXISTS collections (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE,
    image_url VARCHAR(255),
    sort_order INT
);

CREATE TABLE IF NOT EXISTS menus (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255),
    location VARCHAR(255),
    sort_order INT,
    parent_id BIGINT,
    url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS post_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    sort_order INT
);

CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    summary TEXT,
    content TEXT,
    cover_image VARCHAR(255),
    status VARCHAR(50),
    author_id BIGINT,
    category_id BIGINT,
    published_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    sku VARCHAR(255),
    brand VARCHAR(255),
    price NUMERIC(19, 2) NOT NULL,
    original_price NUMERIC(19, 2),
    discription TEXT,
    short_description VARCHAR(500),
    category VARCHAR(255) NOT NULL,
    availability INT NOT NULL,
    image_url VARCHAR(255),
    status VARCHAR(255),
    badge VARCHAR(255),
    tags VARCHAR(255),
    age_min INT,
    age_max INT,
    is_featured BOOLEAN,
    is_new_arrival BOOLEAN,
    is_on_sale BOOLEAN,
    on_sale_order INT DEFAULT 0,
    new_arrival_order INT DEFAULT 0,
    featured_order INT DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(255),
    delete_reason VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS product_images (
    product_id BIGINT NOT NULL,
    image_url VARCHAR(255),
    sort_order INT,
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id)
);
