"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  CAKE_FLAVOURS,
  CAKE_SIZES,
  CATEGORIES,
  formatNaira,
  SMALL_CHOPS,
  type Category,
} from "@/lib/menu";
import { emptyOrder, orderLines, orderTotal, whatsappUrl, type Order } from "@/lib/order";
import { earliestDate, formatDate, isSlotOpen, LEAD_HOURS, TIME_SLOTS } from "@/lib/schedule";

const STEP_TITLES = ["What would you like?", "The details", "Pickup or delivery", "Your details"];
const LAST_STEP = STEP_TITLES.length - 1;

const inputClass =
  "w-full rounded-lg border-2 border-plum/40 bg-white px-4 py-3 text-base text-plum placeholder:text-plum/60 focus:border-cherry";
const primaryButton =
  "min-h-12 flex-1 rounded-full bg-cherry px-6 py-3 font-semibold text-white transition hover:bg-cherry-deep";

type Patch = (patch: Partial<Order>) => void;

function validate(step: number, order: Order): string {
  if (step === 0 && !order.category) return "Choose a cake or small chops to continue.";

  if (step === 1) {
    if (order.category === "cake") {
      if (!order.size) return "Choose a cake size.";
      if (!order.flavour) return "Choose a flavour.";
    } else if (orderTotal(order) === 0) {
      return "Add at least one pack to continue.";
    }
  }

  if (step === 2 && order.category) {
    if (order.fulfilment === "delivery" && !order.address.trim()) return "Enter your delivery address.";
    if (!order.date) return "Pick a date.";
    const now = new Date();
    const earliest = earliestDate(order.category, now);
    if (order.date < earliest) {
      return `${CATEGORIES[order.category].label} orders need ${LEAD_HOURS[order.category]} hours notice. The earliest date is ${formatDate(earliest)}.`;
    }
    const slot = TIME_SLOTS.find((s) => s.id === order.slot);
    if (!slot) return "Pick a time.";
    if (!isSlotOpen(order.date, slot, order.category, now)) return "That time is too soon. Pick a later time.";
  }

  if (step === 3) {
    if (!order.name.trim()) return "Enter your name.";
    if (!/^\+?[0-9\s-]{10,15}$/.test(order.phone.trim())) return "Enter a valid phone number.";
  }

  return "";
}

function Choice({
  name,
  value,
  checked,
  disabled,
  onChange,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block cursor-pointer has-[:disabled]:cursor-not-allowed">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="peer sr-only"
      />
      <span className="relative flex min-h-12 items-center justify-between gap-3 rounded-lg border-2 border-plum/40 bg-white px-4 py-3 text-plum transition after:absolute after:-right-2 after:-top-2 after:hidden after:size-6 after:items-center after:justify-center after:rounded-full after:bg-cherry after:text-sm after:font-semibold after:text-white after:content-['✓'] peer-checked:border-cherry peer-checked:bg-frosting-soft peer-checked:shadow-[inset_0_0_0_1px_var(--color-cherry)] peer-checked:after:flex peer-focus-visible:ring-2 peer-focus-visible:ring-cherry peer-focus-visible:ring-offset-2 peer-disabled:opacity-40">
        {children}
      </span>
    </label>
  );
}

function CategoryStep({ order, update }: { order: Order; update: Patch }) {
  function pick(category: Category) {
    if (category === order.category) return;
    update({ category, size: "", flavour: "", quantities: {}, date: "", slot: "" });
  }

  return (
    <div className="space-y-3">
      {(Object.keys(CATEGORIES) as Category[]).map((key) => (
        <Choice
          key={key}
          name="category"
          value={key}
          checked={order.category === key}
          onChange={() => pick(key)}
        >
          <span>
            <span className="block font-semibold">{CATEGORIES[key].label}</span>
            <span className="block text-sm font-normal text-plum">{CATEGORIES[key].blurb}</span>
          </span>
          <span className="shrink-0 text-sm font-medium text-cherry">
            From {formatNaira(CATEGORIES[key].startingPrice)}
          </span>
        </Choice>
      ))}
    </div>
  );
}

function CakeStep({ order, update }: { order: Order; update: Patch }) {
  return (
    <>
      <fieldset>
        <legend className="mb-2 font-semibold text-plum">Size</legend>
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
              <span className="text-sm font-medium text-cherry">{formatNaira(size.price)}</span>
            </Choice>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-semibold text-plum">Flavour</legend>
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
        <span className="mb-2 block font-semibold text-plum">Design notes (optional)</span>
        <textarea
          rows={3}
          value={order.notes}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="Colours, theme, message on the cake"
          className={inputClass}
        />
      </label>
    </>
  );
}

function SmallChopsStep({ order, update }: { order: Order; update: Patch }) {
  function setQuantity(id: string, quantity: number) {
    update({ quantities: { ...order.quantities, [id]: Math.max(0, quantity) } });
  }

  return (
    <>
      <div className="space-y-3">
        {SMALL_CHOPS.map((item) => {
          const quantity = order.quantities[item.id] ?? 0;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border-2 border-plum/25 bg-white px-4 py-3"
            >
              <div>
                <p className="font-semibold text-plum">{item.name}</p>
                <p className="text-sm">{item.detail}</p>
                <p className="text-sm font-medium text-cherry">{formatNaira(item.price)}</p>
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
                <span className="w-5 text-center font-semibold" aria-live="polite">
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
      <p className="font-semibold text-plum">Total so far: {formatNaira(orderTotal(order))}</p>

      <label className="block">
        <span className="mb-2 block font-semibold text-plum">Notes (optional)</span>
        <textarea
          rows={2}
          value={order.notes}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="Anything we should know"
          className={inputClass}
        />
      </label>
    </>
  );
}

function ScheduleStep({ order, category, update }: { order: Order; category: Category; update: Patch }) {
  const now = new Date();
  const earliest = earliestDate(category, now);

  function changeDate(date: string) {
    const slot = TIME_SLOTS.find((s) => s.id === order.slot);
    const stillOpen = slot && date && isSlotOpen(date, slot, category, new Date());
    update({ date, slot: stillOpen ? order.slot : "" });
  }

  return (
    <>
      <fieldset>
        <legend className="mb-2 font-semibold text-plum">How will you get it?</legend>
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
            checked={order.fulfilment === "delivery"}
            onChange={() => update({ fulfilment: "delivery" })}
          >
            <span className="font-semibold">Delivery</span>
          </Choice>
        </div>
      </fieldset>

      {order.fulfilment === "delivery" && (
        <label className="block">
          <span className="mb-2 block font-semibold text-plum">Delivery address</span>
          <textarea
            rows={2}
            value={order.address}
            onChange={(e) => update({ address: e.target.value })}
            autoComplete="street-address"
            className={inputClass}
          />
          <span className="mt-1 block text-sm">We confirm the delivery fee on WhatsApp.</span>
        </label>
      )}

      <label className="block">
        <span className="mb-2 block font-semibold text-plum">Date</span>
        <input
          type="date"
          value={order.date}
          min={earliest}
          onChange={(e) => changeDate(e.target.value)}
          className={inputClass}
        />
        <span className="mt-1 block text-sm">
          {CATEGORIES[category].label} orders need {LEAD_HOURS[category]} hours notice. Earliest date: {formatDate(earliest)}.
        </span>
      </label>

      <fieldset>
        <legend className="mb-2 font-semibold text-plum">Time</legend>
        <div className="space-y-3">
          {TIME_SLOTS.map((slot) => (
            <Choice
              key={slot.id}
              name="slot"
              value={slot.id}
              checked={order.slot === slot.id}
              disabled={!order.date || !isSlotOpen(order.date, slot, category, now)}
              onChange={(id) => update({ slot: id })}
            >
              <span className="font-medium">{slot.label}</span>
            </Choice>
          ))}
        </div>
        {!order.date && <p className="mt-1 text-sm">Pick a date first.</p>}
      </fieldset>
    </>
  );
}

function ContactStep({ order, category, update }: { order: Order; category: Category; update: Patch }) {
  const slot = TIME_SLOTS.find((s) => s.id === order.slot);

  return (
    <>
      <div className="rounded-lg bg-frosting-soft p-5 text-sm">
        <p className="font-semibold text-plum">{CATEGORIES[category].label}</p>
        <ul className="mt-1 list-disc pl-5">
          {orderLines(order).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-3">
          {order.fulfilment === "delivery" ? `Delivery to ${order.address.trim()}` : "Pickup"} on{" "}
          {formatDate(order.date)}, {slot?.label}
        </p>
        <p className="mt-3 font-semibold text-plum">Estimated total: {formatNaira(orderTotal(order))}</p>
        <p className="text-xs">
          We confirm the final price{order.fulfilment === "delivery" ? " and delivery fee" : ""} on WhatsApp.
        </p>
      </div>

      <label className="block">
        <span className="mb-2 block font-semibold text-plum">Your name</span>
        <input
          type="text"
          value={order.name}
          onChange={(e) => update({ name: e.target.value })}
          autoComplete="name"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-2 block font-semibold text-plum">Phone number</span>
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
    </>
  );
}

export default function OrderForm() {
  const [step, setStep] = useState(0);
  const [order, setOrder] = useState<Order>(emptyOrder);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const update: Patch = (patch) => {
    setOrder((current) => ({ ...current, ...patch }));
    setError("");
  };

  function go(target: number) {
    setStep(target);
    setError("");
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validate(step, order);
    if (problem) return setError(problem);
    if (step < LAST_STEP) return go(step + 1);
    window.open(whatsappUrl(order), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-8 overflow-hidden rounded-xl border-2 border-plum/20 bg-white">
        <div className="p-6 md:p-8">
        <h2 className="font-display text-3xl font-bold text-plum">Almost done</h2>
        <p className="mt-2">
          Tap send in WhatsApp and we will confirm your order there. If WhatsApp did not open, use the button below.
        </p>
        <a
          href={whatsappUrl(order)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block rounded-full bg-cherry px-8 py-3 font-semibold text-white transition hover:bg-cherry-deep"
        >
          Open WhatsApp
        </a>
        <button
          type="button"
          onClick={() => {
            setOrder(emptyOrder);
            setStep(0);
            setSent(false);
          }}
          className="mt-4 block font-semibold text-plum underline underline-offset-4"
        >
          Start a new order
        </button>
        </div>
      </div>
    );
  }

  const category = order.category;

  return (
    <form onSubmit={submit} noValidate className="mt-8 overflow-hidden rounded-xl border-2 border-plum/20 bg-white">
      <div className="p-5 md:p-8">
      <div ref={topRef} className="scroll-mt-24">
        <p className="font-semibold text-cherry">
          Step {step + 1} of {STEP_TITLES.length}
        </p>
        <div className="mt-2 flex gap-2" aria-hidden>
          {STEP_TITLES.map((title, i) => (
            <span key={title} className={`h-2 flex-1 rounded-full ${i <= step ? "bg-cherry" : "bg-plum/15"}`} />
          ))}
        </div>
        <h2 className="mt-5 font-display text-3xl font-bold text-plum">{STEP_TITLES[step]}</h2>
      </div>

      <div className="mt-4 space-y-5">
        {step === 0 && <CategoryStep order={order} update={update} />}
        {step === 1 && category === "cake" && <CakeStep order={order} update={update} />}
        {step === 1 && category === "small-chops" && <SmallChopsStep order={order} update={update} />}
        {step === 2 && category && <ScheduleStep order={order} category={category} update={update} />}
        {step === 3 && category && <ContactStep order={order} category={category} update={update} />}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border-2 border-cherry bg-frosting-soft px-4 py-3 font-semibold text-plum">
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => go(step - 1)}
            className="min-h-12 rounded-full border-2 border-plum px-6 py-3 font-semibold text-plum transition hover:bg-frosting-soft"
          >
            Back
          </button>
        )}
        <button type="submit" className={primaryButton}>
          {step < LAST_STEP ? "Continue" : "Send order on WhatsApp"}
        </button>
      </div>
      </div>
    </form>
  );
}
