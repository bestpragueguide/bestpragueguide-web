import type { GlobalConfig } from 'payload'

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
              type: 'textarea',
              localized: true,
              defaultValue:
                'Thank you for your booking request! Here are the details:\n\nTour: {tour}\nDate: {date}\nTime: {time}\nGuests: {guests}\nPrice: {price} {currency}\n\nWe received your request and will get back to you shortly.',
              admin: {
                description: 'Shown above the booking summary table. Placeholders: {name}, {tour}, {date}, {time}, {guests}, {price}, {currency}, {phone}, {email}, {requests}, {ref}. Use line breaks for formatting.',
                rows: 8,
              },
            },
            {
              name: 'receivedNote',
              label: 'Contact Note',
              type: 'textarea',
              localized: true,
              defaultValue:
                'If you have any questions, contact us via WhatsApp, Telegram, or email.',
              admin: {
                description: 'Shown below the booking summary table. Placeholders: {name}, {tour}, {date}, {time}, {guests}, {price}, {currency}, {phone}, {email}, {requests}, {ref}',
                rows: 3,
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
              type: 'textarea',
              localized: true,
              defaultValue:
                'Your request for the "{tour}" tour has been confirmed.',
              admin: {
                description: 'Placeholders: {name}, {tour}, {ref}',
                rows: 3,
              },
            },
            {
              name: 'confirmedNote',
              label: 'Note',
              type: 'textarea',
              localized: true,
              defaultValue:
                'Meeting point details and guide contact will be sent after payment.',
              admin: {
                description: 'Shown after booking details',
                rows: 3,
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
              type: 'textarea',
              localized: true,
              defaultValue:
                'Unfortunately, your requested date ({date}) for the "{tour}" tour is not available.',
              admin: {
                description: 'Placeholders: {name}, {tour}, {date}, {ref}',
                rows: 3,
              },
            },
            {
              name: 'declinedNote',
              label: 'Note',
              type: 'textarea',
              localized: true,
              defaultValue:
                "We'd be happy to suggest an alternative date. Please contact us via WhatsApp, Telegram, or email to discuss options.",
              admin: {
                description: 'Shown after declined message',
                rows: 3,
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
              type: 'textarea',
              localized: true,
              defaultValue: "You're all set! Here are your tour details:",
              admin: {
                description: 'Placeholders: {name}, {tour}',
                rows: 3,
              },
            },
            {
              name: 'paymentNote',
              label: 'Note',
              type: 'textarea',
              localized: true,
              defaultValue:
                'Your guide will contact you the day before the tour with final details.',
              admin: {
                description: 'Shown after tour details',
                rows: 3,
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
              type: 'textarea',
              localized: true,
              defaultValue:
                'Your "{tour}" tour is scheduled for tomorrow!',
              admin: {
                description: 'Placeholders: {name}, {tour}',
                rows: 3,
              },
            },
            {
              name: 'reminderNote',
              label: 'Note',
              type: 'textarea',
              localized: true,
              defaultValue:
                'Tips: wear comfortable shoes and bring water. Contact us if you have any questions.',
              admin: {
                description: 'Shown after tour details',
                rows: 3,
              },
            },
          ],
        },
        {
          label: 'Footer',
          fields: [
            {
              name: 'footer',
              label: 'Footer Text',
              type: 'text',
              localized: true,
              defaultValue:
                'Best Prague Guide | info@bestpragueguide.com',
              admin: {
                description: 'Shared footer text shown at the bottom of all customer emails',
              },
            },
          ],
        },
      ],
    },
  ],
}
