-- ============================================================================
-- QUICK SQL COMMANDS FOR SPARE BATTERY FEATURE IMPLEMENTATION
-- ============================================================================

-- 1. ADD NEW COLUMNS (CRITICAL - Run First)
ALTER TABLE batteries ADD COLUMN IF NOT EXISTS go_to_spare_date DATE COMMENT 'Auto date when battery given to customer';
ALTER TABLE batteries ADD COLUMN IF NOT EXISTS auto_return_date DATE COMMENT 'Auto date when battery returned';
ALTER TABLE batteries ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) COMMENT 'Customer mobile number';
ALTER TABLE batteries ADD COLUMN IF NOT EXISTS expected_return_date DATE COMMENT 'Expected return date';

-- 2. UPDATE ENUM VALUES (CRITICAL - Run Second)
ALTER TABLE batteries MODIFY COLUMN spare_status ENUM('available', 'go_to_spare', 'returned', 'claimed') DEFAULT 'available';

-- 3. DATA MIGRATION (Optional but recommended)
UPDATE batteries SET spare_status = 'go_to_spare' WHERE spare_status = 'allocated';
UPDATE batteries SET go_to_spare_date = allocated_date WHERE go_to_spare_date IS NULL AND allocated_date IS NOT NULL AND spare_status = 'go_to_spare';
UPDATE batteries SET auto_return_date = return_date WHERE auto_return_date IS NULL AND return_date IS NOT NULL AND spare_status = 'returned';

-- 4. CREATE INDEXES (For performance)
CREATE INDEX idx_batteries_spare_status ON batteries(spare_status);
CREATE INDEX idx_batteries_allocated_customer ON batteries(allocated_to_customer_id);
CREATE INDEX idx_batteries_go_to_spare_date ON batteries(go_to_spare_date);
CREATE INDEX idx_batteries_auto_return_date ON batteries(auto_return_date);

-- 5. VERIFY CHANGES
DESC batteries;
SELECT spare_status FROM batteries LIMIT 1;
SHOW INDEX FROM batteries WHERE Key_name LIKE 'idx_%';

-- ============================================================================
-- OPTIONAL: Create Triggers for Automatic Date Population
-- ============================================================================

DELIMITER //

CREATE TRIGGER tr_auto_go_to_spare_date
BEFORE UPDATE ON batteries
FOR EACH ROW
BEGIN
  IF NEW.spare_status = 'go_to_spare' AND IFNULL(OLD.spare_status, '') != 'go_to_spare' THEN
    SET NEW.go_to_spare_date = CURDATE();
  END IF;
END //

CREATE TRIGGER tr_auto_return_date
BEFORE UPDATE ON batteries
FOR EACH ROW
BEGIN
  IF NEW.spare_status = 'returned' AND IFNULL(OLD.spare_status, '') != 'returned' THEN
    SET NEW.auto_return_date = CURDATE();
  END IF;
END //

DELIMITER ;

-- ============================================================================
-- VERIFY TRIGGERS
-- ============================================================================

SHOW TRIGGERS WHERE `Trigger` LIKE 'tr_auto%';

-- ============================================================================
-- OPTIONAL: Create Reporting View
-- ============================================================================

CREATE OR REPLACE VIEW v_spare_battery_summary AS
SELECT 
  b.id,
  b.battery_code,
  b.battery_model,
  b.battery_serial,
  b.brand,
  b.capacity,
  b.spare_status,
  b.allocated_to_customer_id,
  b.customer_phone,
  b.allocated_date,
  b.go_to_spare_date,
  b.return_date,
  b.auto_return_date,
  c.full_name AS customer_name,
  c.phone AS customer_contact,
  DATEDIFF(CURDATE(), b.go_to_spare_date) AS days_with_customer,
  CASE 
    WHEN b.spare_status = 'go_to_spare' THEN DATEDIFF(CURDATE(), b.go_to_spare_date)
    ELSE NULL
  END AS overdue_days
FROM batteries b
LEFT JOIN customers c ON b.allocated_to_customer_id = c.id
WHERE b.is_spare = 1
ORDER BY b.go_to_spare_date DESC;

-- ============================================================================
-- SAMPLE QUERIES FOR TESTING
-- ============================================================================

-- View all spare batteries with their status
SELECT id, battery_code, battery_model, spare_status, customer_phone, go_to_spare_date, auto_return_date 
FROM batteries 
WHERE is_spare = 1 
ORDER BY go_to_spare_date DESC;

-- Find batteries currently with customers (go_to_spare status)
SELECT battery_code, battery_model, customer_phone, go_to_spare_date, 
       DATEDIFF(CURDATE(), go_to_spare_date) AS days_with_customer
FROM batteries 
WHERE spare_status = 'go_to_spare'
ORDER BY go_to_spare_date;

-- Find returned batteries
SELECT battery_code, battery_model, customer_phone, auto_return_date
FROM batteries 
WHERE spare_status = 'returned' 
ORDER BY auto_return_date DESC;

-- Find available batteries
SELECT battery_code, battery_model, capacity 
FROM batteries 
WHERE spare_status = 'available' AND is_spare = 1
ORDER BY battery_code;

-- Check for overdue batteries (more than 30 days)
SELECT battery_code, battery_model, customer_phone, go_to_spare_date,
       DATEDIFF(CURDATE(), go_to_spare_date) AS days_overdue
FROM batteries 
WHERE spare_status = 'go_to_spare' 
AND DATEDIFF(CURDATE(), go_to_spare_date) > 30
ORDER BY days_overdue DESC;

-- ============================================================================
-- IF YOU NEED TO REVERT CHANGES (Undo)
-- ============================================================================

-- Drop triggers (if needed)
-- DROP TRIGGER IF EXISTS tr_auto_go_to_spare_date;
-- DROP TRIGGER IF EXISTS tr_auto_return_date;

-- Revert enum values (only if absolutely necessary)
-- UPDATE batteries SET spare_status = 'allocated' WHERE spare_status = 'go_to_spare';
-- ALTER TABLE batteries MODIFY COLUMN spare_status ENUM('available', 'allocated', 'returned', 'claimed');

-- Drop columns (only if absolutely necessary)
-- ALTER TABLE batteries DROP COLUMN IF EXISTS go_to_spare_date;
-- ALTER TABLE batteries DROP COLUMN IF EXISTS auto_return_date;
-- ALTER TABLE batteries DROP COLUMN IF EXISTS customer_phone;
-- ALTER TABLE batteries DROP COLUMN IF EXISTS expected_return_date;

-- ============================================================================
-- RECOMMENDED: Backup before making changes
-- ============================================================================

-- Backup batteries table (execute before any modifications)
-- CREATE TABLE batteries_backup_2024 AS SELECT * FROM batteries;

-- ============================================================================
-- END OF SQL REFERENCE
-- ============================================================================
