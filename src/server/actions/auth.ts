"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { profiles } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const username = (formData.get("username") as string).toLowerCase().trim();

  // Check uniqueness of username
  const existing = await db.select().from(profiles).where(eq(profiles.username, username));
  if (existing.length > 0) {
    return { error: "El nombre de usuario ya está en uso." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, username },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Insert into profiles
  if (data.user) {
    try {
      await db.insert(profiles).values({
        id: data.user.id,
        email: data.user.email!,
        name,
        username,
      });
    } catch (e: any) {
      console.error("Failed to create profile", e);
      // Let it pass, user is created, maybe handle cleanup in a real scenario
    }
  }

  // Skip email confirmation — redirect directly to trips
  revalidatePath("/", "layout");
  redirect("/trips");
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/trips");
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
