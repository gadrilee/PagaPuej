"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Trip, Participant, Expense, ExpenseCategory, CurrencyCode } from "@/types";
import { generateId, pickColor, today } from "@/lib/utils";
import { toCents } from "@/lib/calculations";

// ─── State Shape ──────────────────────────────────────────────────────────────

interface TripStore {
  trips: Trip[];
  activeTripId: string | null;

  // ── Trip CRUD ──
  createTrip: (data: CreateTripInput) => Trip;
  updateTrip: (id: string, data: Partial<Omit<Trip, "id" | "createdAt" | "participants" | "expenses">>) => void;
  deleteTrip: (id: string) => void;
  setActiveTrip: (id: string | null) => void;
  getTrip: (id: string) => Trip | undefined;

  // ── Participant CRUD ──
  addParticipant: (tripId: string, name: string) => void;
  removeParticipant: (tripId: string, participantId: string) => void;
  updateParticipant: (tripId: string, participantId: string, name: string) => void;

  // ── Expense CRUD ──
  addExpense: (tripId: string, data: ExpenseInput) => void;
  updateExpense: (tripId: string, expenseId: string, data: ExpenseInput) => void;
  deleteExpense: (tripId: string, expenseId: string) => void;
}

// ─── Input Types ──────────────────────────────────────────────────────────────

export interface CreateTripInput {
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
}

export interface ExpenseInput {
  description: string;
  /** Decimal amount (e.g. 123.45) — will be converted to cents internally */
  amount: number;
  paidBy: string;
  splitAmong: string[];
  category: ExpenseCategory;
  date: string;
}

// ─── Demo Trip (Samaipata example) ───────────────────────────────────────────

function buildDemoTrip(): Trip {
  const now = new Date().toISOString();
  const participants: Participant[] = [
    { id: "ana", name: "Ana", color: "#6366f1" },
    { id: "beto", name: "Beto", color: "#ec4899" },
    { id: "carla", name: "Carla", color: "#14b8a6" },
    { id: "diego", name: "Diego", color: "#f59e0b" },
  ];
  const allIds = participants.map((p) => p.id);
  const expenses: Expense[] = [
    {
      id: "exp-1",
      description: "Cabaña en Samaipata",
      amountCents: 80000,
      paidBy: "ana",
      splitAmong: allIds,
      category: "alojamiento",
      date: "2025-06-14",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "exp-2",
      description: "Entradas El Fuerte",
      amountCents: 16000,
      paidBy: "ana",
      splitAmong: allIds,
      category: "actividades",
      date: "2025-06-14",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "exp-3",
      description: "Cena",
      amountCents: 40000,
      paidBy: "beto",
      splitAmong: allIds,
      category: "comida",
      date: "2025-06-14",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "exp-4",
      description: "Gasolina",
      amountCents: 24000,
      paidBy: "carla",
      splitAmong: allIds,
      category: "transporte",
      date: "2025-06-14",
      createdAt: now,
      updatedAt: now,
    },
  ];
  return {
    id: "demo-samaipata",
    name: "Fin de Semana en Samaipata",
    destination: "Samaipata, Bolivia",
    description: "El viaje clásico de los 4 amigos 🎉",
    startDate: "2025-06-13",
    endDate: "2025-06-15",
    participants,
    expenses,
    currency: "BOB",
    coverEmoji: "🏔️",
    createdAt: now,
    updatedAt: now,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      trips: [buildDemoTrip()],
      activeTripId: "demo-samaipata",

      // ── Trip CRUD ──────────────────────────────────────────────────────────

      createTrip: (data) => {
        const now = new Date().toISOString();
        const participants: Participant[] = data.participantNames
          .filter((n) => n.trim())
          .map((name, index) => ({
            id: generateId(),
            name: name.trim(),
            color: pickColor(index),
          }));

        const trip: Trip = {
          id: generateId(),
          name: data.name,
          destination: data.destination,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          participants,
          expenses: [],
          currency: data.currency,
          customCurrencySymbol: data.customCurrencySymbol,
          customCurrencyName: data.customCurrencyName,
          coverEmoji: data.coverEmoji,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          trips: [trip, ...state.trips],
          activeTripId: trip.id,
        }));
        return trip;
      },

      updateTrip: (id, data) => {
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      deleteTrip: (id) => {
        set((state) => ({
          trips: state.trips.filter((t) => t.id !== id),
          activeTripId: state.activeTripId === id ? null : state.activeTripId,
        }));
      },

      setActiveTrip: (id) => set({ activeTripId: id }),

      getTrip: (id) => get().trips.find((t) => t.id === id),

      // ── Participant CRUD ────────────────────────────────────────────────────

      addParticipant: (tripId, name) => {
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id !== tripId) return t;
            const newParticipant: Participant = {
              id: generateId(),
              name: name.trim(),
              color: pickColor(t.participants.length),
            };
            return {
              ...t,
              participants: [...t.participants, newParticipant],
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      removeParticipant: (tripId, participantId) => {
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id !== tripId) return t;
            return {
              ...t,
              participants: t.participants.filter((p) => p.id !== participantId),
              // Also clean from expenses
              expenses: t.expenses.map((e) => ({
                ...e,
                splitAmong: e.splitAmong.filter((id) => id !== participantId),
              })),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      updateParticipant: (tripId, participantId, name) => {
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id !== tripId) return t;
            return {
              ...t,
              participants: t.participants.map((p) =>
                p.id === participantId ? { ...p, name: name.trim() } : p
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // ── Expense CRUD ────────────────────────────────────────────────────────

      addExpense: (tripId, data) => {
        const now = new Date().toISOString();
        const expense: Expense = {
          id: generateId(),
          description: data.description,
          amountCents: toCents(data.amount),
          paidBy: data.paidBy,
          splitAmong: data.splitAmong,
          category: data.category,
          date: data.date,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id !== tripId) return t;
            return {
              ...t,
              expenses: [...t.expenses, expense],
              updatedAt: now,
            };
          }),
        }));
      },

      updateExpense: (tripId, expenseId, data) => {
        const now = new Date().toISOString();
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id !== tripId) return t;
            return {
              ...t,
              expenses: t.expenses.map((e) => {
                if (e.id !== expenseId) return e;
                return {
                  ...e,
                  description: data.description,
                  amountCents: toCents(data.amount),
                  paidBy: data.paidBy,
                  splitAmong: data.splitAmong,
                  category: data.category,
                  date: data.date,
                  updatedAt: now,
                };
              }),
              updatedAt: now,
            };
          }),
        }));
      },

      deleteExpense: (tripId, expenseId) => {
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id !== tripId) return t;
            return {
              ...t,
              expenses: t.expenses.filter((e) => e.id !== expenseId),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
    }),
    {
      name: "pagapuej-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
