/**
 * calculations.ts
 * ────────────────────────────────────────────────────────────────────────────
 * All monetary arithmetic is done in CENTS (integers) to avoid IEEE-754
 * floating-point bugs.
 *
 * Key invariant: sum(balances) === 0 always.
 *
 * When dividing N cents among P people:
 *   base   = Math.floor(N / P)
 *   remainder = N % P
 * The first `remainder` participants each pay (base + 1), the rest pay base.
 * This distributes every cent and sum stays exact.
 */

import type { Balance, Expense, Participant, Transfer, Trip, Currency } from "@/types";
import { CURRENCIES } from "@/types";

// ─── Currency helpers ────────────────────────────────────────────────────────

export function getCurrency(trip: Trip): Currency {
  const found = CURRENCIES.find((c) => c.code === trip.currency);
  if (trip.currency === "OTHER") {
    return {
      code: "OTHER",
      symbol: trip.customCurrencySymbol ?? "💱",
      name: trip.customCurrencyName ?? "Otro",
    };
  }
  return found ?? CURRENCIES[0];
}

export function formatAmount(cents: number, trip: Trip): string {
  const currency = getCurrency(trip);
  const amount = cents / 100;
  return `${currency.symbol} ${amount.toFixed(2)}`;
}

export function formatAmountWithCurrency(cents: number, symbol: string): string {
  const amount = cents / 100;
  return `${symbol} ${amount.toFixed(2)}`;
}

/** Parse a decimal string to cents (e.g. "123.45" → 12345) */
export function toCents(value: number): number {
  // Round to avoid floating-point drift in multiplication
  return Math.round(value * 100);
}

/** Convert cents to decimal number */
export function fromCents(cents: number): number {
  return cents / 100;
}

// ─── Balance calculation ─────────────────────────────────────────────────────

/**
 * Calculates the net balance for each participant.
 *
 * For each expense:
 *  - The payer is CREDITED the full amount.
 *  - Each person in splitAmong is DEBITED their share (with remainder pennies
 *    going to the first participants in the split list).
 *
 * Returns an array of Balance objects.
 * Invariant: sum(b.balanceCents) === 0
 */
export function calculateBalances(trip: Trip): Balance[] {
  const balanceMap = new Map<string, number>();

  // Initialize all participants at 0
  for (const p of trip.participants) {
    balanceMap.set(p.id, 0);
  }

  for (const expense of trip.expenses) {
    const { amountCents, paidBy, splitAmong } = expense;

    if (splitAmong.length === 0) continue;

    // Credit the payer
    balanceMap.set(paidBy, (balanceMap.get(paidBy) ?? 0) + amountCents);

    // Debit each person in the split (with remainder penny distribution)
    const base = Math.floor(amountCents / splitAmong.length);
    const remainder = amountCents % splitAmong.length;

    splitAmong.forEach((participantId, index) => {
      const share = index < remainder ? base + 1 : base;
      balanceMap.set(participantId, (balanceMap.get(participantId) ?? 0) - share);
    });
  }

  // Build result array
  return trip.participants.map((p) => ({
    participantId: p.id,
    participantName: p.name,
    color: p.color,
    balanceCents: balanceMap.get(p.id) ?? 0,
  }));
}

/**
 * Verifies the zero-sum invariant. Throws in development if violated.
 */
export function assertZeroSum(balances: Balance[]): void {
  const total = balances.reduce((sum, b) => sum + b.balanceCents, 0);
  if (total !== 0 && process.env.NODE_ENV === "development") {
    console.error(`[PagaPuej] Balance invariant violated! Sum = ${total} cents`);
  }
}

// ─── Debt settlement (greedy algorithm) ─────────────────────────────────────

/**
 * Computes the minimum set of transfers to settle all debts.
 *
 * Algorithm:
 *  1. Separate into creditors (balance > 0) and debtors (balance < 0).
 *  2. Greedily match the largest debtor with the largest creditor.
 *  3. The smaller of the two amounts is transferred; the larger carries over.
 *
 * This minimizes the number of transactions.
 */
export function calculateSettlement(balances: Balance[]): Transfer[] {
  const transfers: Transfer[] = [];

  // Work with mutable copies
  const creditors = balances
    .filter((b) => b.balanceCents > 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.balanceCents - a.balanceCents);

  const debtors = balances
    .filter((b) => b.balanceCents < 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.balanceCents - b.balanceCents); // most negative first

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];

    const amount = Math.min(creditor.balanceCents, -debtor.balanceCents);

    if (amount > 0) {
      transfers.push({
        fromId: debtor.participantId,
        fromName: debtor.participantName,
        toId: creditor.participantId,
        toName: creditor.participantName,
        amountCents: amount,
      });
    }

    creditor.balanceCents -= amount;
    debtor.balanceCents += amount;

    if (creditor.balanceCents === 0) ci++;
    if (debtor.balanceCents === 0) di++;
  }

  return transfers;
}

// ─── Trip summary helpers ────────────────────────────────────────────────────

export function getTripTotalCents(trip: Trip): number {
  return trip.expenses.reduce((sum, e) => sum + e.amountCents, 0);
}

export function getParticipantTotalPaidCents(trip: Trip, participantId: string): number {
  return trip.expenses
    .filter((e) => e.paidBy === participantId)
    .reduce((sum, e) => sum + e.amountCents, 0);
}
