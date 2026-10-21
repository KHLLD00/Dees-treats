import { BUSINESS, formatNaira } from "./menu";
import { orderTotal, receiptLines, type Order } from "./order";
import { formatDate } from "./schedule";

// Browser only: draws the receipt on a canvas and returns it as a PNG.
// No library needed, so there is nothing extra to install.

const WIDTH = 760;
const PAD = 48;
const SCALE = 2;
const BAND = 20;

const COLOR = {
  cherry: "#b8153f",
  plum: "#42102c",
  apricot: "#ffc46b",
  muted: "rgba(66, 16, 44, 0.72)",
  rule: "rgba(66, 16, 44, 0.4)",
};

type Fonts = { display: string; body: string };

export function makeOrderRef() {
  const now = new Date();
  const day = `${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  // No 0, O, 1, I or L, so a ref is easy to read out over the phone
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (const byte of crypto.getRandomValues(new Uint8Array(4))) code += alphabet[byte % alphabet.length];
  return `DT-${day}-${code}`;
}

function fontFamily(variable: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value ? `${value}, ${fallback}` : fallback;
}

async function loadLogo() {
  try {
    const img = new Image();
    img.src = "/brand/logo-mark.webp";
    await img.decode();
    return img;
  } catch {
    return null;
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const out: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const test = line ? `${line} ${word}` : word;
      if (!line || ctx.measureText(test).width <= maxWidth) line = test;
      else {
        out.push(line);
        line = word;
      }
    }
    out.push(line);
  }
  return out;
}

function gingham(ctx: CanvasRenderingContext2D, y: number) {
  ctx.fillStyle = "rgba(184, 21, 63, 0.55)";
  for (let x = 0; x < WIDTH; x += BAND) ctx.fillRect(x, y, BAND / 2, BAND);
  ctx.fillRect(0, y, WIDTH, BAND / 2);
}

function dotted(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number) {
  if (x2 <= x1) return;
  ctx.save();
  ctx.strokeStyle = COLOR.rule;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.setLineDash([0.1, 6]);
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.restore();
}

// Draws the whole receipt and returns the height it needs.
function draw(
  ctx: CanvasRenderingContext2D,
  order: Order,
  ref: string,
  when: string,
  fonts: Fonts,
  logo: HTMLImageElement | null,
) {
  const delivery = order.fulfilment === "delivery";
  const innerWidth = WIDTH - PAD * 2;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, 6000);
  gingham(ctx, 0);

  let y = BAND + 40;
  ctx.textBaseline = "alphabetic";

  if (logo) {
    const w = 130;
    const h = (w * logo.naturalHeight) / logo.naturalWidth;
    ctx.drawImage(logo, PAD, y, w, h);
    y += h + 58;
  }

  ctx.textAlign = "left";
  ctx.fillStyle = COLOR.plum;
  ctx.font = `900 42px ${fonts.display}`;
  ctx.fillText("Order receipt", PAD, y);
  y += 44;

  const row = (label: string, value: string) => {
    ctx.font = `500 21px ${fonts.body}`;
    ctx.fillStyle = COLOR.muted;
    ctx.textAlign = "left";
    ctx.fillText(label, PAD, y);
    ctx.font = `600 22px ${fonts.body}`;
    ctx.fillStyle = COLOR.plum;
    ctx.textAlign = "right";
    const lines = wrap(ctx, value, innerWidth - 170);
    lines.forEach((line, i) => ctx.fillText(line, WIDTH - PAD, y + i * 30));
    y += Math.max(1, lines.length) * 30 + 6;
  };

  row("Order ref", ref);
  row("Date", when);

  const divider = () => {
    y += 8;
    ctx.save();
    ctx.strokeStyle = COLOR.rule;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(PAD, y);
    ctx.lineTo(WIDTH - PAD, y);
    ctx.stroke();
    ctx.restore();
    y += 38;
  };

  divider();

  ctx.textAlign = "left";
  ctx.fillStyle = COLOR.plum;
  ctx.font = `700 28px ${fonts.display}`;
  ctx.fillText("Your order", PAD, y);
  y += 20;

  for (const item of receiptLines(order)) {
    y += 30;
    const price = formatNaira(item.price);
    ctx.font = `700 26px ${fonts.display}`;
    const priceWidth = ctx.measureText(price).width;
    ctx.font = `600 23px ${fonts.body}`;
    const lines = wrap(ctx, item.label, innerWidth - priceWidth - 40);
    ctx.textAlign = "left";
    ctx.fillStyle = COLOR.plum;
    lines.forEach((line, i) => ctx.fillText(line, PAD, y + i * 30));
    const lastY = y + (lines.length - 1) * 30;
    const lastWidth = ctx.measureText(lines[lines.length - 1]).width;
    dotted(ctx, PAD + lastWidth + 14, WIDTH - PAD - priceWidth - 14, lastY - 6);
    ctx.font = `700 26px ${fonts.display}`;
    ctx.fillStyle = COLOR.cherry;
    ctx.textAlign = "right";
    ctx.fillText(price, WIDTH - PAD, lastY);
    y = lastY;

    if (item.note) {
      ctx.textAlign = "left";
      ctx.font = `400 20px ${fonts.body}`;
      ctx.fillStyle = COLOR.muted;
      const noteLines = wrap(ctx, `Design notes: ${item.note}`, innerWidth - 24);
      noteLines.forEach((line, i) => ctx.fillText(line, PAD + 24, y + 28 + i * 26));
      y += 28 + (noteLines.length - 1) * 26;
    }
  }

  const noteBlock = (title: string, text: string) => {
    y += 44;
    ctx.textAlign = "left";
    ctx.font = `500 21px ${fonts.body}`;
    ctx.fillStyle = COLOR.muted;
    ctx.fillText(title, PAD, y);
    ctx.font = `400 22px ${fonts.body}`;
    ctx.fillStyle = COLOR.plum;
    const lines = wrap(ctx, text, innerWidth);
    lines.forEach((line, i) => ctx.fillText(line, PAD, y + 32 + i * 30));
    y += 32 + (lines.length - 1) * 30;
  };
  if (order.notes.trim()) noteBlock("Notes", order.notes.trim());

  y += 14;
  divider();

  row(delivery ? "Delivery to" : "Pickup", delivery ? order.address.trim() : "Arranged with us on WhatsApp");
  row("Needed by", formatDate(order.date));
  row("Name", order.name.trim());
  row("Phone", order.phone.trim());

  y += 14;
  ctx.fillStyle = COLOR.apricot;
  ctx.beginPath();
  ctx.roundRect(PAD, y, innerWidth, 84, 14);
  ctx.fill();
  ctx.fillStyle = COLOR.plum;
  ctx.textAlign = "left";
  ctx.font = `900 28px ${fonts.display}`;
  ctx.fillText("Estimated total", PAD + 24, y + 52);
  ctx.textAlign = "right";
  ctx.font = `900 36px ${fonts.display}`;
  ctx.fillText(formatNaira(orderTotal(order)), WIDTH - PAD - 24, y + 54);
  y += 84 + 34;

  ctx.textAlign = "left";
  ctx.fillStyle = COLOR.muted;
  ctx.font = `400 20px ${fonts.body}`;
  const note = `This is an estimate. We confirm the final price${delivery ? ", the delivery fee" : ""} and payment with you on WhatsApp.`;
  const noteLines = wrap(ctx, note, innerWidth);
  noteLines.forEach((line, i) => ctx.fillText(line, PAD, y + i * 28));
  y += noteLines.length * 28 + 14;

  ctx.fillStyle = COLOR.plum;
  ctx.font = `600 21px ${fonts.body}`;
  ctx.fillText(`${BUSINESS.name}, ${BUSINESS.phone}`, PAD, y);
  y += 34;

  gingham(ctx, y);
  return y + BAND;
}

export async function createReceipt(order: Order, ref: string): Promise<{ blob: Blob; url: string } | null> {
  try {
    const fonts: Fonts = {
      display: fontFamily("--font-fraunces", "Georgia, serif"),
      body: fontFamily("--font-figtree", "system-ui, sans-serif"),
    };
    try {
      await Promise.all([
        document.fonts.load(`900 40px ${fonts.display}`),
        document.fonts.load(`700 26px ${fonts.display}`),
        document.fonts.load(`400 22px ${fonts.body}`),
        document.fonts.load(`500 22px ${fonts.body}`),
        document.fonts.load(`600 22px ${fonts.body}`),
      ]);
    } catch {
      // Fall back to whatever is available; the receipt still has all its content
    }
    const logo = await loadLogo();
    const when = new Date().toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // First pass measures the height, second pass draws on a canvas of exactly that size
    const probe = document.createElement("canvas");
    probe.width = WIDTH;
    probe.height = 6000;
    const height = draw(probe.getContext("2d")!, order, ref, when, fonts, logo);

    const canvas = document.createElement("canvas");
    canvas.width = WIDTH * SCALE;
    canvas.height = Math.ceil(height) * SCALE;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(SCALE, SCALE);
    draw(ctx, order, ref, when, fonts, logo);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    return blob ? { blob, url: URL.createObjectURL(blob) } : null;
  } catch {
    return null;
  }
}
