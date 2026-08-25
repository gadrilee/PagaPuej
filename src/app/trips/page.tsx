"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTripStore } from "@/store/useTripStore";
import TripCard from "@/components/trips/TripCard";
import Navbar from "@/components/layout/Navbar";
import { Plus, Map } from "lucide-react";

export default function TripsPage() {
  const { trips } = useTripStore();

  return (
    <>
      <Navbar />
      <main className="page-container" style={{ paddingTop: "2.5rem", paddingBottom: "3rem" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "2rem",
          }}
        >
          <div>
            <div
              style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}
            >
              <Map size={22} style={{ color: "var(--accent-violet)" }} />
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Mis Viajes</h1>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              {trips.length === 0
                ? "Todavía no tienes viajes"
                : `${trips.length} viaje${trips.length !== 1 ? "s" : ""} registrado${trips.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Link
            href="/trips/new"
            className="btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "0.75rem 1.25rem",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            <Plus size={16} />
            Nuevo viaje
          </Link>
        </motion.div>

        {trips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{ padding: "5rem 2rem", textAlign: "center" }}
          >
            <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🗺️</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              ¡Tu primera aventura te espera!
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", maxWidth: 400, margin: "0 auto 1.5rem" }}>
              Crea un viaje, agrega a tus amigos y registra los gastos. Al final,
              PagaPuej te dice exactamente cómo saldar las cuentas.
            </p>
            <Link
              href="/trips/new"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "0.875rem 2rem",
                textDecoration: "none",
                fontSize: "0.9375rem",
              }}
            >
              <Plus size={18} />
              Crear mi primer viaje
            </Link>
          </motion.div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1rem",
            }}
          >
            {trips.map((trip, i) => (
              <TripCard key={trip.id} trip={trip} index={i} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
