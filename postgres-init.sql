\set ON_ERROR_STOP on

SELECT 'CREATE DATABASE user_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'user_db') \gexec

SELECT 'CREATE DATABASE product_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'product_db') \gexec

SELECT 'CREATE DATABASE order_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'order_db') \gexec

SELECT 'CREATE DATABASE inventory_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inventory_db') \gexec

SELECT 'CREATE DATABASE payment_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'payment_db') \gexec

SELECT 'CREATE DATABASE delivery_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'delivery_db') \gexec

SELECT 'CREATE DATABASE loyalty_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'loyalty_db') \gexec

SELECT 'CREATE DATABASE game_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'game_db') \gexec

SELECT 'CREATE DATABASE revenue_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'revenue_db') \gexec

SELECT 'CREATE DATABASE recommendation_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'recommendation_db') \gexec
