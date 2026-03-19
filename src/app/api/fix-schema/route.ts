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
      // Email Templates global — drop old (wrong schema) and recreate
      `DROP TABLE IF EXISTS email_templates_locales CASCADE`,
      `DROP TABLE IF EXISTS email_templates CASCADE`,
      `CREATE TABLE email_templates (
        id serial PRIMARY KEY,
        admin_subject varchar DEFAULT 'New booking: {ref} — {tour}',
        updated_at timestamp(3) with time zone,
        created_at timestamp(3) with time zone
      )`,
      `CREATE TABLE email_templates_locales (
        received_subject varchar DEFAULT 'Request received — {ref}',
        received_body varchar DEFAULT 'Thank you for your request for the "{tour}" tour on {date}. We received your request and will get back to you shortly.',
        received_note varchar DEFAULT 'If you have any questions, contact us via WhatsApp, Telegram, or email.',
        confirmed_subject varchar DEFAULT 'Confirmed — {tour}',
        confirmed_heading varchar DEFAULT 'Confirmed, {name}!',
        confirmed_body varchar DEFAULT 'Your request for the "{tour}" tour has been confirmed.',
        confirmed_note varchar DEFAULT 'Meeting point details and guide contact will be sent after payment.',
        declined_subject varchar DEFAULT 'Request update — {ref}',
        declined_body varchar DEFAULT 'Unfortunately, your requested date ({date}) for the "{tour}" tour is not available.',
        declined_note varchar DEFAULT $$We'd be happy to suggest an alternative date. Please contact us via WhatsApp, Telegram, or email to discuss options.$$,
        payment_subject varchar DEFAULT 'Payment received — {tour}',
        payment_heading varchar DEFAULT 'Payment received, {name}!',
        payment_body varchar DEFAULT $$You're all set! Here are your tour details:$$,
        payment_note varchar DEFAULT 'Your guide will contact you the day before the tour with final details.',
        reminder_subject varchar DEFAULT 'Reminder: tour tomorrow — {tour}',
        reminder_heading varchar DEFAULT 'Reminder, {name}!',
        reminder_body varchar DEFAULT 'Your "{tour}" tour is scheduled for tomorrow!',
        reminder_note varchar DEFAULT 'Tips: wear comfortable shoes and bring water. Contact us if you have any questions.',
        footer varchar DEFAULT 'Best Prague Guide | info@bestpragueguide.com',
        id serial PRIMARY KEY,
        _locale _locales NOT NULL,
        _parent_id integer NOT NULL,
        CONSTRAINT email_templates_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES email_templates(id) ON DELETE CASCADE,
        CONSTRAINT email_templates_locales_locale_parent_id_unique UNIQUE (_locale, _parent_id)
      )`,

      // Payment Config global — drop old (wrong schema) and recreate
      `DROP TABLE IF EXISTS payment_config_cash_currencies CASCADE`,
      `DROP TABLE IF EXISTS payment_config CASCADE`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_payment_config_cash_currencies') THEN CREATE TYPE enum_payment_config_cash_currencies AS ENUM ('EUR', 'USD', 'CZK'); END IF; END $$`,
      `CREATE TABLE payment_config (
        id serial PRIMARY KEY,
        deposit_enabled boolean DEFAULT false,
        deposit_percent numeric DEFAULT 30,
        payment_deadline_days numeric DEFAULT 3,
        exchange_rates_usd numeric DEFAULT 1.08,
        exchange_rates_czk numeric DEFAULT 25.2,
        updated_at timestamp(3) with time zone,
        created_at timestamp(3) with time zone
      )`,
      `CREATE TABLE payment_config_cash_currencies (
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
      `ALTER TABLE site_settings_locales ADD COLUMN IF NOT EXISTS booking_success_title varchar`,
      `ALTER TABLE site_settings_locales ADD COLUMN IF NOT EXISTS booking_success_message varchar`,
      `ALTER TABLE site_settings_locales ADD COLUMN IF NOT EXISTS booking_consent_text varchar`,

      // Add showOnHomepage column to reviews (checkbox, not localized)
      `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS show_on_homepage boolean DEFAULT false`,

      // Drop old incorrectly-created tables (wrong column names)
      `DROP TABLE IF EXISTS site_settings_booking_trust_badges_locales`,
      `DROP TABLE IF EXISTS site_settings_booking_trust_badges`,

      // site_settings_booking_trust_badges array table
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
