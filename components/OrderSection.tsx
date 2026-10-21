"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { BUSINESS, CAKE_FLAVOURS, CAKE_SIZES, formatNaira, SMALL_CHOPS } from "@/lib/menu";
import { emptyOrder, hasItems, receiptLines, orderTotal, whatsappUrl, type Cake, type Order } from "@/lib/order";
import { createReceipt, makeOrderRef } from "@/lib/receipt";
import { isShortNotice, LEAD_NOTICE, todayValue } from "@/lib/schedule";

const inputClass =
  "w-full rounded-lg border-2 border-plum/40 bg-white px-4 py-3 text-base text-plum placeholder:text-plum/60 focus:border-cherry";
const primaryButton =
  "min-h-12 rounded-full bg-cherry px-6 py-3 font-semibold text-white transition hover:bg-cherry-deep disabled:opacity-60";
const secondaryButton =
  "min-h-12 rounded-full border-2 border-plum px-6 py-3 font-semibold text-plum transition hover:bg-frosting-soft";

type Patch = (patch: Partial<Order>) => void;
type Receipt = { url: string; ref: string };

// Today's date only exists in the browser. Reading it this way keeps the server and browser
// HTML identical without setting state in an effect.
const subscribeToNothing = () => () => {};
const getToday = () => todayValue();
const getServerToday = () => "";

function validate(order: Order): string {
  if (!hasItems(order)) return "Pick a cake or at least one small chops pack.";
  if (order.cakes.some((cake) => !cake.flavour)) return "Choose a flavour for each cake.";
  if (order.fulfilment === "delivery" && !order.address.trim()) return "Enter your delivery address.";
  if (!order.date) return "Pick the date you need it by.";
  if (order.date < todayValue()) return "Pick today or a later date.";
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

function Stepper({
  name,
  quantity,
  onAdd,
  onRemove,
}: {
  name: string;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <button
        type="button"
        aria-label={`Remove one ${name}`}
        disabled={quantity === 0}
        onClick={onRemove}
        className="size-11 rounded-full border-2 border-cherry text-xl text-cherry disabled:opacity-30"
      >
        −
      </button>
      <span className="w-6 text-center text-lg font-semibold" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        aria-label={`Add one ${name}`}
        onClick={onAdd}
        className="size-11 rounded-full border-2 border-cherry text-xl text-cherry"
      >
        +
      </button>
    </div>
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
  const nextCakeId = useRef(1);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [handedOff, setHandedOff] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const today = useSyncExternalStore(subscribeToNothing, getToday, getServerToday);
  const receiptRef = useRef<Receipt | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const [showBar, setShowBar] = useState(false);

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

  // The cart bar shows on phones while the form is on screen but the summary is not
  useEffect(() => {
    const form = formRef.current;
    const summary = summaryRef.current;
    if (!form || !summary) return;
    const visible = { form: false, summary: false };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === form) visible.form = entry.isIntersecting;
        else visible.summary = entry.isIntersecting;
      }
      setShowBar(visible.form && !visible.summary);
    });
    observer.observe(form);
    observer.observe(summary);
    return () => observer.disconnect();
  }, []);

  function setQuantity(id: string, quantity: number) {
    update({ quantities: { ...order.quantities, [id]: Math.max(0, quantity) } });
  }

  function clearItems() {
    update({ cakes: [], quantities: {} });
    setConfirmClear(false);
  }

  // Every cake is its own line, so two cakes of one size can differ in flavour and design
  function addCake(size: string) {
    update({ cakes: [...order.cakes, { id: String(nextCakeId.current++), size, flavour: "", notes: "" }] });
  }

  function removeCake(id: string) {
    update({ cakes: order.cakes.filter((cake) => cake.id !== id) });
  }

  function removeLastCake(size: string) {
    const last = [...order.cakes].reverse().find((cake) => cake.size === size);
    if (last) removeCake(last.id);
  }

  function updateCake(id: string, patch: Partial<Cake>) {
    update({ cakes: order.cakes.map((cake) => (cake.id === id ? { ...cake, ...patch } : cake)) });
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
  const itemCount = order.cakes.length + Object.values(order.quantities).reduce((sum, n) => sum + n, 0);

  return (
    <>
      <form ref={formRef} onSubmit={review} noValidate className="mt-10 grid items-start gap-10 md:grid-cols-[1.3fr_1fr] md:gap-12">
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

          <p className="text-lg font-semibold">Add as many cakes and small chops as you need.</p>

          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold">Cakes</h3>
            <p className="-mt-3">Tap + for each cake you want. Every cake gets its own flavour and design notes.</p>

            <div className="space-y-3">
              {CAKE_SIZES.map((size) => (
                <div
                  key={size.id}
                  className="flex items-center justify-between gap-3 rounded-lg border-2 border-plum/40 bg-white px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">{size.label} cake</p>
                    <p className="font-semibold text-cherry">{formatNaira(size.price)}</p>
                  </div>
                  <Stepper
                    name={`${size.label} cake`}
                    quantity={order.cakes.filter((cake) => cake.size === size.id).length}
                    onAdd={() => addCake(size.id)}
                    onRemove={() => removeLastCake(size.id)}
                  />
                </div>
              ))}
            </div>

            {order.cakes.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-display text-xl font-bold">Your cakes</h4>
                <ul className="space-y-3">
                  {order.cakes.map((cake, i) => {
                    const size = CAKE_SIZES.find((x) => x.id === cake.size);
                    return (
                      <li
                        key={cake.id}
                        className="space-y-3 rounded-lg border-2 border-cherry bg-frosting-soft px-4 py-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-semibold">
                            Cake {i + 1}: {size?.label}{" "}
                            <span className="text-cherry">{size ? formatNaira(size.price) : ""}</span>
                          </p>
                          <button
                            type="button"
                            onClick={() => removeCake(cake.id)}
                            aria-label={`Remove cake ${i + 1}`}
                            className="shrink-0 font-semibold underline underline-offset-4"
                          >
                            Remove
                          </button>
                        </div>
                        <label className="block">
                          <span className="mb-1 block font-semibold">
                            Flavour<span className="sr-only"> for cake {i + 1}</span>{" "}
                            <span className="font-normal text-cherry">(required)</span>
                          </span>
                          <select
                            value={cake.flavour}
                            onChange={(e) => updateCake(cake.id, { flavour: e.target.value })}
                            className={inputClass}
                          >
                            <option value="">Choose a flavour</option>
                            {CAKE_FLAVOURS.map((flavour) => (
                              <option key={flavour} value={flavour}>
                                {flavour}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="mb-1 block font-semibold">
                            Design notes<span className="sr-only"> for cake {i + 1}</span> (optional)
                          </span>
                          <textarea
                            rows={2}
                            value={cake.notes}
                            onChange={(e) => updateCake(cake.id, { notes: e.target.value })}
                            placeholder="Colours, theme, message on the cake"
                            className={inputClass}
                          />
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-2xl font-bold">Small chops</h3>
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
                    <Stepper
                      name={item.name}
                      quantity={quantity}
                      onAdd={() => setQuantity(item.id, quantity + 1)}
                      onRemove={() => setQuantity(item.id, quantity - 1)}
                    />
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

        <aside ref={summaryRef} className="scroll-mt-20 rounded-xl border-2 border-plum/20 bg-white md:sticky md:top-24">
          <div aria-hidden className="gingham h-3 rounded-t-[10px]" />
          <div className="p-5 md:p-6">
            <h3 className="font-display text-2xl font-bold">Order summary</h3>
            <ul className="mt-3 min-h-8">
              {lines.length ? (
                lines.map((line, i) => (
                  <li
                    key={`${line.label}-${i}`}
                    className="flex justify-between gap-4 border-b-2 border-dotted border-plum/30 py-2"
                  >
                    <span>
                      {line.label}
                      {line.note && <span className="block text-sm">Design notes: {line.note}</span>}
                    </span>
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
                  min={today || undefined}
                  onChange={(e) => update({ date: e.target.value })}
                  className={inputClass}
                />
                <span className="mt-1 block text-sm">Please order {LEAD_NOTICE} ahead.</span>
              </label>
              {isShortNotice(order.date, today) && (
                <p role="status" className="rounded-lg bg-apricot/40 px-4 py-3 text-sm font-semibold">
                  That is sooner than our usual {LEAD_NOTICE} notice. We confirm the date with you on WhatsApp.
                </p>
              )}
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

      {showBar && itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-[4.1rem] z-20 border-t-2 border-plum/15 bg-icing px-3 py-2 md:hidden">
          <button
            type="button"
            onClick={() => summaryRef.current?.scrollIntoView()}
            className={`${primaryButton} flex w-full items-center justify-between gap-3`}
          >
            <span>
              {itemCount} {itemCount === 1 ? "item" : "items"} · {formatNaira(total)}
            </span>
            <span>View order</span>
          </button>
        </div>
      )}

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
