"use server";

import { db } from "@/server/db";
import { profiles, trips, tripMembers } from "@/server/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  return user;
}

export async function searchUserByUsernameAction(username: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const query = username.toLowerCase().trim();
  if (!query) return null;

  const result = await db.select().from(profiles).where(eq(profiles.username, query));
  if (result.length > 0) {
    return {
      id: result[0].id,
      name: result[0].name,
      username: result[0].username,
    };
  }
  return null;
}

// ─── Get my profile ──────────────────────────────────────────────────────────

export async function getMyProfileAction() {
  const user = await requireAuth();
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
  return profile ?? null;
}

// ─── Update profile ──────────────────────────────────────────────────────────

export async function updateProfileAction(data: {
  name: string;
  username: string;
}) {
  const user = await requireAuth();

  const name = data.name.trim();
  const username = data.username.toLowerCase().trim();

  if (!name || !username) throw new Error("Nombre y usuario son requeridos.");

  // Check username uniqueness (exclude self)
  const conflict = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(and(eq(profiles.username, username), ne(profiles.id, user.id)));

  if (conflict.length > 0) throw new Error("Ese nombre de usuario ya está en uso.");

  await db
    .insert(profiles)
    .values({
      id: user.id,
      email: user.email!,
      name,
      username,
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: { name, username },
    });

  revalidatePath("/profile");
  revalidatePath("/trips");
}

// ─── Delete account ──────────────────────────────────────────────────────────

export async function deleteAccountAction() {
  const user = await requireAuth();

  // Check if user owns any trips
  const ownedTrips = await db
    .select({ id: trips.id })
    .from(trips)
    .where(eq(trips.ownerId, user.id));

  if (ownedTrips.length > 0) {
    throw new Error(
      `No puedes eliminar tu cuenta mientras seas dueño de ${ownedTrips.length} plan(es). Elimínalos primero.`
    );
  }

  // Remove from trip_members
  await db.delete(tripMembers).where(eq(tripMembers.userId, user.id));

  // Delete profile
  await db.delete(profiles).where(eq(profiles.id, user.id));

  // Delete auth user via service role (use admin client or RPC)
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}
