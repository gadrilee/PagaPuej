import { z } from "zod";
import { CURRENCIES } from "@/types";

const currencyCodes = CURRENCIES.map((c) => c.code) as [string, ...string[]];

// ─── Participant ─────────────────────────────────────────────────────────────

export const participantSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "Máximo 50 caracteres")
    .regex(/\S/, "No puede estar vacío"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido"),
});

export type ParticipantFormData = z.infer<typeof participantSchema>;

// ─── Trip ────────────────────────────────────────────────────────────────────

export const tripSchema = z.object({
  name: z.string().min(1, "El nombre del plan es requerido").max(80),
  destination: z.string().min(1, "El destino es requerido").max(80),
  description: z.string().max(200).optional(),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().min(1, "La fecha de fin es requerida"),
  currency: z.enum(["BOB", "USD", "EUR", "OTHER"]),
  customCurrencySymbol: z.string().max(5).optional(),
  customCurrencyName: z.string().max(20).optional(),
  coverEmoji: z.string().min(1),
});

export type TripFormData = z.infer<typeof tripSchema>;

// ─── Expense ─────────────────────────────────────────────────────────────────

export const expenseSchema = z
  .object({
    description: z.string().min(1, "La descripción es requerida").max(100),
    amount: z.preprocess(
      (val) => Number(val),
      z.number().positive("El monto debe ser mayor a 0").max(9_999_999, "Monto demasiado alto")
    ),
    paidBy: z.string().min(1, "Selecciona quién pagó"),
    splitAmong: z
      .array(z.string())
      .min(1, "Selecciona al menos una persona para dividir"),
    category: z.enum([
      "alojamiento",
      "comida",
      "transporte",
      "actividades",
      "compras",
      "otros",
    ]),
    date: z.string().min(1, "La fecha es requerida"),
  })
  .refine((data) => data.splitAmong.length > 0, {
    message: "Debe haber al menos un participante en la división",
    path: ["splitAmong"],
  });

export type ExpenseFormData = z.infer<typeof expenseSchema>;
