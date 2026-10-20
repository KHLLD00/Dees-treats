import OrderForm from "@/components/OrderForm";

export const metadata = {
  title: "Order | Dee's Treats",
  description: "Place a cake or small chops order and send it on WhatsApp.",
};

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl text-plum">Place your order</h1>
      <p className="mt-2">Four quick steps, then your order is sent to us on WhatsApp.</p>
      <OrderForm />
    </div>
  );
}
