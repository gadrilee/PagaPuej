"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { signUpAction } from "@/server/actions/auth";
import { Mail, Lock, User, UserPlus, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);

    // Basic password confirmation check
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    const result = await signUpAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: 440 }}
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
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.25rem" }}>Crea tu cuenta</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
            Gratis para siempre. Sin tarjeta de crédito.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ padding: "0.875rem 1rem", borderRadius: "var(--radius-md)", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", color: "#f87171", fontSize: "0.875rem", marginBottom: "1rem" }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Field label="Nombre completo">
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input name="name" type="text" required autoComplete="name" className="input-field" placeholder="Ana García" style={{ paddingLeft: "2.5rem" }} />
              </div>
            </Field>

            <Field label="Nombre de usuario (único)">
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input name="username" type="text" required autoComplete="username" className="input-field" placeholder="ana_garcia123" style={{ paddingLeft: "2.5rem" }} pattern="^[a-zA-Z0-9_]+$" title="Solo letras, números y guiones bajos" />
              </div>
            </Field>

            <Field label="Correo electrónico">
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input name="email" type="email" required autoComplete="email" className="input-field" placeholder="tu@email.com" style={{ paddingLeft: "2.5rem" }} />
              </div>
            </Field>

            <Field label="Contraseña">
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input name="password" type={showPassword ? "text" : "password"} required className="input-field" placeholder="Mínimo 6 caracteres" style={{ paddingLeft: "2.5rem", paddingRight: "3rem" }} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <Field label="Confirmar contraseña">
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input name="confirm" type={showPassword ? "text" : "password"} required className="input-field" placeholder="Repite la contraseña" style={{ paddingLeft: "2.5rem" }} />
              </div>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: "0.9rem", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: "0.9375rem", marginTop: "0.5rem" }}
            >
              <UserPlus size={18} />
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
            Al registrarte aceptas nuestros Términos de servicio y Política de privacidad.
          </p>

          <div style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" style={{ color: "var(--accent-violet)", textDecoration: "none", fontWeight: 600 }}>
              Iniciar sesión
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
