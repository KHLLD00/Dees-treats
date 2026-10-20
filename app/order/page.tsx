import OrderForm from "@/components/OrderForm";

export const metadata = {
  title: "Order | Dee's Treats",
  description: "Place a cake or small chops order and send it on WhatsApp.",
};

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      <h1 className="font-display text-5xl font-black md:text-6xl">Place your order</h1>
      <p className="mt-3 text-lg">Four short steps, then your order opens in WhatsApp ready to send.</p>
      <OrderForm />
    </div>
  );
}
