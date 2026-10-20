import type { Category } from "./menu";

const HOUR = 3_600_000;

export const LEAD_HOURS: Record<Category, number> = {
  cake: 48,
  "small-chops": 24,
};

export const TIME_SLOTS = [
  { id: "morning", label: "Morning (9am to 12pm)", startHour: 9 },
  { id: "afternoon", label: "Afternoon (12pm to 4pm)", startHour: 12 },
  { id: "evening", label: "Evening (4pm to 7pm)", startHour: 16 },
];

type Slot = (typeof TIME_SLOTS)[number];

function toDateValue(d: Date) {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function parseDateValue(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isSlotOpen(date: string, slot: Slot, category: Category, now: Date) {
  const start = parseDateValue(date);
  start.setHours(slot.startHour);
  return start.getTime() >= now.getTime() + LEAD_HOURS[category] * HOUR;
}

export function earliestDate(category: Category, now: Date) {
  const day = new Date(now.getTime() + LEAD_HOURS[category] * HOUR);
  while (!TIME_SLOTS.some((s) => isSlotOpen(toDateValue(day), s, category, now))) {
    day.setDate(day.getDate() + 1);
  }
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
