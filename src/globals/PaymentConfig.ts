import type { GlobalConfig } from 'payload'

export const PaymentConfig: GlobalConfig = {
  slug: 'payment-config',
  label: 'Payment Settings',
  admin: { group: 'Settings' },
  fields: [
    {
      name: 'depositEnabled',
      type: 'checkbox',
      label: 'Require deposit payment after confirmation',
      defaultValue: false,
    },
    {
      name: 'depositPercent',
      type: 'number',
      label: 'Deposit (%)',
      min: 1,
      max: 100,
      defaultValue: 30,
      admin: {
        description: 'Percentage of total price charged as deposit',
        condition: (_, siblingData) => Boolean(siblingData?.depositEnabled),
      },
    },
    {
      name: 'paymentDeadlineDays',
      type: 'number',
      label: 'Days to pay after confirmation',
      defaultValue: 3,
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.depositEnabled),
      },
    },
    {
      name: 'cashCurrencies',
      type: 'select',
      hasMany: true,
      label: 'Currencies accepted for cash payment on tour day',
      options: [
        { label: 'Euro (€)', value: 'EUR' },
        { label: 'US Dollar ($)', value: 'USD' },
        { label: 'Czech Koruna (Kč)', value: 'CZK' },
      ],
      defaultValue: ['EUR'],
    },
    {
      type: 'group',
      name: 'exchangeRates',
      label: 'Exchange Rates (1 EUR = ?)',
      admin: { description: 'Update manually when rates shift significantly' },
      fields: [
        { name: 'usd', type: 'number', defaultValue: 1.08, label: 'USD' },
        { name: 'czk', type: 'number', defaultValue: 25.2, label: 'CZK' },
      ],
    },
  ],
}
