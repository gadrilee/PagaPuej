import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTripWithDetails } from "@/server/queries/trips";
import { TripProvider } from "@/hooks/useTripData";
import type { Trip } from "@/types";
import type { TripWithDetails } from "@/server/queries/trips";

// ─── Adapt DB trip to frontend Trip type ─────────────────────────────────────
export function adaptDbTripToFrontend(dbTrip: TripWithDetails): Trip {
  return {
    id: dbTrip.id,
    name: dbTrip.name,
    destination: dbTrip.destination,
    description: dbTrip.description ?? undefined,
    startDate: dbTrip.startDate,
    endDate: dbTrip.endDate,
    currency: dbTrip.currency as Trip["currency"],
    customCurrencySymbol: dbTrip.customCurrencySymbol ?? undefined,
    customCurrencyName: dbTrip.customCurrencyName ?? undefined,
    coverEmoji: dbTrip.coverEmoji,
    createdAt: dbTrip.createdAt.toISOString(),
    updatedAt: dbTrip.updatedAt.toISOString(),
    participants: dbTrip.participants.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
    })),
    expenses: dbTrip.expenses.map((e) => ({
      id: e.id,
      description: e.description,
      amountCents: e.amountCents,
      paidBy: e.paidBy,
      splitAmong: e.splitAmong,
      category: e.category as Trip["expenses"][0]["category"],
      date: e.date,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    })),
  };
}

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
