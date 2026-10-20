import { BUSINESS, CAKE_SIZES, CATEGORIES, formatNaira, SMALL_CHOPS, type Category } from "./menu";
import { formatDate, TIME_SLOTS } from "./schedule";

export type Order = {
  category: Category | null;
  size: string;
  flavour: string;
  quantities: Record<string, number>;
  notes: string;
  fulfilment: "pickup" | "delivery";
  address: string;
  date: string;
  slot: string;
  name: string;
  phone: string;
};

export const emptyOrder: Order = {
  category: null,
  size: "",
  flavour: "",
  quantities: {},
  notes: "",
  fulfilment: "pickup",
  address: "",
  date: "",
  slot: "",
  name: "",
  phone: "",
};

export function orderLines(order: Order) {
  if (order.category === "cake") {
    const size = CAKE_SIZES.find((s) => s.id === order.size);
    return size ? [`${size.label} ${order.flavour} cake (${formatNaira(size.price)})`] : [];
  }
  return SMALL_CHOPS.filter((i) => order.quantities[i.id] > 0).map(
    (i) => `${order.quantities[i.id]} x ${i.name} (${formatNaira(i.price * order.quantities[i.id])})`,
  );
}

export function orderTotal(order: Order) {
  if (order.category === "cake") {
    return CAKE_SIZES.find((s) => s.id === order.size)?.price ?? 0;
  }
  return SMALL_CHOPS.reduce((sum, i) => sum + i.price * (order.quantities[i.id] ?? 0), 0);
}

export function buildMessage(order: Order) {
  const slot = TIME_SLOTS.find((s) => s.id === order.slot);
  const lines = [
    `Hello ${BUSINESS.name}, I'd like to place an order.`,
    "",
    `*${order.category ? CATEGORIES[order.category].label : "Order"}*`,
    ...orderLines(order),
  ];
  if (order.notes.trim()) {
    lines.push(`${order.category === "cake" ? "Design notes" : "Notes"}: ${order.notes.trim()}`);
  }
  lines.push(
    "",
    order.fulfilment === "delivery" ? `*Delivery* to: ${order.address.trim()}` : "*Pickup*",
    `Date: ${formatDate(order.date)}, ${slot?.label ?? ""}`,
    "",
    `Name: ${order.name.trim()}`,
    `Phone: ${order.phone.trim()}`,
    "",
    `Estimated total: ${formatNaira(orderTotal(order))}${order.fulfilment === "delivery" ? " (delivery fee not included)" : ""}`,
  );
  return lines.join("\n");
}

export function whatsappUrl(order: Order) {
  return `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(buildMessage(order))}`;
}
