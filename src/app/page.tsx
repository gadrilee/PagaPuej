"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTripStore } from "@/store/useTripStore";
import { calculateBalances, calculateSettlement, formatAmount, getTripTotalCents } from "@/lib/calculations";
import { Plus, ArrowRight, TrendingUp, Users, Wallet, Zap } from "lucide-react";
import TripCard from "@/components/trips/TripCard";
import Navbar from "@/components/layout/Navbar";

export default function HomePage() {
  const { trips } = useTripStore();

  const totalTrips = trips.length;
  const totalExpenses = trips.reduce((sum, t) => sum + t.expenses.length, 0);
  const totalSpent = trips.reduce((sum, t) => {
    const cents = getTripTotalCents(t);
    // Only show BOB for simplicity on dashboard
    return sum + (t.currency === "BOB" ? cents : 0);
  }, 0);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh" }}>
        {/* Hero Section */}
        <section
          className="page-container"
          style={{ paddingTop: "4rem", paddingBottom: "3rem" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ maxWidth: 640, marginBottom: "3rem" }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(124, 58, 237, 0.12)",
                border: "1px solid rgba(124, 58, 237, 0.25)",
                borderRadius: "var(--radius-full)",
                padding: "6px 14px",
                marginBottom: "1.5rem",
                fontSize: "0.8125rem",
                color: "var(--accent-violet)",
                fontWeight: 600,
              }}
            >
              <Zap size={14} />
              Cuentas Claras, Amistades Duraderas
            </div>

            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: "1rem",
              }}
            >
              Divide gastos{" "}
              <span className="gradient-text">sin dramas</span>
              <br />
              entre amigos
            </h1>

            <p
              style={{
                fontSize: "1.125rem",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                marginBottom: "2rem",
              }}
            >
              Registra quién pagó qué en tu viaje y descubre exactamente cómo
              quedar a mano. Matemáticas perfectas, sin redondeos raros.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link
                href="/trips/new"
                className="btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0.875rem 1.75rem",
                  textDecoration: "none",
                  fontSize: "0.9375rem",
                }}
              >
                <Plus size={18} />
                Nuevo viaje
              </Link>
              <Link
                href="/trips"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0.875rem 1.75rem",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border-default)",
                  textDecoration: "none",
                  fontSize: "0.9375rem",
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >
                Ver mis viajes
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1rem",
              marginBottom: "3rem",
            }}
          >
            {[
              { icon: <TrendingUp size={20} />, label: "Viajes", value: totalTrips, color: "#8b5cf6" },
              { icon: <Wallet size={20} />, label: "Gastos totales", value: totalExpenses, color: "#06b6d4" },
              { icon: <Users size={20} />, label: "Total participantes", value: trips.reduce((s, t) => s + t.participants.length, 0), color: "#ec4899" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="glass-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                style={{ padding: "1.25rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-md)",
                      background: `${stat.color}22`,
                      color: stat.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {stat.icon}
                  </div>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent trips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
              }}
            >
              <h2
                style={{ fontSize: "1.25rem", fontWeight: 700 }}
              >
                {trips.length > 0 ? "Tus viajes" : "¡Empieza tu primer viaje!"}
              </h2>
              {trips.length > 3 && (
                <Link
                  href="/trips"
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--accent-violet)",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Ver todos <ArrowRight size={14} />
                </Link>
              )}
            </div>

            {trips.length === 0 ? (
              <EmptyState />
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "1rem",
                }}
              >
                {trips.slice(0, 6).map((trip, i) => (
                  <TripCard key={trip.id} trip={trip} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        </section>
      </main>
    </>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card"
      style={{
        padding: "4rem 2rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✈️</div>
      <h3
        style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
        }}
      >
        Ningún viaje aún
      </h3>
      <p
        style={{
          color: "var(--text-secondary)",
          marginBottom: "1.5rem",
        }}
      >
        Crea tu primer viaje y comienza a dividir gastos con tus amigos
      </p>
      <Link
        href="/trips/new"
        className="btn-primary"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "0.75rem 1.5rem",
          textDecoration: "none",
          fontSize: "0.9375rem",
        }}
      >
        <Plus size={18} />
        Crear viaje
      </Link>
    </motion.div>
  );
}
