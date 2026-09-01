"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Copy, Check, QrCode, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

interface Props {
  inviteCode: string;
  baseUrl: string;
}

export default function InviteQR({ inviteCode, baseUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { theme } = useTheme();

  const joinUrl = `${baseUrl}/join?code=${inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrBg = theme === "light" ? "#FFFFFF" : "#111318";
  const qrFg = theme === "light" ? "#173B2A" : "#f0f2f8";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      {/* Code badge */}
      <button
        onClick={handleCopy}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 12px", borderRadius: "var(--radius-full)",
          border: "1px dashed var(--accent-violet)",
          background: "rgba(59,170,104,0.07)",
          color: "var(--accent-violet)",
          fontSize: "0.78rem", fontWeight: 700,
          cursor: "pointer", transition: "all 0.2s",
        }}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        Código: {inviteCode}
      </button>

      {/* QR button */}
      <button
        onClick={() => setShowQR(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "4px 10px", borderRadius: "var(--radius-full)",
          border: "1px solid var(--border-default)",
          background: "var(--bg-elevated)",
          color: "var(--text-secondary)",
          fontSize: "0.78rem", fontWeight: 600,
          cursor: "pointer", transition: "all 0.2s",
        }}
      >
        <QrCode size={12} />
        Ver QR
      </button>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowQR(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 200, padding: "1rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="glass-card"
              style={{ padding: "2rem", textAlign: "center", maxWidth: 300, width: "100%" }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }}>
                <button
                  onClick={() => setShowQR(false)}
                  style={{ padding: 6, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
                >
                  <X size={16} />
                </button>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                Escanea para unirte
              </p>
              <div style={{ display: "flex", justifyContent: "center", padding: "1rem", background: qrBg, borderRadius: "var(--radius-md)" }}>
                <QRCodeSVG
                  value={joinUrl}
                  size={200}
                  bgColor={qrBg}
                  fgColor={qrFg}
                  level="M"
                />
              </div>
              <div style={{ marginTop: "1rem", padding: "0.5rem 1rem", borderRadius: "var(--radius-full)", background: "var(--bg-elevated)", border: "1px dashed var(--accent-violet)", display: "inline-block" }}>
                <span style={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "0.2em", color: "var(--accent-violet)" }}>{inviteCode}</span>
              </div>
              <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                O ingresa el código en PagaPuej
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
