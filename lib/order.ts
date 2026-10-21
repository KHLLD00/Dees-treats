import { BUSINESS, CAKE_SIZES, formatNaira, SMALL_CHOPS } from "./menu";
import { formatDate } from "./schedule";

// One order can hold any number of cakes (each with its own size, flavour and design
// notes) plus any quantity of each small chops pack.
export type Cake = { id: string; size: string; flavour: string; notes: string };

export type Order = {
  fulfilment: "pickup" | "delivery";
  address: string;
  cakes: Cake[];
  quantities: Record<string, number>;
  notes: string;
  date: string;
  name: string;
  phone: string;
};

export const emptyOrder: Order = {
  fulfilment: "pickup",
  address: "",
  cakes: [],
  quantities: {},
  notes: "",
  date: "",
  name: "",
  phone: "",
};

export type ReceiptLine = { label: string; price: number; note?: string };

export function receiptLines(order: Order): ReceiptLine[] {
  const lines: ReceiptLine[] = [];
  for (const cake of order.cakes) {
    const size = CAKE_SIZES.find((s) => s.id === cake.size);
    if (!size) continue;
    lines.push({
      label: `${size.label} ${cake.flavour} cake`,
      price: size.price,
      note: cake.notes.trim() || undefined,
    });
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
    ...receiptLines(order).flatMap((line) => [
      `${line.label} (${formatNaira(line.price)})`,
      ...(line.note ? [`   Design notes: ${line.note}`] : []),
    ]),
  ];
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
