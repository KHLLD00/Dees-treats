"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { BUSINESS, CAKE_FLAVOURS, CAKE_SIZES, formatNaira, SMALL_CHOPS } from "@/lib/menu";
import { emptyOrder, hasItems, receiptLines, orderTotal, whatsappUrl, type Order } from "@/lib/order";
import { createReceipt, makeOrderRef } from "@/lib/receipt";
import { LEAD_HOURS, tomorrowValue } from "@/lib/schedule";

const inputClass =
  "w-full rounded-lg border-2 border-plum/40 bg-white px-4 py-3 text-base text-plum placeholder:text-plum/60 focus:border-cherry";
const primaryButton =
  "min-h-12 rounded-full bg-cherry px-6 py-3 font-semibold text-white transition hover:bg-cherry-deep disabled:opacity-60";
const secondaryButton =
  "min-h-12 rounded-full border-2 border-plum px-6 py-3 font-semibold text-plum transition hover:bg-frosting-soft";

type Patch = (patch: Partial<Order>) => void;
type Receipt = { url: string; ref: string };

function validate(order: Order): string {
  const hasCakePart = Boolean(order.size || order.flavour);
  if (hasCakePart && (!order.size || !order.flavour)) return "Choose both a size and a flavour for your cake.";
  if (!hasItems(order)) return "Pick a cake or at least one small chops pack.";
  if (order.fulfilment === "delivery" && !order.address.trim()) return "Enter your delivery address.";
  if (!order.date) return "Pick the date you need it by.";
  if (order.date < tomorrowValue()) return "Pick a date from tomorrow onwards.";
  if (!order.name.trim()) return "Enter your name.";
  if (!/^\+?[0-9\s-]{10,15}$/.test(order.phone.trim())) return "Enter a valid phone number.";
  return "";
}

function Choice({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="peer sr-only"
      />
      <span className="relative flex min-h-12 items-center justify-between gap-3 rounded-lg border-2 border-plum/40 bg-white px-4 py-3 text-plum transition after:absolute after:-right-2 after:-top-2 after:hidden after:size-6 after:items-center after:justify-center after:rounded-full after:bg-cherry after:text-sm after:font-semibold after:text-white after:content-['✓'] peer-checked:border-cherry peer-checked:bg-frosting-soft peer-checked:shadow-[inset_0_0_0_1px_var(--color-cherry)] peer-checked:after:flex peer-focus-visible:ring-2 peer-focus-visible:ring-cherry peer-focus-visible:ring-offset-2">
        {children}
      </span>
    </label>
  );
}

function Modal({ labelledBy, children }: { labelledBy: string; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum/50 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
      >
        {children}
      </div>
    </div>
  );
}

export default function OrderSection() {
  const [order, setOrder] = useState<Order>(emptyOrder);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [handedOff, setHandedOff] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  // Computed after mount so the server and browser always render the same HTML
  const [minDate, setMinDate] = useState("");
  const receiptRef = useRef<Receipt | null>(null);

  useEffect(() => setMinDate(tomorrowValue()), []);
  receiptRef.current = receipt;

  const update: Patch = (patch) => {
    setOrder((current) => ({ ...current, ...patch }));
    setError("");
  };

  const dialogOpen = Boolean(receipt) || confirmClear;
  useEffect(() => {
    if (!dialogOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (confirmClear) setConfirmClear(false);
      else closeReceipt();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [dialogOpen, confirmClear]);

  useEffect(() => {
    return () => {
      if (receiptRef.current) URL.revokeObjectURL(receiptRef.current.url);
    };
  }, []);

  function setQuantity(id: string, quantity: number) {
    update({ quantities: { ...order.quantities, [id]: Math.max(0, quantity) } });
  }

  function clearItems() {
    update({ size: "", flavour: "", cakeNotes: "", quantities: {} });
    setConfirmClear(false);
  }

  async function review(e: React.FormEvent) {
    e.preventDefault();
    if (working) return;
    const problem = validate(order);
    if (problem) return setError(problem);

    setWorking(true);
    const ref = makeOrderRef();
    const made = await createReceipt(order, ref);
    setWorking(false);
    if (!made) {
      // No image: send the full written order to WhatsApp instead
      window.open(whatsappUrl(order, ref, false), "_blank", "noopener,noreferrer");
      setError("We could not make your receipt image, so your full order was written out in WhatsApp. Tap send there.");
      return;
    }
    setHandedOff(false);
    setReceipt({ url: made.url, ref });
  }

  function saveReceipt(current: Receipt) {
    const link = document.createElement("a");
    link.href = current.url;
    link.download = `dees-treats-receipt-${current.ref}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // Saves the receipt, then opens the chat in the same tap so the browser allows it
  function continueOnWhatsApp() {
    if (!receipt) return;
    saveReceipt(receipt);
    window.open(whatsappUrl(order, receipt.ref, true), "_blank", "noopener,noreferrer");
    setHandedOff(true);
  }

  function closeReceipt() {
    const current = receiptRef.current;
    if (current) URL.revokeObjectURL(current.url);
    setReceipt(null);
    setHandedOff(false);
  }

  function startNewOrder() {
    closeReceipt();
    setOrder(emptyOrder);
    setError("");
  }

  const lines = receiptLines(order);
  const total = orderTotal(order);
  const delivery = order.fulfilment === "delivery";
  const cakeChosen = Boolean(order.size || order.flavour);

  return (
    <>
      <form onSubmit={review} noValidate className="mt-10 grid items-start gap-10 md:grid-cols-[1.3fr_1fr] md:gap-12">
        <div className="space-y-10">
          <fieldset>
            <legend className="mb-3 font-display text-2xl font-bold">How will you get it?</legend>
            <div className="grid grid-cols-2 gap-3">
              <Choice
                name="fulfilment"
                value="pickup"
                checked={order.fulfilment === "pickup"}
                onChange={() => update({ fulfilment: "pickup" })}
              >
                <span className="font-semibold">Pickup</span>
              </Choice>
              <Choice
                name="fulfilment"
                value="delivery"
                checked={delivery}
                onChange={() => update({ fulfilment: "delivery" })}
              >
                <span className="font-semibold">Delivery</span>
              </Choice>
            </div>
            {delivery && (
              <label className="mt-4 block">
                <span className="mb-2 block font-semibold">Delivery address</span>
                <textarea
                  rows={2}
                  value={order.address}
                  onChange={(e) => update({ address: e.target.value })}
                  autoComplete="street-address"
                  className={inputClass}
                />
                <span className="mt-1 block">We confirm the delivery fee on WhatsApp.</span>
              </label>
            )}
          </fieldset>

          <div className="space-y-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-2xl font-bold">Cake (optional)</h3>
              {cakeChosen && (
                <button
                  type="button"
                  onClick={() => update({ size: "", flavour: "", cakeNotes: "" })}
                  className="font-semibold underline underline-offset-4"
                >
                  Remove cake
                </button>
              )}
            </div>
            <p className="-mt-3">Cakes need {LEAD_HOURS.cake} hours notice.</p>
            <fieldset>
              <legend className="mb-2 font-semibold">Size</legend>
              <div className="grid grid-cols-2 gap-3">
                {CAKE_SIZES.map((size) => (
                  <Choice
                    key={size.id}
                    name="size"
                    value={size.id}
                    checked={order.size === size.id}
                    onChange={(id) => update({ size: id })}
                  >
                    <span className="font-semibold">{size.label}</span>
                    <span className="font-semibold text-cherry">{formatNaira(size.price)}</span>
                  </Choice>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 font-semibold">Flavour</legend>
              <div className="grid grid-cols-2 gap-3">
                {CAKE_FLAVOURS.map((flavour) => (
                  <Choice
                    key={flavour}
                    name="flavour"
                    value={flavour}
                    checked={order.flavour === flavour}
                    onChange={(value) => update({ flavour: value })}
                  >
                    <span className="font-medium">{flavour}</span>
                  </Choice>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className="mb-2 block font-semibold">Design notes (optional)</span>
              <textarea
                rows={3}
                value={order.cakeNotes}
                onChange={(e) => update({ cakeNotes: e.target.value })}
                placeholder="Colours, theme, message on the cake"
                className={inputClass}
              />
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-2xl font-bold">Small chops (optional)</h3>
              {lines.length > 0 && (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="font-semibold underline underline-offset-4"
                >
                  Clear order
                </button>
              )}
            </div>
            <p className="-mt-1">Small chops need {LEAD_HOURS["small-chops"]} hours notice.</p>
            <div className="space-y-3">
              {SMALL_CHOPS.map((item) => {
                const quantity = order.quantities[item.id] ?? 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border-2 border-plum/40 bg-white px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p>{item.detail}</p>
                      <p className="font-semibold text-cherry">{formatNaira(item.price)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        type="button"
                        aria-label={`Remove one ${item.name}`}
                        disabled={quantity === 0}
                        onClick={() => setQuantity(item.id, quantity - 1)}
                        className="size-11 rounded-full border-2 border-cherry text-xl text-cherry disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-lg font-semibold" aria-live="polite">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Add one ${item.name}`}
                        onClick={() => setQuantity(item.id, quantity + 1)}
                        className="size-11 rounded-full border-2 border-cherry text-xl text-cherry"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block font-semibold">Notes (optional)</span>
            <textarea
              rows={2}
              value={order.notes}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="Anything we should know"
              className={inputClass}
            />
          </label>
        </div>

        <aside className="rounded-xl border-2 border-plum/20 bg-white md:sticky md:top-24">
          <div aria-hidden className="gingham h-3 rounded-t-[10px]" />
          <div className="p-5 md:p-6">
            <h3 className="font-display text-2xl font-bold">Order summary</h3>
            <ul className="mt-3 min-h-8">
              {lines.length ? (
                lines.map((line) => (
                  <li
                    key={line.label}
                    className="flex justify-between gap-4 border-b-2 border-dotted border-plum/30 py-2"
                  >
                    <span>{line.label}</span>
                    <span className="shrink-0 font-semibold">{formatNaira(line.price)}</span>
                  </li>
                ))
              ) : (
                <li className="py-2">Nothing added yet.</li>
              )}
            </ul>
            <p className="mt-3 flex items-baseline justify-between font-display text-2xl font-black">
              <span>Estimated total</span>
              <span className="text-cherry">{formatNaira(total)}</span>
            </p>
            <p className="mt-2">
              We confirm the final price{delivery ? " and delivery fee" : ""} on WhatsApp.
            </p>

            <div className="mt-5 space-y-4 border-t-2 border-plum/15 pt-5">
              <label className="block">
                <span className="mb-2 block font-semibold">Your name</span>
                <input
                  type="text"
                  value={order.name}
                  onChange={(e) => update({ name: e.target.value })}
                  autoComplete="name"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-2 block font-semibold">Phone number</span>
                <input
                  type="tel"
                  inputMode="tel"
                  value={order.phone}
                  onChange={(e) => update({ phone: e.target.value })}
                  autoComplete="tel"
                  placeholder="0801 234 5678"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-2 block font-semibold">Needed by</span>
                <input
                  type="date"
                  value={order.date}
                  min={minDate || undefined}
                  onChange={(e) => update({ date: e.target.value })}
                  className={inputClass}
                />
              </label>
            </div>

            <button type="submit" disabled={working} className={`${primaryButton} mt-6 w-full`}>
              {working ? "Making your receipt..." : "Review order and get receipt"}
            </button>
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-lg border-2 border-cherry bg-frosting-soft px-4 py-3 font-semibold"
              >
                {error}
              </p>
            )}
          </div>
        </aside>
      </form>

      {confirmClear && (
        <Modal labelledBy="clear-title">
          <h3 id="clear-title" className="font-display text-2xl font-bold">
            Clear your order?
          </h3>
          <p className="mt-2">This removes the cake and all small chops you added.</p>
          <div className="mt-5 flex gap-3">
            <button autoFocus type="button" className={`${secondaryButton} flex-1`} onClick={() => setConfirmClear(false)}>
              Keep order
            </button>
            <button type="button" className={`${primaryButton} flex-1`} onClick={clearItems}>
              Clear order
            </button>
          </div>
        </Modal>
      )}

      {receipt && (
        <Modal labelledBy="receipt-title">
          <h3 id="receipt-title" className="font-display text-2xl font-bold">
            {handedOff ? "Receipt saved" : "Your receipt is ready"}
          </h3>
          <p className="mt-1 font-semibold text-cherry">Order ref {receipt.ref}</p>
          <p className="mt-2">
            {handedOff
              ? "In WhatsApp, tap the attach button, choose your receipt image and send it. We will confirm your order there."
              : "Tap Continue on WhatsApp. Your receipt saves to your phone and WhatsApp opens. Attach the receipt image in the chat and send it."}
          </p>
          <div className="mt-4 max-h-[44vh] overflow-y-auto rounded-lg border-2 border-plum/20 bg-frosting-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={receipt.url} alt={`Order receipt ${receipt.ref}`} className="block w-full" />
          </div>
          <div className="mt-5 flex flex-col gap-3">
            <button autoFocus type="button" className={primaryButton} onClick={continueOnWhatsApp}>
              {handedOff ? "Open WhatsApp again" : "Continue on WhatsApp"}
            </button>
            <button type="button" className={secondaryButton} onClick={() => saveReceipt(receipt)}>
              Save receipt
            </button>
            {handedOff ? (
              <button type="button" onClick={startNewOrder} className="font-semibold underline underline-offset-4">
                Start a new order
              </button>
            ) : (
              <button type="button" onClick={closeReceipt} className="font-semibold underline underline-offset-4">
                Back to edit order
              </button>
            )}
          </div>
          <p className="mt-4 text-sm">
            Trouble? Call or WhatsApp{" "}
            <a href={`tel:${BUSINESS.phone}`} className="font-semibold underline">
              {BUSINESS.phone}
            </a>
            .
          </p>
        </Modal>
      )}
    </>
  );
}
