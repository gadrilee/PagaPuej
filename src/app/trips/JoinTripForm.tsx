"use client";

import { useState, useTransition } from "react";
import { joinTripAction } from "@/server/actions/trips";
import { Loader2, ArrowRight } from "lucide-react";

export default function JoinTripForm() {
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!code.trim()) return;

    startTransition(async () => {
      try {
        await joinTripAction(code.trim());
        setCode("");
      } catch (err: any) {
        setError(err.message || "Error al unirse al plan");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder="Código de plan (ej. ABX92R)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="input-field"
          style={{ width: "200px" }}
          maxLength={6}
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending || !code.trim()}
          className="btn-primary"
          style={{ padding: "0.75rem 1rem", background: "var(--accent-violet)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        </button>
      </div>
      {error && <div style={{ color: "var(--accent-rose)", fontSize: "0.75rem", fontWeight: 600 }}>{error}</div>}
    </form>
  );
}
