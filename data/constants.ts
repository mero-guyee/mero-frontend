import { ExpenseCategory } from '../types';

export const MOCK_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: '1', name: '교통', icon: '🚕', color: '#4CAF50', isDefault: true },
  { id: '2', name: '식비', icon: '🍽️', color: '#FF9800', isDefault: true },
  { id: '3', name: '숙박', icon: '🏨', color: '#2196F3', isDefault: true },
  { id: '4', name: '액티비티', icon: '🎭', color: '#9C27B0', isDefault: true },
  { id: '5', name: '쇼핑', icon: '🛍️', color: '#E91E63', isDefault: true },
  { id: '6', name: '기타', icon: '💰', color: '#607D8B', isDefault: true },
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  KRW: '₩',
  JPY: '¥',
  EUR: '€',
  GBP: '£',
  CNY: '¥',
  THB: '฿',
  VND: '₫',
};

export const CURRENCY_NAMES: Record<string, string> = {
  USD: '미국 달러',
  KRW: '한국 원',
  JPY: '일본 엔',
  EUR: '유로',
  GBP: '영국 파운드',
  CNY: '중국 위안',
  THB: '태국 바트',
  VND: '베트남 동',
};
