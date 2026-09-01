"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinTripAction } from "@/server/actions/trips";
import { Loader2, QrCode, LogIn } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
  code?: string;
  isLoggedIn: boolean;
}

export default function JoinPageClient({ code: initialCode, isLoggedIn }: Props) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode?.toUpperCase() ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Auto-join if logged in and code provided
  useEffect(() => {
    if (isLoggedIn && initialCode && initialCode.length === 6) {
      startTransition(async () => {
        try {
          await joinTripAction(initialCode.toUpperCase());
        } catch (e: any) {
          setError(e.message);
        }
      });
    }
  }, [isLoggedIn, initialCode]);

  const handleJoin = () => {
    if (!code.trim()) return;
    setError("");
    startTransition(async () => {
      try {
        await joinTripAction(code.trim());
      } catch (e: any) {
        setError(e.message);
      }
    });
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "var(--bg-base)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{ width: "100%", maxWidth: 420, padding: "2.5rem", textAlign: "center" }}
      >
        <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "2rem" }}>
          🗺️
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Unirse a un plan</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9rem" }}>
          {isPending && isLoggedIn && initialCode
            ? "Uniéndote al plan..."
            : "Ingresa el código de invitación para unirte al plan de tus amigos."}
        </p>

        {isPending ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
            <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent-violet)" }} />
          </div>
        ) : (
          <>
            {!isLoggedIn ? (
              <div style={{ padding: "1rem", borderRadius: "var(--radius-md)", background: "rgba(22,131,75,0.08)", border: "1px solid rgba(22,131,75,0.2)", marginBottom: "1.5rem" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--accent-emerald)", marginBottom: "0.75rem" }}>
                  Necesitas una cuenta para unirte. El código se guardará.
                </p>
                <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}>
                  <Link
                    href={`/auth/login?redirect=/join${code ? `?code=${code}` : ""}`}
                    className="btn-primary"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0.75rem", textDecoration: "none", fontSize: "0.9rem" }}
                  >
                    <LogIn size={16} />
                    Iniciar sesión
                  </Link>
                  <Link
                    href={`/auth/register?redirect=/join${code ? `?code=${code}` : ""}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0.75rem", borderRadius: "var(--radius-full)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem" }}
                  >
                    Crear cuenta gratis
                  </Link>
                </div>
              </div>
            ) : null}

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                className="input-field"
                style={{ textAlign: "center", letterSpacing: "0.15em", fontWeight: 700, fontSize: "1.1rem", textTransform: "uppercase" }}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="XXXXXX"
                maxLength={6}
                disabled={!isLoggedIn || isPending}
              />
              {isLoggedIn && (
                <button
                  onClick={handleJoin}
                  disabled={code.length < 6 || isPending}
                  className="btn-primary"
                  style={{ padding: "0.75rem 1.25rem", flexShrink: 0, display: "flex", alignItems: "center", gap: 6, fontSize: "0.9rem", whiteSpace: "nowrap" }}
                >
                  Unirme
                </button>
              )}
            </div>

            {error && (
              <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "var(--radius-md)", background: "rgba(214,69,69,0.1)", border: "1px solid rgba(214,69,69,0.3)", color: "var(--accent-rose)", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}
          </>
        )}
      </motion.div>
    </main>
  );
}
