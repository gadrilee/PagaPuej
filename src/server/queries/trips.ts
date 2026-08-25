import { db } from "@/server/db";
import { trips, participants, expenses, expenseSplits, tripMembers } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import type { Trip as DbTrip } from "@/server/db/schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TripWithDetails = {
  id: string;
  name: string;
  destination: string;
  description: string | null;
  startDate: string;
  endDate: string;
  currency: "BOB" | "USD" | "EUR" | "OTHER";
  customCurrencySymbol: string | null;
  customCurrencyName: string | null;
  coverEmoji: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  participants: {
    id: string;
    name: string;
    color: string;
  }[];
  expenses: {
    id: string;
    description: string;
    amountCents: number;
    paidBy: string;
    category: string;
    date: string;
    createdAt: Date;
    updatedAt: Date;
    splitAmong: string[];
  }[];
};

// ─── Get all trips for a user ─────────────────────────────────────────────────

export async function getUserTrips(userId: string): Promise<DbTrip[]> {
  return db
    .select({
      id: trips.id,
      name: trips.name,
      destination: trips.destination,
      description: trips.description,
      startDate: trips.startDate,
      endDate: trips.endDate,
      currency: trips.currency,
      customCurrencySymbol: trips.customCurrencySymbol,
      customCurrencyName: trips.customCurrencyName,
      coverEmoji: trips.coverEmoji,
      ownerId: trips.ownerId,
      createdAt: trips.createdAt,
      updatedAt: trips.updatedAt,
    })
    .from(trips)
    .innerJoin(tripMembers, eq(tripMembers.tripId, trips.id))
    .where(eq(tripMembers.userId, userId))
    .orderBy(trips.createdAt);
}

// ─── Get full trip with participants & expenses ───────────────────────────────

export async function getTripWithDetails(
  tripId: string,
  userId: string
): Promise<TripWithDetails | null> {
  // Verify access
  const [member] = await db
    .select()
    .from(tripMembers)
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)));

  if (!member) return null;

  // Fetch trip
  const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
  if (!trip) return null;

  // Fetch participants
  const tripParticipants = await db
    .select()
    .from(participants)
    .where(eq(participants.tripId, tripId));

  // Fetch expenses
  const tripExpenses = await db
    .select()
    .from(expenses)
    .where(eq(expenses.tripId, tripId));

  // Fetch splits for all expenses
  const expenseIds = tripExpenses.map((e) => e.id);
  let allSplits: { expenseId: string; participantId: string }[] = [];
  if (expenseIds.length > 0) {
    allSplits = await db
      .select({ expenseId: expenseSplits.expenseId, participantId: expenseSplits.participantId })
      .from(expenseSplits)
      .where(
        expenseIds.length === 1
          ? eq(expenseSplits.expenseId, expenseIds[0])
          : // @ts-ignore — drizzle inList
            require("drizzle-orm").inArray(expenseSplits.expenseId, expenseIds)
      );
  }

  // Build splits map
  const splitsMap = new Map<string, string[]>();
  for (const split of allSplits) {
    if (!splitsMap.has(split.expenseId)) splitsMap.set(split.expenseId, []);
    splitsMap.get(split.expenseId)!.push(split.participantId);
  }

  return {
    ...trip,
    participants: tripParticipants,
    expenses: tripExpenses.map((e) => ({
      ...e,
      category: e.category as string,
      splitAmong: splitsMap.get(e.id) ?? [],
    })),
  };
}
