-- Phase 7: TourDates collection
-- Run after deploying Phase 7 code changes.
-- Prefer: POST /api/init-db with x-init-secret header.
-- Use this SQL only if init-db hangs.

-- Main TourDates table
CREATE TABLE IF NOT EXISTS tour_dates (
  id                varchar PRIMARY KEY,
  tour_id           varchar,
  date              timestamp with time zone,
  start_time        varchar(10) DEFAULT '10:00',
  max_capacity      integer DEFAULT 12,
  confirmed_guests  integer DEFAULT 0,
  status            varchar(20) DEFAULT 'available',
  display_title     varchar(100),
  internal_note     text,
  updated_at        timestamp with time zone,
  created_at        timestamp with time zone
);

-- Localized price_note
CREATE TABLE IF NOT EXISTS tour_dates_locales (
  id        serial PRIMARY KEY,
  price_note varchar(200),
  locale    varchar(10) NOT NULL,
  _parent_id varchar NOT NULL REFERENCES tour_dates(id) ON DELETE CASCADE,
  UNIQUE(_parent_id, locale)
);

-- Register tour_dates in Payload locked documents
ALTER TABLE payload_locked_documents_rels
  ADD COLUMN IF NOT EXISTS tour_dates_id varchar;

CREATE INDEX IF NOT EXISTS idx_tour_dates_tour_id ON tour_dates (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_dates_date    ON tour_dates (date);
