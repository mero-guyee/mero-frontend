// 원본 App.tsx에서 추출한 타입 정의

export type Trip = {
  id: string;
  title: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  countries: string[];
  status: "ongoing" | "completed";
};

export type Diary = {
  id: string;
  tripId: string;
  title: string;
  date: string;
  time: string;
  location: string;
  country: string;
  content: string;
  photos: string[];
  weather?: string;
  temperature?: number;
  tags?: string[];
};

export type Expense = {
  id: string;
  tripId: string;
  diaryId?: string;
  date: string;
  category: string;
  amount: number;
  currency: string;
  memo: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
};

export type Budget = {
  id: string;
  tripId: string;
  currency: string;
  amount: number;
};

export type Note = {
  id: string;
  tripId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type Screen =
  | { type: "tripList" }
  | { type: "tripHome"; tripId: string }
  | { type: "tripForm"; tripId?: string }
  | { type: "diaryList"; tripId?: string }
  | { type: "diaryDetail"; diaryId: string }
  | { type: "diaryForm"; diaryId?: string; tripId?: string }
  | {
      type: "expenseForm";
      tripId: string;
      diaryId?: string;
      date?: string;
      expenseId?: string;
    }
  | { type: "noteForm"; tripId: string; noteId?: string }
  | { type: "categoryManager" }
  | { type: "categoryForm"; categoryId?: string }
  | { type: "map" }
  | { type: "expense" }
  | { type: "settings" }
  | { type: "loading" }
  | { type: "login" }
  | { type: "signup" };
