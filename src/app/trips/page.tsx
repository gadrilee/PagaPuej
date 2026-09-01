import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserTrips, adaptDbTripToFrontend } from "@/server/queries/trips";
import Navbar from "@/components/layout/Navbar";
import TripCard from "@/components/trips/TripCard";
import JoinTripForm from "./JoinTripForm";
import { Plus, Map } from "lucide-react";

export default async function TripsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const dbTrips = user ? await getUserTrips(user.id) : [];
  const trips = dbTrips.map(adaptDbTripToFrontend);

  return (
    <>
      <Navbar
        userEmail={user?.email}
        userName={user?.user_metadata?.full_name}
      />
      <main className="page-container" style={{ paddingTop: "2.5rem", paddingBottom: "3rem" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <Map size={22} style={{ color: "var(--accent-violet)" }} />
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Mis Planes</h1>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              {trips.length === 0
                ? "Todavía no tienes planes"
                : `${trips.length} plan${trips.length !== 1 ? "es" : ""} registrado${trips.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <JoinTripForm />
            <Link href="/trips/new" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.75rem 1.25rem", textDecoration: "none", fontSize: "0.875rem" }}>
              <Plus size={16} />
              Nuevo plan
            </Link>
          </div>
        </div>

        {trips.length === 0 ? (
          <div className="glass-card" style={{ padding: "5rem 2rem", textAlign: "center" }}>
            <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🗺️</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>¡Tu primera aventura te espera!</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", maxWidth: 400, margin: "0 auto 1.5rem" }}>
              Crea un plan, agrega a tus amigos y registra los gastos. Al final, PagaPuej te dice exactamente cómo saldar las cuentas.
            </p>
            <Link href="/trips/new" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.875rem 2rem", textDecoration: "none", fontSize: "0.9375rem" }}>
              <Plus size={18} />
              Crear mi primer plan
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
            {trips.map((trip, i) => (
              <TripCard key={trip.id} trip={trip} index={i} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
