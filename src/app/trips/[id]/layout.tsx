import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTripWithDetails, adaptDbTripToFrontend } from "@/server/queries/trips";
import { TripProvider } from "@/hooks/useTripData";

// ─── Layout ───────────────────────────────────────────────────────────────────
// Loads trip from DB and passes to children via layout context.
// Children use the TripContext to access the trip.

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const dbTrip = await getTripWithDetails(id, user.id);

  if (!dbTrip) notFound();

  const trip = adaptDbTripToFrontend(dbTrip);
  const userMeta = { email: user.email, name: user.user_metadata?.full_name };

  return (
    <TripProvider trip={trip} userMeta={userMeta}>
      {children}
    </TripProvider>
  );
}
