import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div className="glass-card" style={{ padding: "3rem 2rem", maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📬</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>Revisa tu correo</h1>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          Te enviamos un correo de confirmación. Haz clic en el enlace para activar tu cuenta y empezar a usar PagaPuej.
        </p>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "1.75rem" }}>
          Si no ves el correo, revisa tu carpeta de spam.
        </p>
        <Link
          href="/auth/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "0.75rem 1.5rem",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border-default)",
            textDecoration: "none",
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
          }}
        >
          Volver al login
        </Link>
      </div>
    </div>
  );
}
