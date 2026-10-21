import { BUSINESS, CAKE_SIZES, formatNaira, SMALL_CHOPS } from "./menu";
import { formatDate } from "./schedule";

// One order can hold a cake, small chops, or both.
export type Order = {
  fulfilment: "pickup" | "delivery";
  address: string;
  size: string;
  flavour: string;
  cakeNotes: string;
  quantities: Record<string, number>;
  notes: string;
  date: string;
  name: string;
  phone: string;
};

export const emptyOrder: Order = {
  fulfilment: "pickup",
  address: "",
  size: "",
  flavour: "",
  cakeNotes: "",
  quantities: {},
  notes: "",
  date: "",
  name: "",
  phone: "",
};

export type ReceiptLine = { label: string; price: number };

export function receiptLines(order: Order): ReceiptLine[] {
  const lines: ReceiptLine[] = [];
  const size = CAKE_SIZES.find((s) => s.id === order.size);
  if (size && order.flavour) {
    lines.push({ label: `${size.label} ${order.flavour} cake`, price: size.price });
  }
  for (const item of SMALL_CHOPS) {
    const quantity = order.quantities[item.id] ?? 0;
    if (quantity > 0) lines.push({ label: `${quantity} x ${item.name}`, price: item.price * quantity });
  }
  return lines;
}

export function orderTotal(order: Order) {
  return receiptLines(order).reduce((sum, line) => sum + line.price, 0);
}

export function hasItems(order: Order) {
  return receiptLines(order).length > 0;
}

// The plain-text order. Only used if the receipt image could not be made.
export function buildMessage(order: Order, ref: string) {
  const lines = [
    `Hello ${BUSINESS.name}, I'd like to place an order.`,
    `Order ref: ${ref}`,
    "",
    ...receiptLines(order).map((line) => `${line.label} (${formatNaira(line.price)})`),
  ];
  if (order.cakeNotes.trim()) lines.push(`Design notes: ${order.cakeNotes.trim()}`);
  if (order.notes.trim()) lines.push(`Notes: ${order.notes.trim()}`);
  lines.push(
    "",
    order.fulfilment === "delivery" ? `*Delivery* to: ${order.address.trim()}` : "*Pickup*",
    `Needed by: ${formatDate(order.date)}`,
    "",
    `Name: ${order.name.trim()}`,
    `Phone: ${order.phone.trim()}`,
    "",
    `Estimated total: ${formatNaira(orderTotal(order))}${order.fulfilment === "delivery" ? " (delivery fee not included)" : ""}`,
  );
  return lines.join("\n");
}

// With a receipt image the chat opens with one short line; the image carries the details.
export function whatsappUrl(order: Order, ref: string, receiptMade: boolean) {
  const text = receiptMade
    ? `Hello ${BUSINESS.name}, here is my order receipt. Order ref: ${ref}`
    : buildMessage(order, ref);
  return `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(text)}`;
}
