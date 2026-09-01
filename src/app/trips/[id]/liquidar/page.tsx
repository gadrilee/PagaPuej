"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTripData } from "@/hooks/useTripData";
import { calculateBalances, calculateSettlement, assertZeroSum, formatAmount } from "@/lib/calculations";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft, ArrowRightLeft, Check, Copy, FileDown, Loader2 } from "lucide-react";
import { getCurrency } from "@/lib/calculations";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { recordPaymentAction } from "@/server/actions/trips";

export default function LiquidarPage() {
  const { trip, userMeta } = useTripData();
  const [isPending, startTransition] = useTransition();

  if (!trip) {
    return (
      <>
        <Navbar />
        <main className="page-container" style={{ paddingTop: "4rem", textAlign: "center" }}>
          <h1>Plan no encontrado</h1>
          <Link href="/trips">Volver</Link>
        </main>
      </>
    );
  }

  const balances = calculateBalances(trip);
  assertZeroSum(balances);
  const transfers = calculateSettlement(balances);
  const currency = getCurrency(trip);

  const handleRecordPayment = (fromId: string, toId: string, fromName: string, toName: string, amountCents: number) => {
    if (window.confirm(`¿Registrar el pago de ${currency.symbol} ${(amountCents / 100).toFixed(2)} de ${fromName} a ${toName}?`)) {
      startTransition(async () => {
        try {
          await recordPaymentAction(trip.id, fromId, toId, amountCents);
        } catch (err) {
          console.error(err);
          alert("Error al registrar el pago");
        }
      });
    }
  };

  const summaryText = transfers
    .map((t) => `${t.fromName} → ${t.toName}: ${currency.symbol} ${(t.amountCents / 100).toFixed(2)}`)
    .join("\n");

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
    }
    document.body.removeChild(textArea);
  };

  const copyToClipboard = () => {
    const text = `📋 Liquidación de "${trip.name}"\n\n${summaryText}\n\n— PagaPuej`;
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Async: Could not copy text: ", err);
      fallbackCopyTextToClipboard(text);
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Liquidación: ${trip.name}`, 14, 20);
    
    const tableData = transfers.map(t => [
      t.fromName,
      t.toName,
      `${currency.symbol} ${(t.amountCents / 100).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Quién debe pagar", "A quién", "Monto"]],
      body: tableData,
    });

    doc.save(`Liquidacion_${trip.name}.pdf`);
  };

  const exportToExcel = () => {
    const data = transfers.map(t => ({
      "Quién debe pagar": t.fromName,
      "A quién": t.toName,
      "Monto": (t.amountCents / 100).toFixed(2),
      "Moneda": currency.symbol
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Liquidación");
    XLSX.writeFile(workbook, `Liquidacion_${trip.name}.xlsx`);
  };

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

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <ArrowRightLeft size={20} style={{ color: "var(--accent-violet)" }} />
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Liquidación</h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            {transfers.length === 0
              ? "¡Nadie debe nada!"
              : `${transfers.length} transferencia${transfers.length !== 1 ? "s" : ""} para quedar a mano`}
          </p>
        </motion.div>

        {/* All settled! */}
        {transfers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{ padding: "4rem 2rem", textAlign: "center" }}
          >
            <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🎉</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              ¡Cuentas claras!
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Todos los participantes están a mano. Nadie debe nada.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Copy & Export buttons */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              <button
                onClick={copyToClipboard}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "0.625rem 1rem",
                  borderRadius: "var(--radius-full)", border: "1px solid var(--border-default)",
                  background: "var(--bg-elevated)", color: "var(--text-secondary)",
                  cursor: "pointer", fontSize: "0.8125rem",
                }}
              >
                <Copy size={14} />
                Copiar resumen
              </button>
              <button
                onClick={exportToPDF}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "0.625rem 1rem",
                  borderRadius: "var(--radius-full)", border: "1px solid var(--border-default)",
                  background: "var(--bg-elevated)", color: "var(--text-secondary)",
                  cursor: "pointer", fontSize: "0.8125rem",
                }}
              >
                <FileDown size={14} />
                PDF
              </button>
              <button
                onClick={exportToExcel}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "0.625rem 1rem",
                  borderRadius: "var(--radius-full)", border: "1px solid var(--border-default)",
                  background: "var(--bg-elevated)", color: "var(--text-secondary)",
                  cursor: "pointer", fontSize: "0.8125rem",
                }}
              >
                <FileDown size={14} />
                Excel
              </button>
            </div>

            {/* Transfer cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {transfers.map((transfer, i) => {
                const key = String(i);
                const from = trip.participants.find((p) => p.id === transfer.fromId);
                const to = trip.participants.find((p) => p.id === transfer.toId);

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="glass-card"
                    style={{
                      padding: "1.25rem 1.5rem",
                      opacity: isPending ? 0.5 : 1,
                      transition: "opacity 0.3s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                      {/* Transfer arrow */}
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: 0 }}>
                        {/* FROM */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              background: from?.color ?? "#888",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.8rem",
                              fontWeight: 800,
                              color: "white",
                              flexShrink: 0,
                            }}
                          >
                            {transfer.fromName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Paga</div>
                            <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{transfer.fromName}</div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            color: "var(--accent-violet)",
                            flexShrink: 0,
                          }}
                        >
                          <div style={{ width: 30, height: 2, background: "var(--accent-violet)", opacity: 0.4 }} />
                          <ArrowRightLeft size={16} />
                          <div style={{ width: 30, height: 2, background: "var(--accent-violet)", opacity: 0.4 }} />
                        </div>

                        {/* TO */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              background: to?.color ?? "#888",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.8rem",
                              fontWeight: 800,
                              color: "white",
                              flexShrink: 0,
                            }}
                          >
                            {transfer.toName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Recibe</div>
                            <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{transfer.toName}</div>
                          </div>
                        </div>
                      </div>

                      {/* Amount + Mark paid */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", flexShrink: 0 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Monto</div>
                          <div
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: 800,
                              color: "var(--accent-violet)",
                            }}
                          >
                            {currency.symbol} {(transfer.amountCents / 100).toFixed(2)}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRecordPayment(transfer.fromId, transfer.toId, transfer.fromName, transfer.toName, transfer.amountCents)}
                          disabled={isPending}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            border: "2px solid var(--border-default)",
                            background: "var(--bg-elevated)",
                            color: "var(--text-muted)",
                            cursor: isPending ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s",
                            flexShrink: 0,
                          }}
                          title="Registrar pago en base de datos"
                        >
                          {isPending ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                borderRadius: "var(--radius-lg)",
                background: "rgba(124,58,237,0.06)",
                border: "1px solid rgba(124,58,237,0.15)",
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
              }}
            >
              💡 <strong style={{ color: "var(--text-secondary)" }}>Tip:</strong>{" "}
              Marca cada transferencia como pagada una vez que el dinero cambie de manos.
              El resumen puede copiarse para compartir con el grupo.
            </motion.div>
          </>
        )}
      </main>
    </>
  );
}
