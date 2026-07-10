-- V3: Seed beverage sample data

-- 1. Insert Categories (Tra sua, Ca phe)
INSERT INTO categories (name, description, slug, sort_order)
VALUES ('Ca Phe', 'Ca phe Viet Nam dam da', 'ca-phe', 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, description, slug, sort_order)
VALUES ('Tra Sua', 'Tra sua tran chau Dai Loan', 'tra-sua', 2)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Option Groups
INSERT INTO option_groups (id, name, is_required, is_multi_select)
SELECT 1, 'Da', true, false
WHERE NOT EXISTS (
    SELECT 1 FROM option_groups WHERE id = 1
);

INSERT INTO option_groups (id, name, is_required, is_multi_select)
SELECT 2, 'Duong', true, false
WHERE NOT EXISTS (
    SELECT 1 FROM option_groups WHERE id = 2
);

-- 3. Insert Options
INSERT INTO options (group_id, name, price_adjustment)
SELECT 1, '100% Da', 0
WHERE NOT EXISTS (
    SELECT 1 FROM options WHERE group_id = 1 AND name = '100% Da'
);

INSERT INTO options (group_id, name, price_adjustment)
SELECT 1, '50% Da', 0
WHERE NOT EXISTS (
    SELECT 1 FROM options WHERE group_id = 1 AND name = '50% Da'
);

INSERT INTO options (group_id, name, price_adjustment)
SELECT 1, '0% Da', 0
WHERE NOT EXISTS (
    SELECT 1 FROM options WHERE group_id = 1 AND name = '0% Da'
);

INSERT INTO options (group_id, name, price_adjustment)
SELECT 2, '100% Duong', 0
WHERE NOT EXISTS (
    SELECT 1 FROM options WHERE group_id = 2 AND name = '100% Duong'
);

INSERT INTO options (group_id, name, price_adjustment)
SELECT 2, '50% Duong', 0
WHERE NOT EXISTS (
    SELECT 1 FROM options WHERE group_id = 2 AND name = '50% Duong'
);

INSERT INTO options (group_id, name, price_adjustment)
SELECT 2, '0% Duong', 0
WHERE NOT EXISTS (
    SELECT 1 FROM options WHERE group_id = 2 AND name = '0% Duong'
);

-- 4. Insert Toppings
INSERT INTO toppings (id, name, price, image_url)
SELECT 1, 'Tran chau den', 10000, ''
WHERE NOT EXISTS (
    SELECT 1 FROM toppings WHERE id = 1
);

INSERT INTO toppings (id, name, price, image_url)
SELECT 2, 'Thach nha dam', 12000, ''
WHERE NOT EXISTS (
    SELECT 1 FROM toppings WHERE id = 2
);

-- 5. Insert Sample Product
INSERT INTO products (
    id, product_name, slug, price, category, availability, status, is_deleted
) VALUES (
    1001, 'Tra Sua Tran Chau Hoang Gia', 'tra-sua-tran-chau-hoang-gia', 35000, 'tra-sua', 100, 'ACTIVE', false
)
ON CONFLICT (slug) DO NOTHING;

-- 6. Insert Variants for Product 1001
INSERT INTO product_variants (product_id, size_name, price_adjustment)
SELECT 1001, 'Size S', 0
WHERE NOT EXISTS (
    SELECT 1 FROM product_variants WHERE product_id = 1001 AND size_name = 'Size S'
);

INSERT INTO product_variants (product_id, size_name, price_adjustment)
SELECT 1001, 'Size M', 10000
WHERE NOT EXISTS (
    SELECT 1 FROM product_variants WHERE product_id = 1001 AND size_name = 'Size M'
);

INSERT INTO product_variants (product_id, size_name, price_adjustment)
SELECT 1001, 'Size L', 15000
WHERE NOT EXISTS (
    SELECT 1 FROM product_variants WHERE product_id = 1001 AND size_name = 'Size L'
);

-- 7. Map Product 1001 to Option Groups and Toppings
INSERT INTO product_option_groups (product_id, group_id)
SELECT 1001, 1
WHERE NOT EXISTS (
    SELECT 1 FROM product_option_groups WHERE product_id = 1001 AND group_id = 1
);

INSERT INTO product_option_groups (product_id, group_id)
SELECT 1001, 2
WHERE NOT EXISTS (
    SELECT 1 FROM product_option_groups WHERE product_id = 1001 AND group_id = 2
);

INSERT INTO product_toppings (product_id, topping_id)
SELECT 1001, 1
WHERE NOT EXISTS (
    SELECT 1 FROM product_toppings WHERE product_id = 1001 AND topping_id = 1
);

INSERT INTO product_toppings (product_id, topping_id)
SELECT 1001, 2
WHERE NOT EXISTS (
    SELECT 1 FROM product_toppings WHERE product_id = 1001 AND topping_id = 2
);
