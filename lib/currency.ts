export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'JPY'
  | 'CNY'
  | 'AUD'
  | 'CAD'
  | 'CHF'
  | 'HKD'
  | 'SGD'
  | 'SEK'
  | 'KRW'
  | 'NOK'
  | 'NZD'
  | 'INR'
  | 'MXN'
  | 'BRL'
  | 'ZAR'
  | 'TRY'
  | 'AED';

export type CurrencyInfo = {
  code: CurrencyCode;
  name: string;
  symbol: string;
};

export const DEFAULT_CURRENCY: CurrencyCode = 'EUR';

export const TOP_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
];

export const SUPPORTED_CURRENCY_CODES = new Set<CurrencyCode>(
  TOP_CURRENCIES.map((currency) => currency.code)
);

export function normalizeCurrencyCode(
  code: string | null | undefined,
  fallback: CurrencyCode = DEFAULT_CURRENCY
): CurrencyCode {
  const upper = (code ?? '').toUpperCase() as CurrencyCode;
  return SUPPORTED_CURRENCY_CODES.has(upper) ? upper : fallback;
}

export type RateMap = Partial<Record<CurrencyCode, number>>;

export function convertMinorUnits(
  amountInMinor: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rates: RateMap
): { amountInMinor: number; currency: CurrencyCode; warning?: string } {
  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (!fromRate || !toRate) {
    return {
      amountInMinor,
      currency: fromCurrency,
      warning: 'Missing rate for conversion; returned original amount',
    };
  }

  const baseAmount = amountInMinor / fromRate;
  const converted = Math.round(baseAmount * toRate);
  return { amountInMinor: converted, currency: toCurrency };
}
