"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { signInAction } from "@/server/actions/auth";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await signInAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {(error || urlError) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "0.875rem 1rem",
            borderRadius: "var(--radius-md)",
            background: "rgba(244,63,94,0.1)",
            border: "1px solid rgba(244,63,94,0.3)",
            color: "#f87171",
            fontSize: "0.875rem",
          }}
        >
          {error ?? (urlError === "auth_callback_failed" ? "Error de autenticación. Intenta de nuevo." : urlError)}
        </motion.div>
      )}

      <div>
        <label style={labelStyle}>Correo electrónico</label>
        <div style={{ position: "relative" }}>
          <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input-field"
            placeholder="tu@email.com"
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Contraseña</label>
        <div style={{ position: "relative" }}>
          <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="input-field"
            placeholder="••••••••"
            style={{ paddingLeft: "2.5rem", paddingRight: "3rem" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
        style={{ padding: "0.9rem", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: "0.9375rem", marginTop: "0.5rem" }}
      >
        <LogIn size={18} />
        {loading ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: 420 }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", fontWeight: 800, color: "white", boxShadow: "0 0 30px rgba(124,58,237,0.4)" }}>
              P
            </div>
            <div className="gradient-text" style={{ fontSize: "1.5rem", fontWeight: 800 }}>PagaPuej</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Cuentas Claras, Amistades Duraderas</div>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: "2rem" }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.25rem" }}>Bienvenido de vuelta</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
            Ingresa a tu cuenta para ver tus planes
          </p>

          <Suspense>
            <LoginForm />
          </Suspense>

          <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            ¿No tienes cuenta?{" "}
            <Link href="/auth/register" style={{ color: "var(--accent-violet)", textDecoration: "none", fontWeight: 600 }}>
              Regístrate gratis
            </Link>
          </div>
        </div>

        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.8125rem" }}>
            ← Volver al inicio
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginBottom: 6,
};
