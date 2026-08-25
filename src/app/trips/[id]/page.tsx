"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTripStore } from "@/store/useTripStore";
import { calculateBalances, formatAmount, getTripTotalCents } from "@/lib/calculations";
import Navbar from "@/components/layout/Navbar";
import {
  ArrowLeft, Receipt, BarChart3, ArrowRightLeft, Plus,
  Users, Trash2, Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default function TripDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { getTrip, deleteTrip, addParticipant, removeParticipant } = useTripStore();
  const trip = getTrip(id);

  if (!trip) {
    return (
      <>
        <Navbar />
        <main className="page-container" style={{ paddingTop: "4rem", textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
            Viaje no encontrado
          </h1>
          <Link href="/trips" style={{ color: "var(--accent-violet)" }}>
            Volver a viajes
          </Link>
        </main>
      </>
    );
  }

  const balances = calculateBalances(trip);
  const total = getTripTotalCents(trip);

  const tabs = [
    { href: `/trips/${id}/gastos`, label: "Gastos", icon: <Receipt size={16} />, count: trip.expenses.length },
    { href: `/trips/${id}/saldos`, label: "Saldos", icon: <BarChart3 size={16} />, count: trip.participants.length },
    { href: `/trips/${id}/liquidar`, label: "Liquidar", icon: <ArrowRightLeft size={16} /> },
  ];

  const handleDeleteTrip = () => {
    if (confirm(`¿Eliminar "${trip.name}"? Esta acción no se puede deshacer.`)) {
      deleteTrip(id);
      router.push("/trips");
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
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
            marginBottom: "1.25rem",
          }}
        >
          <ArrowLeft size={16} />
          Todos los viajes
        </Link>

        {/* Trip header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: "1.75rem", marginBottom: "1.5rem" }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "var(--radius-lg)",
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                }}
              >
                {trip.coverEmoji}
              </div>
              <div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>
                  {trip.name}
                </h1>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  📍 {trip.destination}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "var(--text-muted)",
                    fontSize: "0.8rem",
                    marginTop: 4,
                  }}
                >
                  <Calendar size={12} />
                  {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Chip label="Total gastado" value={formatAmount(total, trip)} color="#8b5cf6" />
              <Chip label="Participantes" value={String(trip.participants.length)} color="#06b6d4" />
              <Chip label="Gastos" value={String(trip.expenses.length)} color="#ec4899" />
            </div>
          </div>

          {/* Participants */}
          <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 600 }}>
                <Users size={14} />
                Participantes
              </div>
              <AddParticipantInline tripId={id} onAdd={(name) => addParticipant(id, name)} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {trip.participants.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px 4px 4px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "0.8125rem",
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: p.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  {p.name}
                  {trip.participants.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar a ${p.name}?`)) removeParticipant(id, p.id);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        padding: 0,
                        display: "flex",
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Action tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "2rem" }}
        >
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="glass-card glass-card-hover"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "1.25rem",
                textDecoration: "none",
                color: "var(--text-primary)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius-md)",
                  background: "rgba(124,58,237,0.15)",
                  color: "var(--accent-violet)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {tab.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{tab.label}</div>
                {tab.count !== undefined && (
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {tab.count} registros
                  </div>
                )}
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Quick access to add expense */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ display: "flex", gap: "0.75rem" }}
        >
          <Link
            href={`/trips/${id}/gastos`}
            className="btn-primary"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "0.875rem",
              textDecoration: "none",
              fontSize: "0.9375rem",
            }}
          >
            <Plus size={18} />
            Agregar Gasto
          </Link>
          <button
            onClick={handleDeleteTrip}
            style={{
              padding: "0.875rem 1.25rem",
              borderRadius: "var(--radius-full)",
              border: "1px solid rgba(244,63,94,0.3)",
              background: "rgba(244,63,94,0.08)",
              color: "var(--accent-rose)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.875rem",
            }}
          >
            <Trash2 size={16} />
            Eliminar viaje
          </button>
        </motion.div>
      </main>
    </>
  );
}

function Chip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        padding: "0.625rem 1rem",
        borderRadius: "var(--radius-md)",
        background: `${color}18`,
        border: `1px solid ${color}30`,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: "1rem", fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function AddParticipantInline({ tripId, onAdd }: { tripId: string; onAdd: (name: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(name.trim());
      setName("");
      setAdding(false);
    }
  };

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          background: "none",
          border: "none",
          color: "var(--accent-violet)",
          cursor: "pointer",
          fontSize: "0.8125rem",
          fontWeight: 600,
        }}
      >
        <Plus size={14} />
        Agregar
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <input
        autoFocus
        className="input-field"
        style={{ padding: "4px 8px", fontSize: "0.8125rem", width: 140 }}
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
          if (e.key === "Escape") setAdding(false);
        }}
      />
      <button onClick={handleAdd} className="btn-primary" style={{ padding: "4px 12px", fontSize: "0.8rem" }}>
        +
      </button>
    </div>
  );
}

