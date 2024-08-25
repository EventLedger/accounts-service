const DEFAULT_SUPPORTED_CURRENCY = 'GBP' as const
export const SUPPORTED_CURRENCIES = [
  DEFAULT_SUPPORTED_CURRENCY,
  'USD',
  'EUR',
  'BTC',
  'CNY',
  'JPY',
] as const

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]
