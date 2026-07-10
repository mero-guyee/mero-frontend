import { Expense } from '@/types';

export { getCurrencySymbol } from './constants';

export function groupExpensesByCurrency(expenses: Expense[]): { currency: string; amount: number }[] {
  const totals: Record<string, number> = {};
  const counts: Record<string, number> = {};
  expenses.forEach(({ currency, amount }) => {
    totals[currency] = (totals[currency] || 0) + amount;
    counts[currency] = (counts[currency] || 0) + 1;
  });
  return Object.entries(totals)
    .sort(([a], [b]) => (counts[b] || 0) - (counts[a] || 0))
    .map(([currency, amount]) => ({ currency, amount }));
}
