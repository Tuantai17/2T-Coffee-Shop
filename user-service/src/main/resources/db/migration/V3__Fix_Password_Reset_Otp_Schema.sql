-- V3__Fix_Password_Reset_Otp_Schema.sql
-- 1. Nếu bảng có cả cột cũ và cột mới do lỗi ddl-auto, migrate dữ liệu sang cột chuẩn
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='password_reset_otp' AND column_name='otp_code') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='password_reset_otp' AND column_name='otp') THEN
        UPDATE password_reset_otp SET otp_code = otp WHERE otp_code IS NULL AND otp IS NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='password_reset_otp' AND column_name='expires_at') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='password_reset_otp' AND column_name='expiry_date') THEN
        UPDATE password_reset_otp SET expires_at = expiry_date WHERE expires_at IS NULL AND expiry_date IS NOT NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='password_reset_otp' AND column_name='used') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='password_reset_otp' AND column_name='is_used') THEN
        UPDATE password_reset_otp SET used = is_used WHERE used IS NULL AND is_used IS NOT NULL;
    END IF;
END $$;

-- 2. Đổi tên nếu cột đúng chưa tồn tại
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='password_reset_otp' AND column_name='otp_code') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='password_reset_otp' AND column_name='otp') THEN
        ALTER TABLE password_reset_otp RENAME COLUMN otp TO otp_code;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='password_reset_otp' AND column_name='expires_at') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='password_reset_otp' AND column_name='expiry_date') THEN
        ALTER TABLE password_reset_otp RENAME COLUMN expiry_date TO expires_at;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='password_reset_otp' AND column_name='used') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='password_reset_otp' AND column_name='is_used') THEN
        ALTER TABLE password_reset_otp RENAME COLUMN is_used TO used;
    END IF;
END $$;

-- 3. Xóa các cột sai lệch còn lại (nếu có)
ALTER TABLE password_reset_otp DROP COLUMN IF EXISTS otp;
ALTER TABLE password_reset_otp DROP COLUMN IF EXISTS expiry_date;
ALTER TABLE password_reset_otp DROP COLUMN IF EXISTS is_used;
