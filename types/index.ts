// Local domain types (aligned with server API)

export type FootprintLocation = {
  placeName?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
};

export type Trip = {
  id: string;
  serverId?: string;
  title: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  countries: string[];
};

export type Footprint = {
  id: string;
  serverId?: string;
  tripId: string;
  title: string;
  content: string;
  date: string;
  locations: FootprintLocation[];
  photoUrls: string[];
  weatherInfo?: string;
};

export type Memo = {
  id: string;
  serverId?: string;
  tripId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type Expense = {
  id: string;
  serverId?: string;
  tripId: string;
  footprintId?: string;
  categoryId: string;
  amount: number;
  currency: string;
  description?: string;
  date: string;
  location?: string;
};

export type ExpenseCategory = {
  id: string;
  serverId?: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
};

export type Budget = {
  id: string;
  serverId?: string;
  tripId: string;
  currency: string;
  amount: number;
  exchangeRate?: number;
};

export type Screen =
  | { type: "tripList" }
  | { type: "tripHome"; tripId: string }
  | { type: "tripForm"; tripId?: string }
  | { type: "footprintList"; tripId?: string }
  | { type: "footprintDetail"; footprintId: string }
  | { type: "footprintForm"; footprintId?: string; tripId?: string }
  | {
      type: "expenseForm";
      tripId: string;
      footprintId?: string;
      date?: string;
      expenseId?: string;
    }
  | { type: "memoForm"; tripId: string; memoId?: string }
  | { type: "categoryManager" }
  | { type: "categoryForm"; categoryId?: string }
  | { type: "map" }
  | { type: "expense" }
  | { type: "settings" }
  | { type: "loading" }
  | { type: "login" }
  | { type: "signup" };
