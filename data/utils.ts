import { CURRENCY_SYMBOLS } from './constants';

export const getCurrencySymbol = (currency: string) => CURRENCY_SYMBOLS[currency] || currency;
