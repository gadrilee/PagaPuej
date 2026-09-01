import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import JoinPageClient from "./JoinPageClient";

interface Props {
  searchParams: Promise<{ code?: string }>;
}

export default async function JoinPage({ searchParams }: Props) {
  const { code } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <JoinPageClient code={code} isLoggedIn={!!user} />;
}
