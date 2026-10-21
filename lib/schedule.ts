// Customers are asked to order 24 to 48 hours ahead. This is guidance only: the order form
// never blocks a date for it, and we confirm the date with them on WhatsApp.
export const LEAD_NOTICE = "24 to 48 hours";

function toDateValue(d: Date) {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function parseDateValue(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function shiftDay(value: string, days: number) {
  const day = parseDateValue(value);
  day.setDate(day.getDate() + days);
  return toDateValue(day);
}

/** Today's date in the customer's own time zone. */
export function todayValue(now: Date = new Date()) {
  return toDateValue(now);
}

/** True when the needed-by date is today or tomorrow, which is sooner than the usual notice. */
export function isShortNotice(date: string, today: string) {
  return Boolean(date && today) && date <= shiftDay(today, 1);
}

export function formatDate(value: string) {
  return parseDateValue(value).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
