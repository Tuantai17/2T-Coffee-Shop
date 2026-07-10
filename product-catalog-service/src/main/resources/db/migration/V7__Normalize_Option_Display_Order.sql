WITH ranked_options AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY group_id
            ORDER BY
                CASE
                    WHEN name LIKE '100%%' THEN 1
                    WHEN name LIKE '75%%' THEN 2
                    WHEN name LIKE '50%%' THEN 3
                    WHEN name LIKE '0%%' THEN 4
                    ELSE 999
                END,
                id
        ) AS normalized_display_order
    FROM options
)
UPDATE options AS target
SET display_order = ranked_options.normalized_display_order
FROM ranked_options
WHERE target.id = ranked_options.id
  AND COALESCE(target.display_order, 0) <> ranked_options.normalized_display_order;
