ALTER TABLE membership_tiers ADD COLUMN color VARCHAR(20);
ALTER TABLE membership_tiers ADD COLUMN icon VARCHAR(50);

-- Update existing default tiers with standard color and icon
UPDATE membership_tiers SET color = '#8E9AAF', icon = 'fa-medal' WHERE code = 'SILVER';
UPDATE membership_tiers SET color = '#D4A017', icon = 'fa-award' WHERE code = 'GOLD';
UPDATE membership_tiers SET color = '#6C7A89', icon = 'fa-gem' WHERE code = 'PLATINUM';
UPDATE membership_tiers SET color = '#2D9CDB', icon = 'fa-diamond' WHERE code = 'DIAMOND';
UPDATE membership_tiers SET color = '#5C3D2E', icon = 'fa-crown' WHERE code = 'MEMBER';
