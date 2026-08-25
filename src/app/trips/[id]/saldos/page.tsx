"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { useTripData } from "@/hooks/useTripData";
import { calculateBalances, assertZeroSum, formatAmount, fromCents } from "@/lib/calculations";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getCurrency } from "@/lib/calculations";

export default function SaldosPage() {
  const { trip, userMeta } = useTripData();

  if (!trip) {
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

  const balances = calculateBalances(trip);
  assertZeroSum(balances);
  const currency = getCurrency(trip);

  const sorted = [...balances].sort((a, b) => b.balanceCents - a.balanceCents);

  const chartData = sorted.map((b) => ({
    name: b.participantName,
    amount: parseFloat(fromCents(b.balanceCents).toFixed(2)),
    color: b.color,
  }));

  return (
    <>
      <Navbar userEmail={userMeta.email} userName={userMeta.name} />
      <main className="page-container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        <Link
          href={`/trips/${trip.id}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", textDecoration: "none", fontSize: "0.875rem", marginBottom: "1.25rem" }}
        >
          <ArrowLeft size={16} />
          {trip.name}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "1.75rem" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <BarChart3 size={20} style={{ color: "var(--accent-violet)" }} />
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Saldos</h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Balance de cada participante · Moneda: {currency.symbol} {currency.name}
          </p>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
          style={{ padding: "1.5rem", marginBottom: "1.5rem" }}
        >
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
            📊 Balance visual
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                  fontSize: 13,
                }}
                formatter={(value: number) => [`${currency.symbol} ${value.toFixed(2)}`, "Balance"]}
              />
              <ReferenceLine y={0} stroke="var(--border-default)" strokeWidth={1} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.amount >= 0 ? "#10b981" : "#f43f5e"}
                    opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Balance cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {sorted.map((balance, i) => {
            const isPositive = balance.balanceCents > 0;
            const isZero = balance.balanceCents === 0;
            const color = isZero ? "var(--text-muted)" : isPositive ? "#10b981" : "#f43f5e";
            const Icon = isZero ? Minus : isPositive ? TrendingUp : TrendingDown;

            return (
              <motion.div
                key={balance.participantId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass-card"
                style={{ padding: "1.125rem 1.25rem" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {/* Participant */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: balance.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        color: "white",
                        flexShrink: 0,
                      }}
                    >
                      {balance.participantName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 2 }}>{balance.participantName}</div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: color,
                          fontWeight: 500,
                        }}
                      >
                        {isZero
                          ? "Está a mano ✓"
                          : isPositive
                          ? `Le deben ${formatAmount(balance.balanceCents, trip)}`
                          : `Debe ${formatAmount(-balance.balanceCents, trip)}`}
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Icon size={18} style={{ color }} />
                    <div
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        color,
                      }}
                    >
                      {balance.balanceCents > 0 ? "+" : ""}
                      {formatAmount(balance.balanceCents, trip)}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {!isZero && (
                  <div
                    style={{
                      marginTop: "0.875rem",
                      height: 4,
                      borderRadius: 2,
                      background: "var(--bg-elevated)",
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, Math.abs(balance.balanceCents) / Math.max(...balances.map((b) => Math.abs(b.balanceCents))) * 100)}%`,
                      }}
                      transition={{ delay: i * 0.07 + 0.2, duration: 0.6, ease: "easeOut" }}
                      style={{
                        height: "100%",
                        borderRadius: 2,
                        background: color,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Zero-sum verification badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "0.625rem 1rem",
            borderRadius: "var(--radius-full)",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            color: "#10b981",
            fontSize: "0.8125rem",
            fontWeight: 600,
          }}
        >
          ✓ Suma de balances = 0 (sin bugs de redondeo)
        </motion.div>

        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <Link
            href={`/trips/${trip.id}/liquidar`}
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
            Ver cómo liquidar →
          </Link>
        </div>
      </main>
    </>
  );
}
