-- ============================================================================
-- SUN POWERS BATTERY MANAGEMENT SYSTEM
-- Database Schema Updates for Spare Battery Allocation Feature
-- ============================================================================
-- Date: 2024
-- Purpose: Update database to support new spare battery allocation features
-- ============================================================================

-- ============================================================================
-- 1. UPDATE BATTERIES TABLE - Add new fields for automatic date tracking
-- ============================================================================

ALTER TABLE batteries ADD COLUMN IF NOT EXISTS go_to_spare_date DATE COMMENT 'Automatic date when battery is given to customer as spare';

ALTER TABLE batteries ADD COLUMN IF NOT EXISTS auto_return_date DATE COMMENT 'Automatic date when battery is returned by customer';

ALTER TABLE batteries ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) COMMENT 'Customer mobile number for spare battery allocation';

-- ============================================================================
-- 2. UPDATE BATTERIES TABLE - Modify spare_status ENUM values
-- ============================================================================

-- Change the spare_status column from ('available','allocated','returned','claimed') 
-- to ('available','go_to_spare','returned','claimed')
ALTER TABLE batteries MODIFY COLUMN spare_status ENUM(
  'available', 
  'go_to_spare',    -- Changed from 'allocated' to 'go_to_spare'
  'returned', 
  'claimed'
) DEFAULT 'available' COMMENT 'Status of spare battery: available, go_to_spare, returned, or claimed';

-- ============================================================================
-- 3. Add Indexes for better query performance
-- ============================================================================

-- Index for finding spare batteries by status
CREATE INDEX IF NOT EXISTS idx_batteries_spare_status ON batteries(spare_status);

-- Index for finding spare batteries by customer
CREATE INDEX IF NOT EXISTS idx_batteries_allocated_customer ON batteries(allocated_to_customer_id);

-- Index for finding spare batteries by go_to_spare_date
CREATE INDEX IF NOT EXISTS idx_batteries_go_to_spare_date ON batteries(go_to_spare_date);

-- Index for finding spare batteries by auto_return_date
CREATE INDEX IF NOT EXISTS idx_batteries_auto_return_date ON batteries(auto_return_date);

-- ============================================================================
-- 4. UPDATE DATA - Convert existing 'allocated' status to 'go_to_spare'
-- ============================================================================

UPDATE batteries 
SET spare_status = 'go_to_spare' 
WHERE spare_status = 'allocated';

-- ============================================================================
-- 5. DATA MIGRATION - Set automatic dates based on allocated_date
-- ============================================================================

-- Populate go_to_spare_date from allocated_date for existing allocations
UPDATE batteries 
SET go_to_spare_date = allocated_date 
WHERE go_to_spare_date IS NULL 
AND allocated_date IS NOT NULL 
AND spare_status = 'go_to_spare';

-- Populate auto_return_date from return_date for existing returns
UPDATE batteries 
SET auto_return_date = return_date 
WHERE auto_return_date IS NULL 
AND return_date IS NOT NULL 
AND spare_status = 'returned';

-- ============================================================================
-- 6. CREATE VIEW - Spare Battery Allocation Summary
-- ============================================================================

CREATE OR REPLACE VIEW v_spare_battery_allocations AS
SELECT 
  b.id,
  b.battery_code,
  b.battery_model,
  b.battery_serial,
  b.brand,
  b.capacity,
  b.spare_status,
  b.allocated_to_customer_id,
  b.allocated_date,
  b.go_to_spare_date,
  b.return_date,
  b.auto_return_date,
  b.customer_phone,
  c.full_name AS customer_name,
  c.phone AS customer_contact,
  c.city,
  DATEDIFF(CURDATE(), b.go_to_spare_date) AS days_allocated,
  CASE 
    WHEN b.spare_status = 'go_to_spare' AND b.go_to_spare_date IS NOT NULL 
    THEN DATEDIFF(CURDATE(), b.go_to_spare_date)
    ELSE NULL
  END AS days_with_customer
FROM batteries b
LEFT JOIN customers c ON b.allocated_to_customer_id = c.id
WHERE b.is_spare = 1
ORDER BY b.go_to_spare_date DESC;

-- ============================================================================
-- 7. CREATE STORED PROCEDURES - Spare Battery Management
-- ============================================================================

-- Procedure: Allocate spare battery to customer
DELIMITER //

CREATE PROCEDURE sp_allocate_spare_battery(
  IN p_battery_id INT,
  IN p_customer_id INT,
  IN p_allocation_date DATE,
  IN p_expected_return_date DATE,
  IN p_customer_phone VARCHAR(20),
  IN p_notes TEXT
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SELECT 'Error: Could not allocate spare battery' AS message;
  END;
  
  START TRANSACTION;
  
  UPDATE batteries 
  SET 
    spare_status = 'go_to_spare',
    allocated_to_customer_id = p_customer_id,
    allocated_date = p_allocation_date,
    go_to_spare_date = CURDATE(),
    customer_phone = p_customer_phone,
    notes = CONCAT(notes, '\n', p_notes)
  WHERE id = p_battery_id;
  
  -- Log the activity
  INSERT INTO activities (type, description, timestamp, status)
  VALUES (
    'spare_battery',
    CONCAT('Spare battery allocated to customer ID: ', p_customer_id, ' on ', CURDATE()),
    NOW(),
    'success'
  );
  
  COMMIT;
  SELECT 'Spare battery allocated successfully' AS message;
END //

DELIMITER ;

-- Procedure: Return spare battery from customer
DELIMITER //

CREATE PROCEDURE sp_return_spare_battery(
  IN p_battery_id INT
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SELECT 'Error: Could not return spare battery' AS message;
  END;
  
  START TRANSACTION;
  
  UPDATE batteries 
  SET 
    spare_status = 'returned',
    return_date = CURDATE(),
    auto_return_date = CURDATE(),
    notes = CONCAT(notes, '\n', 'Returned by customer on ', CURDATE())
  WHERE id = p_battery_id;
  
  -- Log the activity
  INSERT INTO activities (type, description, timestamp, status)
  VALUES (
    'spare_battery',
    CONCAT('Spare battery returned on ', CURDATE()),
    NOW(),
    'success'
  );
  
  COMMIT;
  SELECT 'Spare battery returned successfully' AS message;
END //

DELIMITER ;

-- ============================================================================
-- 8. CREATE REPORTS - Spare Battery Analytics
-- ============================================================================

-- Report: Overdue spare batteries (not returned within expected time)
SELECT 
  'OVERDUE_BATTERIES' AS report_type,
  b.battery_code,
  b.battery_model,
  c.full_name AS customer_name,
  c.phone AS customer_phone,
  b.allocated_date,
  b.go_to_spare_date,
  DATEDIFF(CURDATE(), b.go_to_spare_date) AS days_overdue,
  b.customer_phone
FROM batteries b
LEFT JOIN customers c ON b.allocated_to_customer_id = c.id
WHERE b.spare_status = 'go_to_spare' 
AND b.go_to_spare_date IS NOT NULL
AND DATEDIFF(CURDATE(), b.go_to_spare_date) > 30
ORDER BY days_overdue DESC;

-- ============================================================================
-- 9. DOCUMENTATION AND FIELD MAPPING
-- ============================================================================

/*
FIELD MAPPING AND CHANGES:

OLD SYSTEM:
- spare_status: 'allocated' → means battery is with customer
- allocated_date: Date battery was given to customer
- return_date: Date battery was returned

NEW SYSTEM:
- spare_status: 'go_to_spare' → means battery is with customer (renamed from 'allocated')
- allocated_date: Original allocation date (unchanged)
- go_to_spare_date: Auto-tracked current date when status changes to 'go_to_spare'
- return_date: Expected/original return date (unchanged)
- auto_return_date: Auto-tracked current date when status changes to 'returned'
- customer_phone: Customer mobile number (new field for easy reference)

STATUS VALUES:
1. 'available' - Spare battery is available in inventory
2. 'go_to_spare' - Spare battery is currently with customer (allocated)
3. 'returned' - Spare battery has been returned by customer
4. 'claimed' - Spare battery is involved in a claim process

API ENDPOINT CHANGES:
PUT /api/batteries.php
Required fields:
  - id: battery ID
  - spare_status: new status ('go_to_spare' or 'returned')
  - allocated_to_customer_id: customer ID (for go_to_spare)
  - customer_phone: customer phone (for go_to_spare)
  - go_to_spare_date: auto-set by API to CURDATE()
  - auto_return_date: auto-set by API to CURDATE() when returning

TRIGGERS (RECOMMENDED):
- Create BEFORE UPDATE trigger to auto-populate go_to_spare_date
- Create BEFORE UPDATE trigger to auto-populate auto_return_date
*/

-- ============================================================================
-- 10. CREATE TRIGGER - Auto-populate go_to_spare_date
-- ============================================================================

DELIMITER //

CREATE TRIGGER tr_auto_go_to_spare_date
BEFORE UPDATE ON batteries
FOR EACH ROW
BEGIN
  IF NEW.spare_status = 'go_to_spare' AND OLD.spare_status != 'go_to_spare' THEN
    SET NEW.go_to_spare_date = CURDATE();
  END IF;
END //

DELIMITER ;

-- ============================================================================
-- 11. CREATE TRIGGER - Auto-populate auto_return_date
-- ============================================================================

DELIMITER //

CREATE TRIGGER tr_auto_return_date
BEFORE UPDATE ON batteries
FOR EACH ROW
BEGIN
  IF NEW.spare_status = 'returned' AND OLD.spare_status != 'returned' THEN
    SET NEW.auto_return_date = CURDATE();
  END IF;
END //

DELIMITER ;

-- ============================================================================
-- 12. VERIFICATION QUERIES - Run these to verify updates
-- ============================================================================

-- Check if columns exist
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'batteries'
AND COLUMN_NAME IN ('go_to_spare_date', 'auto_return_date', 'customer_phone');

-- Check updated spare_status enum values
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'batteries' 
AND COLUMN_NAME = 'spare_status';

-- Check indexes created
SELECT INDEX_NAME 
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_NAME = 'batteries'
AND INDEX_NAME LIKE 'idx_%';

-- Check spare battery allocation data
SELECT 
  id, 
  battery_code, 
  battery_model,
  spare_status,
  allocated_to_customer_id,
  allocated_date,
  go_to_spare_date,
  return_date,
  auto_return_date,
  customer_phone
FROM batteries 
WHERE is_spare = 1
LIMIT 10;

-- ============================================================================
-- END OF MIGRATION SCRIPT
-- ============================================================================
