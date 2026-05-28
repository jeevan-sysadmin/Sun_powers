-- Fix for: SQLSTATE[42S22]: Unknown column 'so.status' in 'field list'
-- Root cause: `service_orders` table missing `status` column while API query references `so.status`.

ALTER TABLE `service_orders`
ADD COLUMN `status` ENUM(
  'pending',
  'scheduled',
  'charging',
  'testing',
  'repair',
  'completed',
  'ready',
  'delivered',
  'cancelled',
  'in_progress'
) NOT NULL DEFAULT 'pending'
AFTER `estimated_completion_date`;

CREATE INDEX `idx_service_orders_status` ON `service_orders` (`status`);

-- Backfill existing rows safely.
UPDATE `service_orders`
SET `status` = 'pending'
WHERE `status` IS NULL OR `status` = '';
