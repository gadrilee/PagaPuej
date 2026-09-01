import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NewTripClient from "./client";
import { db } from "@/server/db";
import { profiles } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export default async function NewTripPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile if possible to use their name/username
  let userName = user.user_metadata?.full_name || "Yo";
  
  try {
    const userProfile = await db.select().from(profiles).where(eq(profiles.id, user.id));
    if (userProfile.length > 0) {
      userName = userProfile[0].name;
    }
  } catch (e) {
    // Ignore db errors, just fallback to metadata
  }

  return <NewTripClient userName={userName} />;
}
