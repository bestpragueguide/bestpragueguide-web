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
          label: 'Booking Cancelled',
          fields: [
            {
              name: 'cancelledSubject',
              label: 'Subject',
              type: 'text',
              localized: true,
              defaultValue: 'Booking cancelled — {ref}',
              admin: {
                description: 'Placeholders: {name}, {tour}, {date}, {ref}',
              },
            },
            {
              name: 'cancelledBody',
              label: 'Body',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Placeholders in text: {name}, {tour}, {date}, {ref}',
              },
            },
            {
              name: 'cancelledNote',
              label: 'Note',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Shown after cancelled message',
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
          label: 'Refund Processed',
          fields: [
            {
              name: 'refundSubject',
              label: 'Subject',
              type: 'text',
              localized: true,
              admin: {
                description: 'Placeholders: {name}, {tour}, {date}, {ref}',
                placeholder: 'Refund processed — {ref}',
              },
            },
            {
              name: 'refundBody',
              label: 'Body',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Main body text. Placeholders: {name}, {tour}, {date}, {ref}',
              },
            },
            {
              name: 'refundNote',
              label: 'Note',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Shown after refund details',
              },
            },
          ],
        },
        {
          label: 'Booking Summary',
          fields: [
            {
              name: 'summaryLabelTour',
              label: 'Tour label',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Tour' },
            },
            {
              name: 'summaryLabelDate',
              label: 'Date label',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Date' },
            },
            {
              name: 'summaryLabelTime',
              label: 'Time label',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Time' },
            },
            {
              name: 'summaryLabelGuests',
              label: 'Guests label',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Guests' },
            },
            {
              name: 'summaryLabelPrice',
              label: 'Price label',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Price' },
            },
            {
              name: 'summaryLabelEmail',
              label: 'Email label',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Email' },
            },
            {
              name: 'summaryLabelPhone',
              label: 'Phone label',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Phone' },
            },
            {
              name: 'summaryLabelRequests',
              label: 'Special requests label',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Special Requests' },
            },
            {
              name: 'summaryLabelPayment',
              label: 'Payment method label',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Payment' },
            },
            {
              name: 'summaryLabelLanguage',
              label: 'Language label',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Language' },
            },
            {
              name: 'summaryLabelReference',
              label: 'Reference label',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Reference' },
            },
            {
              name: 'summaryLabelDeposit',
              label: 'Deposit label',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Prepayment' },
            },
            {
              name: 'summaryLabelCashBalance',
              label: 'Cash balance label',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Balance on tour day' },
            },
            {
              name: 'summaryPaymentCash',
              label: 'Cash payment text',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Cash on tour day' },
            },
            {
              name: 'summaryPaymentCard',
              label: 'Card payment text',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Credit card online' },
            },
            {
              name: 'summaryPaymentCardFull',
              label: 'Card full payment text',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Credit card (full prepayment)' },
            },
            {
              name: 'summaryLanguageEn',
              label: 'English language name',
              type: 'text',
              localized: true,
              admin: { placeholder: 'English' },
            },
            {
              name: 'summaryLanguageRu',
              label: 'Russian language name',
              type: 'text',
              localized: true,
              admin: { placeholder: 'Русский' },
            },
          ],
        },
        {
          label: 'Header & Footer',
          fields: [
            {
              name: 'headerContent',
              label: 'Header',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Brand header at the top of all emails. Include logo text, tagline etc.',
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
              name: 'footerContent',
              label: 'Footer',
              type: 'richText',
              editor: simplifiedEditor,
              localized: true,
              admin: {
                description: 'Footer shown at the bottom of all emails. Include links, contact info, legal text.',
              },
            },
          ],
        },
      ],
    },
  ],
}
