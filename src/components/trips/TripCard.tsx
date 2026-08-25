"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users, Receipt, TrendingUp, Calendar } from "lucide-react";
import type { Trip } from "@/types";
import { formatDate } from "@/lib/utils";
import { formatAmount, getTripTotalCents } from "@/lib/calculations";

interface TripCardProps {
  trip: Trip;
  index: number;
}

export default function TripCard({ trip, index }: TripCardProps) {
  const total = getTripTotalCents(trip);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
    >
      <Link
        href={`/trips/${trip.id}`}
        style={{ textDecoration: "none", display: "block" }}
      >
        <div
          className="glass-card glass-card-hover"
          style={{ padding: "1.5rem", cursor: "pointer" }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "var(--radius-md)",
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  flexShrink: 0,
                }}
              >
                {trip.coverEmoji}
              </div>
              <div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: "var(--text-primary)",
                    marginBottom: 2,
                  }}
                >
                  {trip.name}
                </h3>
                <div
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  📍 {trip.destination}
                </div>
              </div>
            </div>
            <ArrowRight
              size={18}
              style={{ color: "var(--text-muted)", flexShrink: 0 }}
            />
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.75rem",
            }}
          >
            <Stat
              icon={<Users size={14} />}
              label="Participantes"
              value={String(trip.participants.length)}
            />
            <Stat
              icon={<Receipt size={14} />}
              label="Gastos"
              value={String(trip.expenses.length)}
            />
            <Stat
              icon={<TrendingUp size={14} />}
              label="Total"
              value={formatAmount(total, trip)}
            />
          </div>

          {/* Dates */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
              fontSize: "0.8rem",
            }}
          >
            <Calendar size={12} />
            {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
          </div>

          {/* Participant avatars */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "0.875rem",
              gap: 4,
            }}
          >
            {trip.participants.slice(0, 5).map((p, i) => (
              <div
                key={p.id}
                title={p.name}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: p.color,
                  border: "2px solid var(--bg-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  color: "white",
                  marginLeft: i > 0 ? -8 : 0,
                  zIndex: trip.participants.length - i,
                  position: "relative",
                }}
              >
                {p.name.slice(0, 2).toUpperCase()}
              </div>
            ))}
            {trip.participants.length > 5 && (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--bg-elevated)",
                  border: "2px solid var(--bg-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  marginLeft: -8,
                }}
              >
                +{trip.participants.length - 5}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        borderRadius: "var(--radius-md)",
        padding: "0.625rem 0.75rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          color: "var(--text-muted)",
          fontSize: "0.7rem",
          marginBottom: 4,
        }}
      >
        {icon}
        {label}
      </div>
      <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{value}</div>
    </div>
  );
}
