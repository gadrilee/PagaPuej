import { pgTable, text, integer, timestamp, boolean, pgEnum, uuid } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const currencyEnum = pgEnum("currency_code", ["BOB", "USD", "EUR", "OTHER"]);
export const expenseCategoryEnum = pgEnum("expense_category", [
  "alojamiento",
  "comida",
  "transporte",
  "actividades",
  "compras",
  "otros",
]);

// ─── Profiles ───────────────────────────────────────────────────────────────────

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // auth.users.id
  email: text("email").notNull(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Trips ────────────────────────────────────────────────────────────────────

export const trips = pgTable("trips", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  destination: text("destination").notNull(),
  description: text("description"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  currency: currencyEnum("currency").notNull().default("BOB"),
  customCurrencySymbol: text("custom_currency_symbol"),
  customCurrencyName: text("custom_currency_name"),
  coverEmoji: text("cover_emoji").notNull().default("✈️"),
  ownerId: uuid("owner_id").notNull(), // auth.users.id
  inviteCode: text("invite_code").notNull().unique().default(sql`substring(md5(random()::text) from 1 for 6)`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Trip Members ─────────────────────────────────────────────────────────────

export const tripMembers = pgTable("trip_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull(), // auth.users.id
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Participants ─────────────────────────────────────────────────────────────

export const participants = pgTable("participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6366f1"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  /** Amount stored in CENTS (integer) — no floating point */
  amountCents: integer("amount_cents").notNull(),
  paidBy: uuid("paid_by").notNull().references(() => participants.id, { onDelete: "cascade" }),
  category: expenseCategoryEnum("category").notNull().default("otros"),
  isPayment: boolean("is_payment").notNull().default(false),
  date: text("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Expense Splits ───────────────────────────────────────────────────────────

export const expenseSplits = pgTable("expense_splits", {
  id: uuid("id").primaryKey().defaultRandom(),
  expenseId: uuid("expense_id").notNull().references(() => expenses.id, { onDelete: "cascade" }),
  participantId: uuid("participant_id").notNull().references(() => participants.id, { onDelete: "cascade" }),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const tripsRelations = relations(trips, ({ many }) => ({
  members: many(tripMembers),
  participants: many(participants),
  expenses: many(expenses),
}));

export const participantsRelations = relations(participants, ({ one, many }) => ({
  trip: one(trips, { fields: [participants.tripId], references: [trips.id] }),
  expensesPaid: many(expenses),
  splits: many(expenseSplits),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  trip: one(trips, { fields: [expenses.tripId], references: [trips.id] }),
  payer: one(participants, { fields: [expenses.paidBy], references: [participants.id] }),
  splits: many(expenseSplits),
}));

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, { fields: [expenseSplits.expenseId], references: [expenses.id] }),
  participant: one(participants, { fields: [expenseSplits.participantId], references: [participants.id] }),
}));

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type ExpenseSplit = typeof expenseSplits.$inferSelect;
