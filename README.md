# Dee's Treats

A modern, mobile-friendly ordering website for **Dee's Treats**, designed to make ordering custom cakes and small chops simple and convenient.

Customers can build their order, choose pickup or delivery, add custom cake details, generate an order receipt, and continue the conversation on WhatsApp for confirmation.

## Features

- 🍰 **Custom cake ordering**
  - Choose from multiple cake sizes
  - Select a flavour for each cake
  - Add individual design notes for every cake
- 🥟 **Small chops ordering**
  - Add multiple small chops packs
  - Adjust quantities with simple controls
- 🚚 **Pickup and delivery options**
  - Customers can choose pickup or delivery
  - Delivery addresses are collected when needed
- 💰 **Automatic order totals**
  - Prices update as items are added or removed
  - Delivery fees are confirmed separately on WhatsApp
- 🧾 **Receipt generation**
  - Generates a downloadable PNG order receipt directly in the browser
  - Includes the order reference, items, customer details, and estimated total
- 💬 **WhatsApp ordering flow**
  - Customers can continue directly to WhatsApp after reviewing their order
  - A text-based fallback is available if receipt generation fails
- 📱 **Responsive design**
  - Optimized for mobile and desktop
  - Includes mobile navigation and a mobile order bar
- ♿ **Accessibility considerations**
  - Semantic form controls
  - Keyboard-accessible dialogs
  - Visible focus states
  - Reduced-motion support

## Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) for menu prices and availability

## How Ordering Works

1. Choose **pickup** or **delivery**.
2. Add one or more cakes and/or small chops.
3. Select a flavour and add design notes for each cake.
4. Enter your name, Nigerian phone number, and required date.
5. Review the automatically calculated order total.
6. Generate your order receipt.
7. Save the receipt and continue to WhatsApp.
8. Dee's Treats confirms the final order, payment, and delivery details on WhatsApp.

> The displayed total is an estimate. Final pricing and delivery fees are confirmed by Dee's Treats.

## Project Structure

```text
app/
  layout.tsx          # App layout and metadata
  page.tsx            # Main page
  globals.css         # Global styles and theme

components/
  Header.tsx          # Site header
  Nav.tsx             # Desktop and mobile navigation
  OrderSection.tsx    # Main ordering experience
  PhotosSection.tsx   # Gallery section
  AboutSection.tsx    # About section
  Footer.tsx          # Site footer

lib/
  menu.ts             # Business and menu data
  order.ts            # Order calculations and WhatsApp messages
  receipt.ts          # Browser-based receipt generation
  schedule.ts         # Order date and notice logic
  gallery.ts          # Gallery data

public/
  brand/              # Brand assets
  gallery/            # Food and product images
```

## Supabase Menu Setup

The public menu is loaded from Supabase. If Supabase is unavailable or the environment variables are missing, the website uses the menu defaults in `lib/menu.ts` so customers can still place orders.

Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Use the project URL and publishable key from the Supabase project settings. Never put the service-role key in a `NEXT_PUBLIC_` variable or in frontend code.

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/KHLLD00/Dees-treats.git
```

### 2. Open the project folder

```bash
cd Dees-treats
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Commands

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run start    # Run the production build
npm run lint     # Run ESLint
```

## Updating Business and Menu Information

Business details and cake flavours remain in `lib/menu.ts`. Menu prices and item availability are read from the Supabase `cake_sizes` and `small_chops` tables. The values in `lib/menu.ts` are used as a safe fallback if Supabase cannot be reached.

This includes:

- Business name and contact details
- WhatsApp number
- Cake sizes and prices
- Available cake flavours
- Small chops items and prices

When updating prices or menu items, review the ordering flow afterwards to ensure the displayed totals and receipt details remain correct.

## Phone Number Validation

The order form accepts common Nigerian mobile number formats, including:

```text
08012345678
08112345678
07012345678
09012345678

+2348012345678
2348012345678
```

Spaces and hyphens are also accepted.

## Future Improvements

Potential future improvements include:

- Order storage and management
- Admin dashboard for orders and menu updates
- Order status tracking
- Automated customer notifications
- Online payment integration
- Enhanced SEO and local business discovery

These are future possibilities and are not required for the current WhatsApp-based ordering workflow.

---

Built for **Dee's Treats** 🍰
