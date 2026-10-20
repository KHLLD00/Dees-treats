export type Category = "cake" | "small-chops";

export const BUSINESS = {
  name: "Dee's Treats",
  tagline: "Treat yourself right with Dee's!",
  phone: "07050207190",
  whatsapp: "2347050207190",
};

export const CAKE_SIZES = [
  { id: "4", label: "4-inch", price: 7000 },
  { id: "5", label: "5-inch", price: 11000 },
  { id: "6", label: "6-inch", price: 15000 },
  { id: "7", label: "7-inch", price: 18000 },
  { id: "8", label: "8-inch", price: 22000 },
  { id: "10", label: "10-inch", price: 28000 },
];

// Placeholder flavours, replace with Dee's actual list
export const CAKE_FLAVOURS = ["Vanilla", "Chocolate", "Red velvet", "Strawberry"];

export const SMALL_CHOPS = [
  { id: "samosas", name: "Samosas", detail: "10 pieces", price: 5000 },
  { id: "springroll", name: "Springroll", detail: "10 pieces", price: 5000 },
  { id: "combo", name: "Samosa & Springroll Combo", detail: "10 pieces", price: 5000 },
  { id: "puff-puff", name: "Puff Puff", detail: "10 pieces", price: 1000 },
  {
    id: "quick-fix",
    name: "Quick Fix",
    detail: "5 samosas, 5 springroll, 10 puff puff, 5 beef",
    price: 9000,
  },
  {
    id: "party-starter",
    name: "Party Starter",
    detail: "10 samosas, 10 springroll, 20 puff puff, 10 beef",
    price: 16000,
  },
];

export const CATEGORIES = {
  cake: {
    label: "Custom cake",
    blurb: "Pick a size and flavour, tell us the design",
    startingPrice: Math.min(...CAKE_SIZES.map((s) => s.price)),
  },
  "small-chops": {
    label: "Small chops",
    blurb: "Samosas, springroll, puff puff, beef and party packs",
    startingPrice: Math.min(...SMALL_CHOPS.map((i) => i.price)),
  },
} satisfies Record<Category, { label: string; blurb: string; startingPrice: number }>;

export function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}
