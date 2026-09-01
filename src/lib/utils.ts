import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return nanoid(10);
}

export function generateInviteCode(): string {
  // 6 character alphanumeric uppercase
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/** Array of vibrant participant colors */
export const PARTICIPANT_COLORS = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f43f5e", // rose
  "#3b82f6", // blue
  "#a855f7", // purple
];

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-BO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Pick a color from the palette by index (cycles) */
export function pickColor(index: number): string {
  return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
}

export const TRIP_EMOJIS = [
  "✈️", "🏖️", "🏔️", "🏕️", "🌴", "🗺️", "🚀", "🛳️",
  "🎡", "🏛️", "🌋", "🏜️", "🏝️", "🚂", "🛵", "⛺",
];
