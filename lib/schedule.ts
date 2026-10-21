import type { Category } from "./menu";

// Shown to customers as guidance. The order form only asks for a "needed by" date,
// and we confirm the date with them on WhatsApp.
export const LEAD_HOURS: Record<Category, number> = {
  cake: 48,
  "small-chops": 24,
};

export function toDateValue(d: Date) {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function parseDateValue(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Earliest "needed by" date: tomorrow, in the customer's own time zone. */
export function tomorrowValue(now: Date = new Date()) {
  const day = new Date(now);
  day.setDate(day.getDate() + 1);
  return toDateValue(day);
}

export function formatDate(value: string) {
  return parseDateValue(value).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
