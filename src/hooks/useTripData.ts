"use client";

import { useMemo } from "react";
import type { Trip } from "@/types";

interface UserMeta {
  email?: string;
  name?: string;
}

/**
 * Reads the trip and user data injected by the Server Component layout
 * via a hidden div with id="__trip_data__".
 *
 * This bridges Server → Client without prop-drilling through Next.js layouts.
 */
export function useTripData(): { trip: Trip | null; userMeta: UserMeta } {
  return useMemo(() => {
    if (typeof document === "undefined") return { trip: null, userMeta: {} };

    const el = document.getElementById("__trip_data__");
    if (!el) return { trip: null, userMeta: {} };

    try {
      const trip = JSON.parse(el.dataset.trip ?? "null") as Trip | null;
      const userMeta = JSON.parse(el.dataset.user ?? "{}") as UserMeta;
      return { trip, userMeta };
    } catch {
      return { trip: null, userMeta: {} };
    }
  }, []);
}
