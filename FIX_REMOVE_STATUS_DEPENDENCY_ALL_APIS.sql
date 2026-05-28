-- Purpose:
-- Remove service_orders trigger dependency on non-existent NEW.status
-- so create/update APIs work without requiring a `status` column.

-- 1) Drop triggers that reference NEW.status
DROP TRIGGER IF EXISTS `trg_fix_battery_statuses_json_ins`;
DROP TRIGGER IF EXISTS `trg_fix_battery_statuses_json_upd`;
DROP TRIGGER IF EXISTS `trg_service_orders_fix_status_json_ins`;
DROP TRIGGER IF EXISTS `trg_service_orders_fix_status_json_upd`;

-- 2) Recreate safe triggers (no NEW.status usage)
DELIMITER $$

CREATE TRIGGER `trg_fix_battery_statuses_json_ins`
BEFORE INSERT ON `service_orders`
FOR EACH ROW
BEGIN
  IF NEW.battery_statuses_json IS NOT NULL THEN
    SET NEW.battery_statuses_json = REPLACE(NEW.battery_statuses_json, '"service_status":"null"', '"service_status":"pending"');
    SET NEW.battery_statuses_json = REPLACE(NEW.battery_statuses_json, '"service_status":"shop"', '"service_status":"pending"');
    SET NEW.battery_statuses_json = REPLACE(NEW.battery_statuses_json, '"service_status":"company"', '"service_status":"pending"');
    SET NEW.battery_statuses_json = REPLACE(NEW.battery_statuses_json, '"service_status":"suntocomp"', '"service_status":"pending"');
    SET NEW.battery_statuses_json = REPLACE(NEW.battery_statuses_json, '"service_status":"comptosun"', '"service_status":"pending"');
  END IF;
END$$

CREATE TRIGGER `trg_fix_battery_statuses_json_upd`
BEFORE UPDATE ON `service_orders`
FOR EACH ROW
BEGIN
  IF NEW.battery_statuses_json IS NOT NULL THEN
    SET NEW.battery_statuses_json = REPLACE(NEW.battery_statuses_json, '"service_status":"null"', '"service_status":"pending"');
    SET NEW.battery_statuses_json = REPLACE(NEW.battery_statuses_json, '"service_status":"shop"', '"service_status":"pending"');
    SET NEW.battery_statuses_json = REPLACE(NEW.battery_statuses_json, '"service_status":"company"', '"service_status":"pending"');
    SET NEW.battery_statuses_json = REPLACE(NEW.battery_statuses_json, '"service_status":"suntocomp"', '"service_status":"pending"');
    SET NEW.battery_statuses_json = REPLACE(NEW.battery_statuses_json, '"service_status":"comptosun"', '"service_status":"pending"');
  END IF;
END$$

CREATE TRIGGER `trg_service_orders_fix_status_json_ins`
BEFORE INSERT ON `service_orders`
FOR EACH ROW
BEGIN
  IF NEW.battery_statuses_json IS NOT NULL THEN
    SET NEW.battery_statuses_json = REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(NEW.battery_statuses_json,
            '"service_status":"null"', '"service_status":"pending"'
          ),
          '"service_status": "null"', '"service_status":"pending"'
        ),
        '"service_status":null', '"service_status":"pending"'
      ),
      '"service_status": null', '"service_status":"pending"'
    );
  END IF;
END$$

CREATE TRIGGER `trg_service_orders_fix_status_json_upd`
BEFORE UPDATE ON `service_orders`
FOR EACH ROW
BEGIN
  IF NEW.battery_statuses_json IS NOT NULL THEN
    SET NEW.battery_statuses_json = REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(NEW.battery_statuses_json,
            '"service_status":"null"', '"service_status":"pending"'
          ),
          '"service_status": "null"', '"service_status":"pending"'
        ),
        '"service_status":null', '"service_status":"pending"'
      ),
      '"service_status": null', '"service_status":"pending"'
    );
  END IF;
END$$

DELIMITER ;
