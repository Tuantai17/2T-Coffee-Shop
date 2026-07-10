UPDATE options
SET display_order = CASE
    WHEN group_id = 1 AND name = '100% Da' THEN 1
    WHEN group_id = 1 AND name = '50% Da' THEN 2
    WHEN group_id = 1 AND name = '0% Da' THEN 3
    WHEN group_id = 2 AND name = '100% Duong' THEN 1
    WHEN group_id = 2 AND name = '50% Duong' THEN 2
    WHEN group_id = 2 AND name = '0% Duong' THEN 3
    ELSE COALESCE(display_order, 0)
END
WHERE display_order IS NULL
   OR display_order = 0;
