// ─── Currency ───────────────────────────────────────────────────────────────

export type CurrencyCode = "BOB" | "USD" | "EUR" | "OTHER";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: "BOB", symbol: "Bs.", name: "Boliviano" },
  { code: "USD", symbol: "$", name: "Dólar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "OTHER", symbol: "💱", name: "Otro" },
];

// ─── Participant ─────────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  name: string;
  color: string; // hex color for avatar
  avatar?: string; // emoji or initials
}

// ─── Expense ─────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | "alojamiento"
  | "comida"
  | "transporte"
  | "actividades"
  | "compras"
  | "otros";

export const EXPENSE_CATEGORIES: {
  value: ExpenseCategory;
  label: string;
  icon: string;
}[] = [
  { value: "alojamiento", label: "Alojamiento", icon: "🏠" },
  { value: "comida", label: "Comida", icon: "🍽️" },
  { value: "transporte", label: "Transporte", icon: "🚗" },
  { value: "actividades", label: "Actividades", icon: "🎯" },
  { value: "compras", label: "Compras", icon: "🛍️" },
  { value: "otros", label: "Otros", icon: "💡" },
];

export interface Expense {
  id: string;
  description: string;
  /** Amount stored in CENTS to avoid floating-point rounding bugs */
  amountCents: number;
  paidBy: string; // Participant.id
  splitAmong: string[]; // Participant.ids
  category: ExpenseCategory;
  date: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

// ─── Trip ────────────────────────────────────────────────────────────────────

export interface Trip {
  id: string;
  name: string;
  destination: string;
  description?: string;
  startDate: string;
  endDate: string;
  participants: Participant[];
  expenses: Expense[];
  currency: CurrencyCode;
  /** Custom symbol when currency === 'OTHER' */
  customCurrencySymbol?: string;
  customCurrencyName?: string;
  coverEmoji: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Balance & Settlement ────────────────────────────────────────────────────

export interface Balance {
  participantId: string;
  participantName: string;
  color: string;
  /** In cents. Positive = others owe them. Negative = they owe others. */
  balanceCents: number;
}

export interface Transfer {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  /** In cents */
  amountCents: number;
}
