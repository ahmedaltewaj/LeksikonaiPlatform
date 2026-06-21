-- Migration: 020_add_webhook_message_id_unique_index
-- Description: Add unique index on webhook_message_id for email deduplication
-- 
-- Problem: Application-layer deduplication in createInquiryWithResponse/ingestInquiry
-- checks for existing webhook_message_id before insert, but without a database-level
-- unique constraint, concurrent requests can race through and create duplicates.
--
-- Solution: Partial unique index that only enforces uniqueness when webhook_message_id
-- is NOT NULL. This allows:
-- - Multiple NULL values (web forms, API calls without message-ID)
-- - Single non-NULL value per message-ID (email deduplication)

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_inquiries_webhook_message_id_unique
  ON public.inquiries(webhook_message_id)
  WHERE webhook_message_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON INDEX public.idx_inquiries_webhook_message_id_unique IS 
  'Unique index on webhook_message_id for email deduplication. 
   Only enforces uniqueness when webhook_message_id IS NOT NULL, 
   allowing multiple NULL values for non-email sources.';