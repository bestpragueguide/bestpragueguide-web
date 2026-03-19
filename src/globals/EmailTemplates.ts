import type { GlobalConfig } from 'payload'
import { simplifiedEditor } from '../lib/editors'

export const EmailTemplates: GlobalConfig = {
  slug: 'email-templates',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Booking Received',
          fields: [
            {
              name: 'receivedSubject',
              label: 'Subject',
              type: 'text',
              localized: true,
              defaultValue: 'Request received — {ref}',
              admin: {
                description: 'Placeholders: {name}, {tour}, {date}, {time}, {guests}, {price}, {currency}, {phone}, {email}, {requests}, {ref}',
              },
            },
            {
              name: 'receivedBody',
              label: 'Body',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Shown above the booking summary. Placeholders in text: {name}, {tour}, {date}, {time}, {guests}, {price}, {currency}, {phone}, {email}, {requests}, {ref}',
              },
            },
            {
              name: 'receivedSummaryTitle',
              label: 'Summary Title',
              type: 'text',
              localized: true,
              admin: {
                description: 'Title of the booking summary box (e.g. "Booking Summary")',
              },
            },
            {
              name: 'receivedSummaryBody',
              label: 'Summary Body',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Additional text inside the summary box. Placeholders: {name}, {tour}, {date}, {time}, {guests}, {price}, {currency}, {phone}, {email}, {requests}, {ref}',
              },
            },
            {
              name: 'receivedNote',
              label: 'Contact Note',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Shown below the booking summary. Placeholders: {name}, {tour}, {date}, {time}, {guests}, {price}, {currency}, {phone}, {email}, {requests}, {ref}',
              },
            },
          ],
        },
        {
          label: 'Booking Offer',
          fields: [
            {
              name: 'offerSubject',
              label: 'Subject',
              type: 'text',
              localized: true,
              defaultValue: 'Your booking is confirmed — {tour}',
              admin: {
                description: 'Placeholders: {name}, {tour}, {date}, {time}, {ref}',
              },
            },
            {
              name: 'offerHeading',
              label: 'Heading',
              type: 'text',
              localized: true,
              defaultValue: 'Your tour is confirmed, {name}!',
              admin: {
                description: 'Placeholders: {name}',
              },
            },
            {
              name: 'offerBody',
              label: 'Body',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Placeholders in text: {name}, {tour}, {date}, {time}, {guests}, {price}, {deposit}, {ref}',
              },
            },
            {
              name: 'offerCtaLabel',
              label: 'Button Label',
              type: 'text',
              localized: true,
              defaultValue: 'View Your Booking',
              admin: {
                description: 'Text on the CTA button',
              },
            },
            {
              name: 'offerNote',
              label: 'Note',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Shown below the CTA button',
              },
            },
          ],
        },
        {
          label: 'Admin Notification',
          fields: [
            {
              name: 'adminSubject',
              label: 'Subject',
              type: 'text',
              defaultValue: 'New booking: {ref} — {tour}',
              admin: {
                description: 'Placeholders: {ref}, {tour}',
              },
            },
          ],
        },
        {
          label: 'Booking Confirmed',
          fields: [
            {
              name: 'confirmedSubject',
              label: 'Subject',
              type: 'text',
              localized: true,
              defaultValue: 'Confirmed — {tour}',
              admin: {
                description: 'Placeholders: {tour}, {ref}',
              },
            },
            {
              name: 'confirmedHeading',
              label: 'Heading',
              type: 'text',
              localized: true,
              defaultValue: 'Confirmed, {name}!',
              admin: {
                description: 'Placeholders: {name}',
              },
            },
            {
              name: 'confirmedBody',
              label: 'Body',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Placeholders in text: {name}, {tour}, {ref}',
              },
            },
            {
              name: 'confirmedNote',
              label: 'Note',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Shown after booking details',
              },
            },
          ],
        },
        {
          label: 'Booking Declined',
          fields: [
            {
              name: 'declinedSubject',
              label: 'Subject',
              type: 'text',
              localized: true,
              defaultValue: 'Request update — {ref}',
              admin: {
                description: 'Placeholders: {ref}, {tour}',
              },
            },
            {
              name: 'declinedBody',
              label: 'Body',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Placeholders in text: {name}, {tour}, {date}, {ref}',
              },
            },
            {
              name: 'declinedNote',
              label: 'Note',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Shown after declined message',
              },
            },
          ],
        },
        {
          label: 'Payment Received',
          fields: [
            {
              name: 'paymentSubject',
              label: 'Subject',
              type: 'text',
              localized: true,
              defaultValue: 'Payment received — {tour}',
              admin: {
                description: 'Placeholders: {tour}, {ref}',
              },
            },
            {
              name: 'paymentHeading',
              label: 'Heading',
              type: 'text',
              localized: true,
              defaultValue: 'Payment received, {name}!',
              admin: {
                description: 'Placeholders: {name}',
              },
            },
            {
              name: 'paymentBody',
              label: 'Body',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Placeholders in text: {name}, {tour}',
              },
            },
            {
              name: 'paymentNote',
              label: 'Note',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Shown after tour details',
              },
            },
          ],
        },
        {
          label: 'Pre-Tour Reminder',
          fields: [
            {
              name: 'reminderSubject',
              label: 'Subject',
              type: 'text',
              localized: true,
              defaultValue: 'Reminder: tour tomorrow — {tour}',
              admin: {
                description: 'Placeholders: {tour}, {ref}',
              },
            },
            {
              name: 'reminderHeading',
              label: 'Heading',
              type: 'text',
              localized: true,
              defaultValue: 'Reminder, {name}!',
              admin: {
                description: 'Placeholders: {name}',
              },
            },
            {
              name: 'reminderBody',
              label: 'Body',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Placeholders in text: {name}, {tour}',
              },
            },
            {
              name: 'reminderNote',
              label: 'Note',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Shown after tour details',
              },
            },
          ],
        },
        {
          label: 'Header & Footer',
          fields: [
            {
              name: 'headerTitle',
              label: 'Header Title',
              type: 'text',
              localized: true,
              defaultValue: 'Best Prague Guide',
              admin: {
                description: 'Logo/brand text at the top of all emails',
              },
            },
            {
              name: 'greeting',
              label: 'Greeting Template',
              type: 'text',
              localized: true,
              defaultValue: 'Hello, {name}!',
              admin: {
                description: 'Greeting line. Use {name} placeholder. E.g. "Hello, {name}!" or "Dear {name},"',
              },
            },
            {
              name: 'footer',
              label: 'Footer Text',
              type: 'textarea',
              localized: true,
              defaultValue:
                'Best Prague Guide | info@bestpragueguide.com',
              admin: {
                description: 'Footer shown at the bottom of all emails. Supports line breaks.',
                rows: 3,
              },
            },
          ],
        },
      ],
    },
  ],
}
