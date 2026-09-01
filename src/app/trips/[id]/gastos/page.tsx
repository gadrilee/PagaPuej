"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTripData } from "@/hooks/useTripData";
import { formatAmount, fromCents } from "@/lib/calculations";
import { createExpenseAction, updateExpenseAction, deleteExpenseAction } from "@/server/actions/trips";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft, Plus, Trash2, Pencil, Receipt, X, Check, Loader2 } from "lucide-react";
import { EXPENSE_CATEGORIES } from "@/types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, type ExpenseFormData } from "@/lib/validations";
import { today, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { Trip, Expense } from "@/types";

export default function GastosPage() {
  const { trip, userMeta } = useTripData();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!trip) return <NotFound />;

  const editingExpense = editingId ? trip.expenses.find((e) => e.id === editingId) : null;

  const handleDelete = (expenseId: string, desc: string) => {
    if (confirm(`¿Eliminar "${desc}"?`)) {
      startTransition(async () => {
        await deleteExpenseAction(trip.id, expenseId);
        router.refresh();
      });
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = (data: ExpenseFormData) => {
    startTransition(async () => {
      if (editingId) {
        await updateExpenseAction(trip.id, editingId, data);
      } else {
        await createExpenseAction(trip.id, data);
      }
      handleClose();
      router.refresh();
    });
  };

  return (
    <>
      <Navbar userEmail={userMeta.email} userName={userMeta.name} />
      <main className="page-container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        <Link href={`/trips/${trip.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", textDecoration: "none", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          <ArrowLeft size={16} />
          {trip.name}
        </Link>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Receipt size={20} style={{ color: "var(--accent-violet)" }} />
              <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Gastos</h1>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              {trip.expenses.length} gasto{trip.expenses.length !== 1 ? "s" : ""} registrado{trip.expenses.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => { setEditingId(null); setShowForm(true); }}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.75rem 1.25rem", border: "none", cursor: "pointer", fontSize: "0.875rem" }}
          >
            <Plus size={16} />
            Agregar gasto
          </button>
        </motion.div>

        {trip.expenses.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: "4rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>💸</div>
            <h2 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Sin gastos aún</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.25rem" }}>Registra el primer gasto del viaje</p>
            <button onClick={() => setShowForm(true)} className="btn-primary" style={{ padding: "0.75rem 1.5rem", border: "none", cursor: "pointer", fontSize: "0.9rem" }}>
              <Plus size={16} style={{ marginRight: 6 }} /> Agregar gasto
            </button>
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <AnimatePresence>
              {[...trip.expenses].reverse().map((expense, i) => {
                const payer = trip.participants.find((p) => p.id === expense.paidBy);
                const cat = EXPENSE_CATEGORIES.find((c) => c.value === expense.category);
                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass-card"
                    style={{ padding: "1.125rem 1.25rem" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", minWidth: 0 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0 }}>
                          {cat?.icon ?? "💡"}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{expense.description}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            Pagó{" "}
                            <span style={{ padding: "2px 8px", borderRadius: "var(--radius-full)", background: `${payer?.color ?? "#888"}22`, color: payer?.color ?? "#888", fontWeight: 600 }}>
                              {payer?.name ?? "?"}
                            </span>{" "}
                            · {formatDate(expense.date)}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                            Divide entre {expense.splitAmong.length} persona{expense.splitAmong.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                        <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--accent-emerald)", whiteSpace: "nowrap" }}>
                          {formatAmount(expense.amountCents, trip)}
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => handleEdit(expense)} disabled={isPending} style={{ padding: 8, borderRadius: "var(--radius-md)", background: "rgba(139,92,246,0.1)", border: "none", color: "var(--accent-violet)", cursor: "pointer" }}>
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(expense.id, expense.description)} disabled={isPending} style={{ padding: 8, borderRadius: "var(--radius-md)", background: "rgba(244,63,94,0.1)", border: "none", color: "var(--accent-rose)", cursor: "pointer" }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {isPending && (
          <div style={{ position: "fixed", bottom: 24, right: 24, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-full)", padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem" }}>
            <Loader2 size={14} className="animate-spin" style={{ color: "var(--accent-violet)" }} />
            Guardando...
          </div>
        )}
      </main>

      <AnimatePresence>
        {showForm && (
          <ExpenseModal
            trip={trip}
            editing={editingExpense ?? null}
            onClose={handleClose}
            onSave={handleSave}
            isPending={isPending}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Expense Modal ─────────────────────────────────────────────────────────────

function ExpenseModal({
  trip, editing, onClose, onSave, isPending,
}: {
  trip: Trip;
  editing: Expense | null;
  onClose: () => void;
  onSave: (data: ExpenseFormData) => void;
  isPending: boolean;
}) {
  const allIds = trip.participants.map((p) => p.id);
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: editing
      ? { description: editing.description, amount: fromCents(editing.amountCents), paidBy: editing.paidBy, splitAmong: editing.splitAmong, category: editing.category, date: editing.date }
      : { splitAmong: allIds, category: "otros", date: today() },
  });

  const watchedSplit = watch("splitAmong") ?? allIds;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", padding: "1.75rem", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{editing ? "✏️ Editar gasto" : "➕ Nuevo gasto"}</h2>
          <button onClick={onClose} style={{ padding: 8, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSave)}>
          <MField label="Descripción" error={errors.description?.message}>
            <input {...register("description")} className="input-field" placeholder="Ej: Cena en el restaurante" />
          </MField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <MField label="Monto" error={errors.amount?.message}>
              <input {...register("amount", { valueAsNumber: true })} type="number" step="0.01" className="input-field" placeholder="0.00" />
            </MField>
            <MField label="Fecha" error={errors.date?.message}>
              <input {...register("date")} type="date" className="input-field" />
            </MField>
          </div>
          <MField label="Categoría" error={errors.category?.message}>
            <select {...register("category")} className="input-field">
              {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </select>
          </MField>
          <MField label="¿Quién pagó?" error={errors.paidBy?.message}>
            <select {...register("paidBy")} className="input-field">
              <option value="">Selecciona...</option>
              {trip.participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </MField>
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>Dividir entre</label>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{watchedSplit.length} de {trip.participants.length}</span>
            </div>
            <Controller name="splitAmong" control={control} render={({ field }) => (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {trip.participants.map((p) => {
                  const isChecked = field.value?.includes(p.id);
                  return (
                    <button key={p.id} type="button" onClick={() => { const current = field.value ?? []; field.onChange(isChecked ? current.filter((id) => id !== p.id) : [...current, p.id]); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: "var(--radius-full)", border: `1px solid ${isChecked ? p.color : "var(--border-default)"}`, background: isChecked ? `${p.color}22` : "var(--bg-elevated)", color: isChecked ? p.color : "var(--text-secondary)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: isChecked ? 600 : 400, transition: "all 0.15s" }}>
                      {isChecked && <Check size={12} />}
                      {p.name}
                    </button>
                  );
                })}
              </div>
            )} />
            {errors.splitAmong && <p style={{ color: "var(--accent-rose)", fontSize: "0.75rem", marginTop: 4 }}>{errors.splitAmong.message}</p>}
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "0.875rem", borderRadius: "var(--radius-full)", border: "1px solid var(--border-default)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.9rem" }}>Cancelar</button>
            <button type="submit" disabled={isPending} className="btn-primary" style={{ flex: 2, padding: "0.875rem", border: "none", cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {isPending ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : editing ? "Guardar cambios" : "Agregar gasto"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function MField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{label}</label>
      {children}
      {error && <p style={{ color: "var(--accent-rose)", fontSize: "0.75rem", marginTop: 4 }}>{error}</p>}
    </div>
  );
}

function NotFound() {
  return (
    <>
      <Navbar />
      <main className="page-container" style={{ paddingTop: "4rem", textAlign: "center" }}>
        <h1>Viaje no encontrado</h1>
        <Link href="/trips">Volver</Link>
      </main>
    </>
  );
}
