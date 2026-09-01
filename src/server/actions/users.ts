"use server";

import { db } from "@/server/db";
import { profiles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function searchUserByUsernameAction(username: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const query = username.toLowerCase().trim();

  // Don't search for empty strings
  if (!query) return null;

  const result = await db.select().from(profiles).where(eq(profiles.username, query));
  
  if (result.length > 0) {
    return {
      id: result[0].id,
      name: result[0].name,
      username: result[0].username
    };
  }

  return null;
}
