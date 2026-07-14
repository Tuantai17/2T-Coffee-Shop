CREATE TABLE IF NOT EXISTS store_contact_information (
    id BIGSERIAL PRIMARY KEY,
    phone VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    google_maps_url TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
