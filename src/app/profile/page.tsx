import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { profiles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import ProfilePageClient from "./ProfilePageClient";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  let [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
  
  if (!profile) {
    // Si no tiene perfil (ej. cuenta antigua), le creamos uno al vuelo
    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "Usuario";
    const username = user.user_metadata?.username || `user_${user.id.substring(0, 6)}`;
    
    try {
      [profile] = await db.insert(profiles).values({
        id: user.id,
        email: user.email!,
        name,
        username,
      }).returning();
    } catch (e) {
      // Si falla por unicidad u otro error, creamos uno en memoria para que no crashee la página
      profile = {
        id: user.id,
        email: user.email!,
        name,
        username,
        createdAt: new Date(),
      };
    }
  }

  return <ProfilePageClient profile={profile} email={user.email!} />;
}
