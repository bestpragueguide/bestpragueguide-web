-- Phase 7: TourDates collection
-- Run after deploying Phase 7 code changes.
-- Prefer: POST /api/init-db with x-init-secret header.
-- Use this SQL only if init-db hangs.

-- Main TourDates table (collection = integer serial id)
CREATE TABLE IF NOT EXISTS tour_dates (
  id                serial PRIMARY KEY,
  tour_id           integer REFERENCES tours(id) ON DELETE SET NULL,
  date              timestamp with time zone,
  start_time        varchar DEFAULT '10:00',
  max_capacity      numeric DEFAULT 12,
  confirmed_guests  numeric DEFAULT 0,
  status            varchar DEFAULT 'available',
  display_title     varchar,
  internal_note     text,
  updated_at        timestamp with time zone DEFAULT now() NOT NULL,
  created_at        timestamp with time zone DEFAULT now() NOT NULL
);

-- Localized price_note (Payload uses _locale, not locale)
CREATE TABLE IF NOT EXISTS tour_dates_locales (
  id         serial PRIMARY KEY,
  price_note varchar,
  _locale    varchar NOT NULL,
  _parent_id integer NOT NULL REFERENCES tour_dates(id) ON DELETE CASCADE,
  UNIQUE(_parent_id, _locale)
);

-- Register tour_dates in Payload locked documents
ALTER TABLE payload_locked_documents_rels
  ADD COLUMN IF NOT EXISTS tour_dates_id integer REFERENCES tour_dates(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_tour_dates_tour_id ON tour_dates (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_dates_date    ON tour_dates (date);
