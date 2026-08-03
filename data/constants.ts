export const CURRENCIES = [
  { code: 'KRW', symbol: '₩', name: '대한민국 원' },
  { code: 'USD', symbol: '$', name: '미국 달러' },
  { code: 'EUR', symbol: '€', name: '유로' },
  { code: 'JPY', symbol: '¥', name: '일본 엔' },
  { code: 'GBP', symbol: '£', name: '영국 파운드' },
  { code: 'CNY', symbol: '¥', name: '중국 위안' },
  { code: 'CHF', symbol: 'CHF', name: '스위스 프랑' },
  { code: 'CAD', symbol: 'C$', name: '캐나다 달러' },
  { code: 'AUD', symbol: 'A$', name: '호주 달러' },
  { code: 'PEN', symbol: 'S/', name: '페루 솔' },
  { code: 'BOB', symbol: 'Bs.', name: '볼리비아노' },
  { code: 'CLP', symbol: '$', name: '칠레 페소' },
  { code: 'ARS', symbol: '$', name: '아르헨티나 페소' },
  { code: 'BRL', symbol: 'R$', name: '브라질 헤알' },
  { code: 'COP', symbol: '$', name: '콜롬비아 페소' },
  { code: 'UYU', symbol: '$U', name: '우루과이 페소' },
  { code: 'PYG', symbol: '₲', name: '파라과이 과라니' },
  { code: 'VES', symbol: 'Bs.S', name: '베네수엘라 볼리바르' },
  { code: 'GYD', symbol: 'G$', name: '가이아나 달러' },
  { code: 'SRD', symbol: '$', name: '수리남 달러' },
  { code: 'TWD', symbol: 'NT$', name: '대만 달러' },
  { code: 'HKD', symbol: 'HK$', name: '홍콩 달러' },
  { code: 'SGD', symbol: 'S$', name: '싱가포르 달러' },
  { code: 'THB', symbol: '฿', name: '태국 바트' },
  { code: 'VND', symbol: '₫', name: '베트남 동' },
  { code: 'PHP', symbol: '₱', name: '필리핀 페소' },
  { code: 'MYR', symbol: 'RM', name: '말레이시아 링깃' },
  { code: 'IDR', symbol: 'Rp', name: '인도네시아 루피아' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE 디르함' },
  { code: 'SAR', symbol: '﷼', name: '사우디 리얄' },
  { code: 'ZAR', symbol: 'R', name: '남아공 랜드' },
  { code: 'EGP', symbol: '£', name: '이집트 파운드' },
  { code: 'SEK', symbol: 'kr', name: '스웨덴 크로나' },
  { code: 'NOK', symbol: 'kr', name: '노르웨이 크로네' },
  { code: 'DKK', symbol: 'kr', name: '덴마크 크로네' },
  { code: 'PLN', symbol: 'zł', name: '폴란드 즐로티' },
  { code: 'CZK', symbol: 'Kč', name: '체코 코루나' },
  { code: 'HUF', symbol: 'Ft', name: '헝가리 포린트' },
  { code: 'RUB', symbol: '₽', name: '러시아 루블' },
  { code: 'NZD', symbol: 'NZ$', name: '뉴질랜드 달러' },
  { code: 'MXN', symbol: '$', name: '멕시코 페소' },
  { code: 'INR', symbol: '₹', name: '인도 루피' },
] as const;

export type Currency = (typeof CURRENCIES)[number]['code'];

export const getCurrencySymbol = (code: string) =>
  CURRENCIES.find((c) => c.code === code)?.symbol || code;

export const getCurrencyName = (code: string) =>
  CURRENCIES.find((c) => c.code === code)?.name || code;

export const getCurrencyCode = (code: string) =>
  CURRENCIES.find((c) => c.code === code)?.code || code;
