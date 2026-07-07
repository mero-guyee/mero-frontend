export const CURRENCIES = [
  { code: 'KRW', symbol: '₩', name: '한국 원' },
  { code: 'USD', symbol: '$', name: '미국 달러' },
  { code: 'EUR', symbol: '€', name: '유로' },
  { code: 'JPY', symbol: '¥', name: '일본 엔' },
  { code: 'GBP', symbol: '£', name: '영국 파운드' },
  { code: 'CNY', symbol: '¥', name: '중국 위안' },
  { code: 'THB', symbol: '฿', name: '태국 바트' },
  { code: 'VND', symbol: '₫', name: '베트남 동' },
  { code: 'PEN', symbol: 'S/', name: '페루 솔' },
  { code: 'BRL', symbol: 'R$', name: '브라질 헤알' },
] as const;

export const getCurrencySymbol = (code: string) =>
  CURRENCIES.find((c) => c.code === code)?.symbol || code;

export const getCurrencyName = (code: string) =>
  CURRENCIES.find((c) => c.code === code)?.name || code;

export const getCurrencyCode = (code: string) =>
  CURRENCIES.find((c) => c.code === code)?.code || code;
