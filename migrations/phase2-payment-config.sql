-- Phase 2: PaymentConfig global + BookingRequests payment fields
-- Run after deploying Phase 2 code changes.
-- Prefer: POST /api/init-db with x-init-secret header.
-- Use this SQL only if init-db hangs (common with many new columns).

-- PaymentConfig global table
CREATE TABLE IF NOT EXISTS payment_config (
  id          serial PRIMARY KEY,
  deposit_enabled       boolean DEFAULT false,
  deposit_percent       numeric DEFAULT 30,
  payment_deadline_days integer DEFAULT 3,
  exchange_rates_usd    numeric DEFAULT 1.08,
  exchange_rates_czk    numeric DEFAULT 25.2,
  updated_at  timestamp,
  created_at  timestamp
);

-- BookingRequests new columns
ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS payment_status        varchar(20) DEFAULT 'not_required',
  ADD COLUMN IF NOT EXISTS deposit_amount_eur    numeric,
  ADD COLUMN IF NOT EXISTS cash_balance_eur      numeric,
  ADD COLUMN IF NOT EXISTS nps_score             integer,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id varchar(100),
  ADD COLUMN IF NOT EXISTS stripe_charged_cents  integer,
  ADD COLUMN IF NOT EXISTS stripe_charge_currency varchar(10),
  ADD COLUMN IF NOT EXISTS paid_at               timestamp with time zone,
  ADD COLUMN IF NOT EXISTS chatwoot_conversation_id integer,
  ADD COLUMN IF NOT EXISTS mautic_contact_id     integer,
  ADD COLUMN IF NOT EXISTS twenty_contact_id     varchar(50);

-- cash_currencies select-many for PaymentConfig
CREATE TABLE IF NOT EXISTS payment_config_cash_currencies (
  id        varchar PRIMARY KEY,
  parent_id integer REFERENCES payment_config(id),
  value     varchar(10),
  "order"   integer
);
