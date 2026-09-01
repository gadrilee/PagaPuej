"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripSchema, type TripFormData } from "@/lib/validations";
import { createTripAction } from "@/server/actions/trips";
import { searchUserByUsernameAction } from "@/server/actions/users";
import Navbar from "@/components/layout/Navbar";
import { Plus, Trash2, ArrowLeft, Plane, Users, Settings, Check, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { TRIP_EMOJIS, pickColor, today } from "@/lib/utils";

const CURRENCIES = [
  { code: "BOB", symbol: "Bs.", name: "Boliviano" },
  { code: "USD", symbol: "$", name: "Dólar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "OTHER", symbol: "💱", name: "Otro" },
] as const;

export default function NewTripClient({ userName }: { userName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [participants, setParticipants] = useState<{name: string; userId?: string}[]>([
    { name: userName }, 
    { name: "" }
  ]);
  const [selectedEmoji, setSelectedEmoji] = useState("✈️");

  const [searchUsername, setSearchUsername] = useState("");
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      currency: "BOB",
      coverEmoji: "✈️",
      startDate: today(),
      endDate: today(),
    },
  });

  const watchedCurrency = watch("currency");

  const validParticipantsCount = participants.filter((p) => p.name.trim()).length;

  const addParticipant = () => setParticipants((p) => [...p, { name: "" }]);
  
  const removeParticipant = (i: number) => {
    if (i === 0) return; // Cannot remove Participant 1
    setParticipants((p) => p.filter((_, idx) => idx !== i));
  };
  
  const updateParticipantName = (i: number, v: string) =>
    setParticipants((p) => p.map((x, idx) => (idx === i ? { ...x, name: v } : x)));

  const handleSearchUser = async () => {
    if (!searchUsername.trim()) return;
    
    // Check if already added
    if (participants.some(p => p.name.toLowerCase() === searchUsername.toLowerCase().trim())) {
      setSearchError("El usuario ya está en la lista");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    
    try {
      const user = await searchUserByUsernameAction(searchUsername);
      if (user) {
        // Add user and clean up empty slots if they exist at the end
        setParticipants((prev) => {
          const filtered = prev.filter(p => p.name.trim() !== "");
          return [...filtered, { name: user.name, userId: user.id }];
        });
        setSearchUsername("");
      } else {
        setSearchError("Usuario no encontrado");
      }
    } catch (e: any) {
      setSearchError("Error al buscar");
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = (data: TripFormData) => {
    if (validParticipantsCount < 2) return;
    
    startTransition(async () => {
      await createTripAction({
        ...data,
        coverEmoji: selectedEmoji,
        participants: participants.filter((p) => p.name.trim()),
      });
    });
  };

  const steps = [
    { label: "Info del viaje", icon: <Plane size={16} /> },
    { label: "Participantes", icon: <Users size={16} /> },
    { label: "Configuración", icon: <Settings size={16} /> },
  ];

  return (
    <>
      <Navbar />
      <main className="page-container" style={{ paddingTop: "2.5rem", paddingBottom: "4rem", maxWidth: 600 }}>
        {/* Back */}
        <Link
          href="/trips"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-muted)",
            textDecoration: "none",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
          }}
        >
          <ArrowLeft size={16} />
          Volver a viajes
        </Link>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}
        >
          ✈️ Nuevo Viaje
        </motion.h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          Configura tu viaje en 3 pasos
        </p>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
          {steps.map((s, i) => (
            <div
              key={i}
              onClick={() => i < step + 1 && setStep(i as 0 | 1 | 2)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                cursor: i <= step ? "pointer" : "default",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 4,
                  borderRadius: 2,
                  background: i <= step ? "var(--accent-violet)" : "var(--bg-elevated)",
                  transition: "background 0.3s",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "0.7rem",
                  color: i <= step ? "var(--accent-violet)" : "var(--text-muted)",
                  fontWeight: i === step ? 700 : 400,
                }}
              >
                {i < step ? <Check size={12} /> : s.icon}
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* ── Step 0: Trip info ── */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="glass-card"
                style={{ padding: "1.75rem" }}
              >
                {/* Emoji picker */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={labelStyle}>Ícono del viaje</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    {TRIP_EMOJIS.map((emoji) => (
                      <button
                         key={emoji}
                        type="button"
                        onClick={() => setSelectedEmoji(emoji)}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "var(--radius-md)",
                          fontSize: "1.2rem",
                          border: selectedEmoji === emoji
                            ? "2px solid var(--accent-violet)"
                            : "2px solid transparent",
                          background: selectedEmoji === emoji
                            ? "rgba(124, 58, 237, 0.15)"
                            : "var(--bg-elevated)",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="Nombre del viaje" error={errors.name?.message}>
                  <input
                    {...register("name")}
                    className="input-field"
                    placeholder="Ej: Fin de semana en Samaipata"
                  />
                </Field>

                <Field label="Destino" error={errors.destination?.message}>
                  <input
                    {...register("destination")}
                    className="input-field"
                    placeholder="Ej: Samaipata, Bolivia"
                  />
                </Field>

                <Field label="Descripción (opcional)" error={errors.description?.message}>
                  <textarea
                    {...register("description")}
                    className="input-field"
                    placeholder="Una nota sobre el viaje..."
                    rows={2}
                    style={{ resize: "vertical" }}
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <Field label="Fecha inicio" error={errors.startDate?.message}>
                    <input {...register("startDate")} type="date" className="input-field" />
                  </Field>
                  <Field label="Fecha fin" error={errors.endDate?.message}>
                    <input {...register("endDate")} type="date" className="input-field" />
                  </Field>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-primary"
                  style={{ width: "100%", padding: "0.875rem", marginTop: "0.5rem", fontSize: "0.9375rem" }}
                >
                  Siguiente → Participantes
                </button>
              </motion.div>
            )}

            {/* ── Step 1: Participants ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="glass-card"
                style={{ padding: "1.75rem" }}
              >
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
                  Agrega a todas las personas del viaje (mínimo 2). Puedes invitar usuarios o agregarlos manualmente.
                </p>

                {/* Buscar usuario por Username */}
                <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)" }}>
                  <label style={labelStyle}>Buscar e invitar usuario</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="@usuario"
                      value={searchUsername}
                      onChange={(e) => setSearchUsername(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearchUser();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSearchUser}
                      disabled={isSearching}
                      className="btn-primary"
                      style={{ padding: "0 1rem", borderRadius: "var(--radius-md)" }}
                    >
                      {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    </button>
                  </div>
                  {searchError && (
                    <p style={{ color: "var(--accent-rose)", fontSize: "0.75rem", marginTop: 4 }}>
                      {searchError}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={labelStyle}>Participantes</label>
                  <AnimatePresence>
                    {participants.map((p, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: pickColor(i),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "white",
                            flexShrink: 0,
                          }}
                        >
                          {p.name ? p.name.slice(0, 2).toUpperCase() : (i + 1)}
                        </div>
                        <div style={{ flex: 1, position: "relative" }}>
                          <input
                            className="input-field"
                            placeholder={`Participante ${i + 1}`}
                            value={p.name}
                            onChange={(e) => updateParticipantName(i, e.target.value)}
                            disabled={!!p.userId && i !== 0} // Si fue encontrado por búsqueda o es el usuario actual, igual dejamos que pueda editar su alias local, pero dejémoslo libre si quieren.
                          />
                          {p.userId && i !== 0 && (
                            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: "0.7rem", color: "var(--accent-violet)", background: "rgba(124,58,237,0.1)", padding: "2px 6px", borderRadius: 4 }}>
                              Invitado
                            </span>
                          )}
                        </div>
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => removeParticipant(i)}
                            style={{
                              padding: 8,
                              borderRadius: "var(--radius-md)",
                              background: "rgba(244, 63, 94, 0.1)",
                              border: "none",
                              color: "var(--accent-rose)",
                              cursor: "pointer",
                              flexShrink: 0,
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={addParticipant}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px dashed var(--border-default)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: "0.875rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  <Plus size={16} />
                  Agregar manualmente
                </button>

                {validParticipantsCount < 2 && (
                  <p style={{ color: "var(--accent-rose)", fontSize: "0.8125rem", textAlign: "center", marginBottom: "1rem" }}>
                    Debes agregar al menos 2 participantes para continuar.
                  </p>
                )}

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    style={{
                      flex: 1,
                      padding: "0.875rem",
                      borderRadius: "var(--radius-full)",
                      border: "1px solid var(--border-default)",
                      background: "transparent",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      fontSize: "0.9375rem",
                    }}
                  >
                    ← Atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={validParticipantsCount < 2}
                    className="btn-primary"
                    style={{ flex: 2, padding: "0.875rem", fontSize: "0.9375rem", opacity: validParticipantsCount < 2 ? 0.5 : 1 }}
                  >
                    Siguiente → Configuración
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Currency & create ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="glass-card"
                style={{ padding: "1.75rem" }}
              >
                <Field label="Moneda del viaje" error={errors.currency?.message}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    {CURRENCIES.map((c) => {
                      const isSelected = watchedCurrency === c.code;
                      return (
                        <label
                          key={c.code}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "0.875rem",
                            borderRadius: "var(--radius-md)",
                            border: `1px solid ${isSelected ? "var(--accent-violet)" : "var(--border-default)"}`,
                            background: isSelected ? "rgba(124,58,237,0.1)" : "var(--bg-elevated)",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          <input
                            {...register("currency")}
                            type="radio"
                            value={c.code}
                            style={{ display: "none" }}
                          />
                          <span style={{ fontSize: "1.2rem" }}>{c.symbol}</span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{c.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{c.code}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </Field>

                {watchedCurrency === "OTHER" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.75rem" }}
                  >
                    <Field label="Símbolo" error={errors.customCurrencySymbol?.message}>
                      <input
                        {...register("customCurrencySymbol")}
                        className="input-field"
                        placeholder="Ej: R$"
                        maxLength={5}
                      />
                    </Field>
                    <Field label="Nombre" error={errors.customCurrencyName?.message}>
                      <input
                        {...register("customCurrencyName")}
                        className="input-field"
                        placeholder="Ej: Real Brasileño"
                      />
                    </Field>
                  </motion.div>
                )}

                {/* Summary */}
                <div
                  style={{
                    background: "var(--bg-elevated)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem",
                    marginBottom: "1.25rem",
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
                    📋 Resumen
                  </div>
                  <div>Participantes válidos: {validParticipantsCount}</div>
                  <div>Viajeros vinculados: {participants.filter((p) => p.userId).length}</div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      flex: 1,
                      padding: "0.875rem",
                      borderRadius: "var(--radius-full)",
                      border: "1px solid var(--border-default)",
                      background: "transparent",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      fontSize: "0.9375rem",
                    }}
                  >
                    ← Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || validParticipantsCount < 2}
                    className="btn-primary"
                    style={{ flex: 2, padding: "0.875rem", fontSize: "0.9375rem" }}
                  >
                    {isPending ? "Creando..." : "🚀 Crear Viaje"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </main>
    </>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginBottom: 6,
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1.125rem" }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && (
        <p style={{ color: "var(--accent-rose)", fontSize: "0.75rem", marginTop: 4 }}>
          {error}
        </p>
      )}
    </div>
  );
}
