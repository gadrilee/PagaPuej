import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, Zap, Users, Receipt, ArrowRightLeft, ShieldCheck } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid var(--border-subtle)",
        background: "rgba(10,11,15,0.85)",
        backdropFilter: "blur(20px)",
      }}>
        <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "white", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}>P</div>
            <div>
              <div className="gradient-text" style={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1 }}>PagaPuej</div>
              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>Cuentas Claras</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {user ? (
              <Link href="/trips" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", textDecoration: "none", fontSize: "0.875rem" }}>
                Mis planes <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link href="/auth/login" style={{ padding: "8px 16px", borderRadius: "var(--radius-full)", border: "1px solid var(--border-default)", textDecoration: "none", color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500 }}>
                  Iniciar sesión
                </Link>
                <Link href="/auth/register" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", textDecoration: "none", fontSize: "0.875rem" }}>
                  Registrarse gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="page-container" style={{ paddingTop: "5rem", paddingBottom: "4rem", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: "var(--radius-full)", padding: "6px 16px", marginBottom: "2rem", fontSize: "0.8125rem", color: "var(--accent-violet)", fontWeight: 600 }}>
          <Zap size={13} /> Cuentas Claras, Amistades Duraderas
        </div>

        <h1 style={{ fontSize: "clamp(2.25rem, 6vw, 4rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "1.25rem" }}>
          Divide gastos de plan<br />
          <span className="gradient-text">sin dramas, sin errores</span>
        </h1>

        <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)", maxWidth: 560, margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
          Registra quién pagó qué, divide entre los que corresponde, y descubre exactamente cómo quedar a mano con tus amigos.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/auth/register" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "1rem 2rem", textDecoration: "none", fontSize: "1rem" }}>
            Empezar gratis <ArrowRight size={18} />
          </Link>
          <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "1rem 2rem", borderRadius: "var(--radius-full)", border: "1px solid var(--border-default)", textDecoration: "none", fontSize: "1rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            Tengo cuenta
          </Link>
        </div>
      </section>

      {/* ── Example ── */}
      <section className="page-container" style={{ paddingBottom: "4rem" }}>
        <div className="glass-card" style={{ padding: "2rem", maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, color: "var(--text-secondary)", marginBottom: "1.25rem", textAlign: "center", letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.75rem" }}>
            🏔️ Ejemplo — Fin de semana en Samaipata
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {[
              { from: "Diego", to: "Ana", amount: "Bs. 400.00", color: "#f59e0b" },
              { from: "Carla", to: "Ana", amount: "Bs. 160.00", color: "#14b8a6" },
            ].map((t) => (
              <div key={t.from} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1rem", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: "white" }}>{t.from.slice(0,2).toUpperCase()}</div>
                  <span style={{ fontWeight: 600 }}>{t.from}</span>
                  <ArrowRight size={14} style={{ color: "var(--text-muted)" }} />
                  <span style={{ fontWeight: 600 }}>Ana</span>
                </div>
                <span style={{ fontWeight: 800, color: "var(--accent-violet)" }}>{t.amount}</span>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "1rem" }}>
            ✓ Suma de balances = 0 · Sin errores de redondeo
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="page-container" style={{ paddingBottom: "5rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, textAlign: "center", marginBottom: "2rem" }}>
          Todo lo que necesitas
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          {[
            { icon: <Users size={22} />, title: "Participantes flexibles", desc: "Agrega o excluye personas en cada gasto. Divide solo entre quienes corresponda.", color: "#8b5cf6" },
            { icon: <Receipt size={22} />, title: "CRUD de gastos completo", desc: "Crea, edita y elimina gastos con categoría, fecha y quién pagó.", color: "#06b6d4" },
            { icon: <ArrowRightLeft size={22} />, title: "Liquidación óptima", desc: "Algoritmo greedy que minimiza la cantidad de transferencias necesarias.", color: "#10b981" },
            { icon: <ShieldCheck size={22} />, title: "Sin bugs de redondeo", desc: "Todos los montos se guardan en centavos. sum(balances) = 0 garantizado.", color: "#f59e0b" },
          ].map((f) => (
            <div key={f.title} className="glass-card glass-card-hover" style={{ padding: "1.5rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: `${f.color}18`, color: f.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>{f.icon}</div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>{f.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ paddingBottom: "5rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "1rem" }}>
          ¿Listo para tu próximo plan?
        </h2>
        <Link href="/auth/register" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "1rem 2.5rem", textDecoration: "none", fontSize: "1rem" }}>
          Crear cuenta gratis <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
        PagaPuej © 2025 · Cuentas Claras, Amistades Duraderas
      </footer>
    </main>
  );
}
