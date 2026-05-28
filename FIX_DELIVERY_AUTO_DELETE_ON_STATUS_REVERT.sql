-- Fix: keep `deliveries` in sync with `service_orders.battery_statuses_json`
-- Behavior:
-- 1) If a battery entry becomes `delivered` -> ensure auto delivery row exists
-- 2) If a battery entry changes from `delivered` to anything else -> delete auto delivery row
-- 3) If a previously delivered battery entry is removed from JSON -> delete auto delivery row

DROP TRIGGER IF EXISTS `trg_service_orders_delivery_from_battery_json`;

DELIMITER $$
CREATE TRIGGER `trg_service_orders_delivery_from_battery_json`
AFTER UPDATE ON `service_orders`
FOR EACH ROW
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE j INT DEFAULT 0;
    DECLARE new_len INT DEFAULT 0;
    DECLARE old_len INT DEFAULT 0;

    DECLARE v_status VARCHAR(50);
    DECLARE v_battery_id INT;
    DECLARE v_battery_serial VARCHAR(255);
    DECLARE v_note TEXT;

    DECLARE old_status VARCHAR(50);
    DECLARE old_battery_id INT;
    DECLARE old_battery_serial VARCHAR(255);
    DECLARE old_note TEXT;

    DECLARE new_status_cmp VARCHAR(50);
    DECLARE new_battery_id_cmp INT;
    DECLARE new_battery_serial_cmp VARCHAR(255);
    DECLARE still_delivered TINYINT DEFAULT 0;

    IF NEW.battery_statuses_json IS NOT NULL
       AND JSON_VALID(NEW.battery_statuses_json)
       AND (OLD.battery_statuses_json IS NULL OR OLD.battery_statuses_json <> NEW.battery_statuses_json) THEN

        SET new_len = JSON_LENGTH(NEW.battery_statuses_json);

        -- Pass 1: Upsert/delete based on NEW entries
        SET i = 0;
        WHILE i < new_len DO
            SET v_status = LOWER(
                JSON_UNQUOTE(
                    JSON_EXTRACT(NEW.battery_statuses_json, CONCAT('$[', i, '].service_status'))
                )
            );

            SET v_battery_id = CAST(
                JSON_UNQUOTE(
                    JSON_EXTRACT(NEW.battery_statuses_json, CONCAT('$[', i, '].battery_id'))
                ) AS UNSIGNED
            );

            SET v_battery_serial = JSON_UNQUOTE(
                JSON_EXTRACT(NEW.battery_statuses_json, CONCAT('$[', i, '].battery_serial'))
            );

            SET v_note = CONCAT(
                'Auto-created from battery_statuses_json | service ',
                NEW.service_code,
                ' | battery_id:',
                COALESCE(v_battery_id, 0),
                ' | battery_serial:',
                COALESCE(v_battery_serial, 'N/A')
            );

            IF v_status = 'delivered' THEN
                IF NOT EXISTS (
                    SELECT 1
                    FROM deliveries d
                    WHERE d.service_id = NEW.id
                      AND d.notes = v_note
                ) THEN
                    INSERT INTO deliveries (
                        delivery_code,
                        service_id,
                        customer_id,
                        delivery_type,
                        address,
                        contact_person,
                        contact_phone,
                        scheduled_date,
                        scheduled_time,
                        delivery_person,
                        notes,
                        status,
                        delivered_date,
                        created_at,
                        updated_at
                    )
                    VALUES (
                        NULL,
                        NEW.id,
                        NEW.customer_id,
                        'home_delivery',
                        'Address to be confirmed',
                        'Customer',
                        COALESCE(NEW.customer_phone, 'Not provided'),
                        CURDATE(),
                        '12:00:00',
                        'Delivery Staff',
                        v_note,
                        'delivered',
                        NOW(),
                        NOW(),
                        NOW()
                    );
                END IF;
            ELSE
                DELETE FROM deliveries
                WHERE service_id = NEW.id
                  AND notes = v_note
                  AND notes LIKE 'Auto-created from battery_statuses_json | service %';
            END IF;

            SET i = i + 1;
        END WHILE;

        -- Pass 2: If a delivered item existed in OLD but is removed/changed in NEW, delete its auto delivery row
        IF OLD.battery_statuses_json IS NOT NULL AND JSON_VALID(OLD.battery_statuses_json) THEN
            SET old_len = JSON_LENGTH(OLD.battery_statuses_json);
            SET i = 0;

            WHILE i < old_len DO
                SET old_status = LOWER(
                    JSON_UNQUOTE(
                        JSON_EXTRACT(OLD.battery_statuses_json, CONCAT('$[', i, '].service_status'))
                    )
                );

                IF old_status = 'delivered' THEN
                    SET old_battery_id = CAST(
                        JSON_UNQUOTE(
                            JSON_EXTRACT(OLD.battery_statuses_json, CONCAT('$[', i, '].battery_id'))
                        ) AS UNSIGNED
                    );

                    SET old_battery_serial = JSON_UNQUOTE(
                        JSON_EXTRACT(OLD.battery_statuses_json, CONCAT('$[', i, '].battery_serial'))
                    );

                    SET still_delivered = 0;
                    SET j = 0;
                    WHILE j < new_len DO
                        SET new_status_cmp = LOWER(
                            JSON_UNQUOTE(
                                JSON_EXTRACT(NEW.battery_statuses_json, CONCAT('$[', j, '].service_status'))
                            )
                        );
                        SET new_battery_id_cmp = CAST(
                            JSON_UNQUOTE(
                                JSON_EXTRACT(NEW.battery_statuses_json, CONCAT('$[', j, '].battery_id'))
                            ) AS UNSIGNED
                        );
                        SET new_battery_serial_cmp = JSON_UNQUOTE(
                            JSON_EXTRACT(NEW.battery_statuses_json, CONCAT('$[', j, '].battery_serial'))
                        );

                        IF new_status_cmp = 'delivered'
                           AND COALESCE(new_battery_id_cmp, 0) = COALESCE(old_battery_id, 0)
                           AND COALESCE(new_battery_serial_cmp, '') = COALESCE(old_battery_serial, '') THEN
                            SET still_delivered = 1;
                        END IF;

                        SET j = j + 1;
                    END WHILE;

                    IF still_delivered = 0 THEN
                        SET old_note = CONCAT(
                            'Auto-created from battery_statuses_json | service ',
                            NEW.service_code,
                            ' | battery_id:',
                            COALESCE(old_battery_id, 0),
                            ' | battery_serial:',
                            COALESCE(old_battery_serial, 'N/A')
                        );

                        DELETE FROM deliveries
                        WHERE service_id = NEW.id
                          AND notes = old_note
                          AND notes LIKE 'Auto-created from battery_statuses_json | service %';
                    END IF;
                END IF;

                SET i = i + 1;
            END WHILE;
        END IF;
    END IF;
END$$
DELIMITER ;

