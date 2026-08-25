"use client";

import { createContext, useContext } from "react";
import type { Trip } from "@/types";

interface UserMeta {
  email?: string;
  name?: string;
}

interface TripContextValue {
  trip: Trip | null;
  userMeta: UserMeta;
}

const TripContext = createContext<TripContextValue>({
  trip: null,
  userMeta: {},
});

export function TripProvider({
  trip,
  userMeta,
  children,
}: {
  trip: Trip | null;
  userMeta: UserMeta;
  children: React.ReactNode;
}) {
  return (
    <TripContext.Provider value={{ trip, userMeta }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTripData() {
  return useContext(TripContext);
}
