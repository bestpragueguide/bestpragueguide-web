import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from 'drizzle-orm'

export async function POST(req: Request) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const db = payload.db as any
    const drizzle = db.drizzle

    const results: string[] = []

    const queries = [
      // Email Templates global (non-destructive — CREATE IF NOT EXISTS only)
      `CREATE TABLE IF NOT EXISTS email_templates (
        id serial PRIMARY KEY,
        admin_subject varchar,
        updated_at timestamp(3) with time zone,
        created_at timestamp(3) with time zone
      )`,
      `CREATE TABLE IF NOT EXISTS email_templates_locales (
        received_subject varchar,
        received_body varchar,
        received_note varchar,
        confirmed_subject varchar,
        confirmed_heading varchar,
        confirmed_body varchar,
        confirmed_note varchar,
        declined_subject varchar,
        declined_body varchar,
        declined_note varchar,
        payment_subject varchar,
        payment_heading varchar,
        payment_body varchar,
        payment_note varchar,
        reminder_subject varchar,
        reminder_heading varchar,
        reminder_body varchar,
        reminder_note varchar,
        footer varchar,
        id serial PRIMARY KEY,
        _locale _locales NOT NULL,
        _parent_id integer NOT NULL,
        CONSTRAINT email_templates_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES email_templates(id) ON DELETE CASCADE,
        CONSTRAINT email_templates_locales_locale_parent_id_unique UNIQUE (_locale, _parent_id)
      )`,

      // Email template summary label columns
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_label_tour varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_label_date varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_label_time varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_label_guests varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_label_price varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_label_email varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_label_phone varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_label_requests varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_label_payment varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_label_language varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_label_reference varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_label_deposit varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_label_cash_balance varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_payment_cash varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_payment_card varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_payment_card_full varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_language_en varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS summary_language_ru varchar`,
      // Also add missing columns from earlier updates
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS cancelled_subject varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS cancelled_body varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS cancelled_note varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS offer_subject varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS offer_heading varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS offer_body varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS offer_cta_label varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS offer_note varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS header_title varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS greeting varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS received_summary_title varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS received_summary_body varchar`,

      // Refund email template columns
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS refund_subject varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS refund_body varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS refund_note varchar`,

      // RichText header/footer columns
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS header_content varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS footer_content varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS header_html varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS footer_html varchar`,

      // Payment Config global (non-destructive — CREATE IF NOT EXISTS only)
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_payment_config_cash_currencies') THEN CREATE TYPE enum_payment_config_cash_currencies AS ENUM ('EUR', 'USD', 'CZK'); END IF; END $$`,
      `CREATE TABLE IF NOT EXISTS payment_config (
        id serial PRIMARY KEY,
        deposit_enabled boolean DEFAULT false,
        deposit_percent numeric DEFAULT 30,
        payment_deadline_days numeric DEFAULT 3,
        exchange_rates_usd numeric DEFAULT 1.08,
        exchange_rates_czk numeric DEFAULT 25.2,
        updated_at timestamp(3) with time zone,
        created_at timestamp(3) with time zone
      )`,
      `CREATE TABLE IF NOT EXISTS payment_config_cash_currencies (
        "order" integer NOT NULL,
        parent_id integer NOT NULL,
        value enum_payment_config_cash_currencies,
        id serial PRIMARY KEY,
        CONSTRAINT payment_config_cash_currencies_parent_fk FOREIGN KEY (parent_id) REFERENCES payment_config(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS payment_config_cash_currencies_order_idx ON payment_config_cash_currencies ("order")`,
      `CREATE INDEX IF NOT EXISTS payment_config_cash_currencies_parent_idx ON payment_config_cash_currencies (parent_id)`,

      // Add bookingPricingDescription column to site_settings_locales (textarea, localized)
      `ALTER TABLE site_settings_locales ADD COLUMN IF NOT EXISTS booking_pricing_description varchar`,

      // Add booking success message columns to site_settings_locales (text, localized)
      `ALTER TABLE site_settings_locales ADD COLUMN IF NOT EXISTS booking_form_title varchar`,
      `ALTER TABLE site_settings_locales ADD COLUMN IF NOT EXISTS booking_submit_label varchar`,
      `ALTER TABLE site_settings_locales ADD COLUMN IF NOT EXISTS booking_success_title varchar`,
      `ALTER TABLE site_settings_locales ADD COLUMN IF NOT EXISTS booking_success_message varchar`,
      `ALTER TABLE site_settings_locales ADD COLUMN IF NOT EXISTS booking_disclaimer_text varchar`,
      `ALTER TABLE site_settings_locales ADD COLUMN IF NOT EXISTS booking_consent_text varchar`,

      // Add showOnHomepage column to reviews (checkbox, not localized)
      `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS show_on_homepage boolean DEFAULT false`,

      // Tours: replace lat/lng with mapUrl on main and version tables
      `ALTER TABLE tours ADD COLUMN IF NOT EXISTS meeting_point_map_url varchar`,
      `ALTER TABLE _tours_v ADD COLUMN IF NOT EXISTS version_meeting_point_map_url varchar`,

      // SiteSettings: replace mapCoordinates group with mapUrl
      `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS map_url varchar`,

      // SiteSettings: booking page fields on locales table
      `ALTER TABLE site_settings_locales ADD COLUMN IF NOT EXISTS booking_page_payment_note varchar`,
      `ALTER TABLE site_settings_locales ADD COLUMN IF NOT EXISTS booking_page_cash_note varchar`,
      `ALTER TABLE site_settings_locales ADD COLUMN IF NOT EXISTS booking_page_confirmed_message varchar`,
      `ALTER TABLE site_settings_locales ADD COLUMN IF NOT EXISTS booking_page_contact_note varchar`,
      `ALTER TABLE site_settings_locales ADD COLUMN IF NOT EXISTS booking_page_expired_heading varchar`,
      `ALTER TABLE site_settings_locales ADD COLUMN IF NOT EXISTS booking_page_expired_message varchar`,

      // EmailTemplates: offer fields on locales table
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS header_title varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS greeting varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS offer_subject varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS offer_heading varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS offer_body varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS offer_cta_label varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS offer_note varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS cancelled_subject varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS cancelled_body varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS cancelled_note varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS received_summary_title varchar`,
      `ALTER TABLE email_templates_locales ADD COLUMN IF NOT EXISTS received_summary_body varchar`,

      // Booking offer fields on booking_requests table
      `ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS offer_token varchar UNIQUE`,
      `ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS offer_sent_at timestamp(3) with time zone`,
      `ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS offer_expires_at timestamp(3) with time zone`,
      `ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS confirmed_date date`,
      `ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS confirmed_time varchar`,
      `ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS confirmed_price numeric`,
      `ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS confirmed_guests integer`,
      `ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS guide_name varchar`,
      `ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS guide_phone varchar`,
      `ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS meeting_point_map_url varchar`,
      `ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS payment_method varchar DEFAULT 'cash_only'`,
      `ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS custom_deposit_amount numeric`,
      `ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS tour_name varchar`,
      `ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS last_update_sent_at timestamp(3) with time zone`,
      `ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS refunded_at timestamp(3) with time zone`,
      `ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS total_paid numeric`,
      `ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS balance_due numeric`,
      // Booking transactions sub-table (array field)
      `CREATE TABLE IF NOT EXISTS booking_requests_transactions (
        id varchar PRIMARY KEY NOT NULL,
        _order integer NOT NULL,
        _parent_id integer NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
        type varchar NOT NULL,
        amount numeric,
        description varchar,
        stripe_id varchar,
        recorded_at timestamp(3) with time zone
      )`,
      `CREATE INDEX IF NOT EXISTS booking_requests_transactions_order_idx ON booking_requests_transactions (_order)`,
      `CREATE INDEX IF NOT EXISTS booking_requests_transactions_parent_id_idx ON booking_requests_transactions (_parent_id)`,

      // Rename old EUR-specific columns to currency-neutral names
      `DO $$ BEGIN ALTER TABLE booking_requests RENAME COLUMN deposit_amount_eur TO deposit_amount; EXCEPTION WHEN others THEN NULL; END $$`,
      `DO $$ BEGIN ALTER TABLE booking_requests RENAME COLUMN cash_balance_eur TO cash_balance; EXCEPTION WHEN others THEN NULL; END $$`,

      // Add missing values to booking status enum
      `DO $$ BEGIN
        ALTER TYPE enum_booking_requests_status ADD VALUE IF NOT EXISTS 'cancelled';
      EXCEPTION WHEN others THEN NULL; END $$`,
      `DO $$ BEGIN
        ALTER TYPE enum_booking_requests_status ADD VALUE IF NOT EXISTS 'offer-sent';
      EXCEPTION WHEN others THEN NULL; END $$`,
      `DO $$ BEGIN
        ALTER TYPE enum_booking_requests_status ADD VALUE IF NOT EXISTS 'no-show';
      EXCEPTION WHEN others THEN NULL; END $$`,
      // Migrate existing payment-sent records to offer-sent
      `UPDATE booking_requests SET status = 'offer-sent' WHERE status = 'payment-sent'`,

      // Booking Audit Log table
      `CREATE TABLE IF NOT EXISTS booking_audit_log (
        id serial PRIMARY KEY,
        booking_id integer NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
        event_type varchar NOT NULL,
        actor_type varchar NOT NULL,
        actor_id varchar,
        actor_name varchar,
        description varchar NOT NULL,
        ip_address varchar,
        user_agent varchar,
        ip_geo_city varchar,
        ip_geo_region varchar,
        ip_geo_country varchar,
        ip_geo_isp varchar,
        previous_value jsonb DEFAULT '{}'::jsonb,
        new_value jsonb DEFAULT '{}'::jsonb,
        metadata jsonb DEFAULT '{}'::jsonb,
        updated_at timestamp(3) with time zone DEFAULT now(),
        created_at timestamp(3) with time zone DEFAULT now()
      )`,
      `CREATE INDEX IF NOT EXISTS booking_audit_log_booking_id_idx ON booking_audit_log (booking_id)`,
      `CREATE INDEX IF NOT EXISTS booking_audit_log_event_type_idx ON booking_audit_log (event_type)`,
      `CREATE INDEX IF NOT EXISTS booking_audit_log_ip_address_idx ON booking_audit_log (ip_address)`,
      `CREATE INDEX IF NOT EXISTS booking_audit_log_created_at_idx ON booking_audit_log (created_at)`,
      `ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS "booking_audit_log_id" integer REFERENCES booking_audit_log(id) ON DELETE CASCADE`,

      // Booking offer localized fields (first localized fields on BookingRequests)
      `CREATE TABLE IF NOT EXISTS booking_requests_locales (
        meeting_point_address varchar,
        meeting_point_instructions varchar,
        customer_notes varchar,
        id serial PRIMARY KEY,
        _locale _locales NOT NULL,
        _parent_id integer NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
        UNIQUE(_locale, _parent_id)
      )`,

      // site_settings_booking_trust_badges array table (non-destructive — CREATE IF NOT EXISTS only)
      `CREATE TABLE IF NOT EXISTS site_settings_booking_trust_badges (
        _order integer NOT NULL,
        _parent_id integer NOT NULL REFERENCES site_settings(id) ON DELETE CASCADE,
        id varchar PRIMARY KEY
      )`,
      `CREATE INDEX IF NOT EXISTS site_settings_booking_trust_badges_order_idx ON site_settings_booking_trust_badges (_order)`,
      `CREATE INDEX IF NOT EXISTS site_settings_booking_trust_badges_parent_id_idx ON site_settings_booking_trust_badges (_parent_id)`,

      // site_settings_booking_trust_badges_locales table (text is localized)
      `CREATE TABLE IF NOT EXISTS site_settings_booking_trust_badges_locales (
        text varchar NOT NULL,
        id serial PRIMARY KEY,
        _locale _locales NOT NULL,
        _parent_id varchar NOT NULL REFERENCES site_settings_booking_trust_badges(id) ON DELETE CASCADE,
        UNIQUE(_locale, _parent_id)
      )`,

      // tours_rels table for relatedTours hasMany relationship
      `CREATE TABLE IF NOT EXISTS tours_rels (
        id serial PRIMARY KEY,
        "order" integer,
        parent_id integer NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
        path varchar NOT NULL,
        tours_id integer REFERENCES tours(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS tours_rels_order_idx ON tours_rels ("order")`,
      `CREATE INDEX IF NOT EXISTS tours_rels_parent_idx ON tours_rels (parent_id)`,
      `CREATE INDEX IF NOT EXISTS tours_rels_path_idx ON tours_rels (path)`,
      `CREATE INDEX IF NOT EXISTS tours_rels_tours_id_idx ON tours_rels (tours_id)`,

      // _tours_v_rels table for version drafts
      `CREATE TABLE IF NOT EXISTS _tours_v_rels (
        id serial PRIMARY KEY,
        "order" integer,
        parent_id integer NOT NULL REFERENCES _tours_v(id) ON DELETE CASCADE,
        path varchar NOT NULL,
        tours_id integer REFERENCES tours(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS _tours_v_rels_order_idx ON _tours_v_rels ("order")`,
      `CREATE INDEX IF NOT EXISTS _tours_v_rels_parent_idx ON _tours_v_rels (parent_id)`,
      `CREATE INDEX IF NOT EXISTS _tours_v_rels_path_idx ON _tours_v_rels (path)`,
      `CREATE INDEX IF NOT EXISTS _tours_v_rels_tours_id_idx ON _tours_v_rels (tours_id)`,
    ]

    for (const query of queries) {
      try {
        await drizzle.execute(sql.raw(query))
        results.push(`OK: ${query.substring(0, 60)}...`)
      } catch (e: any) {
        results.push(`SKIP: ${e.message?.substring(0, 80)}`)
      }
    }

    // Fix review locales: add missing translations for each review
    const richBody = (text: string) => ({
      root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text, version: 1 }], direction: null, format: '', indent: 0, version: 1 }], direction: null, format: '', indent: 0, version: 1 },
    })

    // Translation map: customerName -> { en: { title, body }, ru: { title, body } }
    const reviewTranslations: Record<string, { en: { title: string; body: string }; ru: { title: string; body: string } }> = {
      'James M.': {
        en: { title: 'Absolutely wonderful!', body: "Uliana was an amazing guide. Her knowledge of Prague's history and hidden spots made this tour unforgettable. Highly recommend!" },
        ru: { title: 'Просто замечательно!', body: 'Ульяна — потрясающий гид. Её знания истории Праги и скрытых уголков сделали эту экскурсию незабываемой. Очень рекомендую!' },
      },
      'Sarah K.': {
        en: { title: 'Best tour in Prague', body: "We've done many tours in Europe, but this was by far the best. Private, personalized, and full of fascinating stories." },
        ru: { title: 'Лучшая экскурсия в Праге', body: 'Мы были на многих экскурсиях в Европе, но эта — лучшая. Индивидуальная, персонализированная и полная увлекательных историй.' },
      },
      'Robert L.': {
        en: { title: 'Perfect private tour', body: "The Prague Castle tour was perfectly organized. Our guide knew every corner and shared stories you won't find in any guidebook." },
        ru: { title: 'Идеальная индивидуальная экскурсия', body: 'Экскурсия в Пражский Град была идеально организована. Наш гид знал каждый уголок и рассказывал истории, которых нет в путеводителях.' },
      },
      'Мария К.': {
        en: { title: 'Amazing tour!', body: 'Uliana is an incredible guide! Three hours flew by. We learned so much about Prague that you won\'t find in any guidebook.' },
        ru: { title: 'Потрясающая экскурсия!', body: 'Улиана — невероятный гид! Три часа пролетели незаметно. Узнали столько интересного о Праге, что в путеводителях не прочитаешь.' },
      },
      'Андрей В.': {
        en: { title: 'Best guide in Prague', body: 'The Prague Castle tour exceeded all expectations. Uliana knows every stone and tells stories that make you never want to leave.' },
        ru: { title: 'Лучший гид в Праге', body: 'Экскурсия в Пражский Град превзошла все ожидания. Улиана знает каждый камень и рассказывает так, что не хочется уходить.' },
      },
      'Елена С.': {
        en: { title: 'Perfect city tour!', body: 'Wonderful car tour. In 4 hours we saw all of Prague, including places we\'d never find on our own. Highly recommend!' },
        ru: { title: 'Идеальный сити-тур!', body: 'Замечательная экскурсия на автомобиле. За 4 часа увидели всю Прагу, включая места, куда бы сами не добрались. Очень рекомендую!' },
      },
      'David H.': {
        en: { title: 'Great experience', body: 'Really enjoyed the walking tour through Old Town. Our guide was knowledgeable and friendly. Would have loved it to be a bit longer!' },
        ru: { title: 'Отличный опыт', body: 'Очень понравилась пешая экскурсия по Старому городу. Гид был знающий и дружелюбный. Хотелось бы, чтобы длилось чуть дольше!' },
      },
      'Ольга П.': {
        en: { title: 'All of Prague in one day', body: 'Took the city tour with kids — perfect format. We didn\'t get tired, saw everything important, and the guide was wonderful with the children.' },
        ru: { title: 'Вся Прага за один день', body: 'Брали сити-тур с детьми — идеальный формат. Не устали, увидели всё самое важное, гид прекрасно ладит с детьми.' },
      },
    }

    const allReviews = await payload.find({ collection: 'reviews', limit: 100, locale: 'en' })
    for (const review of allReviews.docs) {
      const name = (review as any).customerName
      const translations = reviewTranslations[name]
      if (!translations) continue

      // Update EN locale
      await payload.update({
        collection: 'reviews',
        id: review.id,
        locale: 'en',
        data: {
          title: translations.en.title,
          body: richBody(translations.en.body) as any,
        },
      })
      // Update RU locale
      await payload.update({
        collection: 'reviews',
        id: review.id,
        locale: 'ru',
        data: {
          title: translations.ru.title,
          body: richBody(translations.ru.body) as any,
        },
      })
      results.push(`FIXED: review ${review.id} (${name}) — set EN + RU body/title`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
