"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { trips, tripMembers, participants, expenses, expenseSplits } from "@/server/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and } from "drizzle-orm";
import { generateId, pickColor } from "@/lib/utils";
import { toCents } from "@/lib/calculations";
import type { CurrencyCode, ExpenseCategory } from "@/types";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/auth/login");
  return user;
}

// ─── Trip Actions ─────────────────────────────────────────────────────────────

export async function createTripAction(data: {
  name: string;
  destination: string;
  description?: string;
  startDate: string;
  endDate: string;
  currency: CurrencyCode;
  customCurrencySymbol?: string;
  customCurrencyName?: string;
  coverEmoji: string;
  participantNames: string[];
}) {
  const user = await requireAuth();

  const [trip] = await db
    .insert(trips)
    .values({
      name: data.name,
      destination: data.destination,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      currency: data.currency,
      customCurrencySymbol: data.customCurrencySymbol,
      customCurrencyName: data.customCurrencyName,
      coverEmoji: data.coverEmoji,
      ownerId: user.id,
    })
    .returning();

  // Add owner to trip_members
  await db.insert(tripMembers).values({
    tripId: trip.id,
    userId: user.id,
  });

  // Add participants
  const validNames = data.participantNames.filter((n) => n.trim());
  if (validNames.length > 0) {
    await db.insert(participants).values(
      validNames.map((name, index) => ({
        tripId: trip.id,
        name: name.trim(),
        color: pickColor(index),
      }))
    );
  }

  revalidatePath("/trips");
  redirect(`/trips/${trip.id}`);
}

export async function deleteTripAction(tripId: string) {
  const user = await requireAuth();

  // Verify ownership
  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.ownerId, user.id)));

  if (!trip) throw new Error("Trip not found or access denied");

  await db.delete(trips).where(eq(trips.id, tripId));
  revalidatePath("/trips");
  redirect("/trips");
}

// ─── Participant Actions ──────────────────────────────────────────────────────

export async function addParticipantAction(tripId: string, name: string) {
  const user = await requireAuth();

  // Count existing participants for color picking
  const existing = await db
    .select()
    .from(participants)
    .where(eq(participants.tripId, tripId));

  await db.insert(participants).values({
    tripId,
    name: name.trim(),
    color: pickColor(existing.length),
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function removeParticipantAction(tripId: string, participantId: string) {
  await requireAuth();
  await db.delete(participants).where(eq(participants.id, participantId));
  revalidatePath(`/trips/${tripId}`);
}

// ─── Expense Actions ──────────────────────────────────────────────────────────

export async function createExpenseAction(
  tripId: string,
  data: {
    description: string;
    amount: number;
    paidBy: string;
    splitAmong: string[];
    category: ExpenseCategory;
    date: string;
  }
) {
  await requireAuth();

  try {
    await db.transaction(async (tx) => {
      const [expense] = await tx
        .insert(expenses)
        .values({
          tripId,
          description: data.description,
          amountCents: toCents(data.amount),
          paidBy: data.paidBy,
          category: data.category,
          date: data.date,
        })
        .returning();

      // Insert splits
      if (data.splitAmong.length > 0) {
        // Ensure no duplicates
        const uniqueParticipants = Array.from(new Set(data.splitAmong));
        await tx.insert(expenseSplits).values(
          uniqueParticipants.map((participantId) => ({
            expenseId: expense.id,
            participantId,
          }))
        );
      }
    });
  } catch (err: any) {
    console.error("=== FATAL DB ERROR in createExpenseAction ===");
    console.error(err);
    console.error("CODE:", err.code);
    console.error("DETAIL:", err.detail);
    throw err;
  }

  revalidatePath(`/trips/${tripId}/gastos`);
  revalidatePath(`/trips/${tripId}/saldos`);
  revalidatePath(`/trips/${tripId}/liquidar`);
}

export async function updateExpenseAction(
  tripId: string,
  expenseId: string,
  data: {
    description: string;
    amount: number;
    paidBy: string;
    splitAmong: string[];
    category: ExpenseCategory;
    date: string;
  }
) {
  await requireAuth();

  await db
    .update(expenses)
    .set({
      description: data.description,
      amountCents: toCents(data.amount),
      paidBy: data.paidBy,
      category: data.category,
      date: data.date,
      updatedAt: new Date(),
    })
    .where(eq(expenses.id, expenseId));

  // Delete old splits and re-insert
  await db.delete(expenseSplits).where(eq(expenseSplits.expenseId, expenseId));

  if (data.splitAmong.length > 0) {
    await db.insert(expenseSplits).values(
      data.splitAmong.map((participantId) => ({
        expenseId,
        participantId,
      }))
    );
  }

  revalidatePath(`/trips/${tripId}/gastos`);
  revalidatePath(`/trips/${tripId}/saldos`);
  revalidatePath(`/trips/${tripId}/liquidar`);
}

export async function deleteExpenseAction(tripId: string, expenseId: string) {
  await requireAuth();
  await db.delete(expenses).where(eq(expenses.id, expenseId));
  revalidatePath(`/trips/${tripId}/gastos`);
  revalidatePath(`/trips/${tripId}/saldos`);
  revalidatePath(`/trips/${tripId}/liquidar`);
}
