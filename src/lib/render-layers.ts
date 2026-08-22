import type { ApiElement, ApiScreen, ApiText } from "./api";
import type { OutputSize } from "./devices";
import { FRAME_SPECS } from "./devices";

/**
 * Renders a captured template layout. Every element is positioned as a
 * fraction of the screen, so one layout renders correctly at any store size.
 */
export async function drawLayeredScreen(
  ctx: CanvasRenderingContext2D,
  screen: ApiScreen,
  project: { background?: string; primaryColor?: string; titleFont?: string },
  output: OutputSize,
  images: Map<string, HTMLImageElement>,
) {
  const W = output.width;
  const H = output.height;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  const style = screen.backgroundStyle ?? "solid";
  const bg = screen.background ?? project.background;
  if (style === "gradient") {
    const g = linearGradient(
      ctx,
      screen.backgroundAngle ?? 160,
      { x: 0, y: 0, w: W, h: H },
      [bg ?? "#ffffff", screen.backgroundColor2 ?? "#ffffff"],
    );
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  } else if (style === "solid" && bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
  }

  if (screen.backgroundImage) {
    const img = images.get(screen.backgroundImage);
    if (img) drawFitted(ctx, img, { x: 0, y: 0, w: W, h: H }, "cover", "center");
  }
  if (screen.backgroundPattern && screen.backgroundPattern !== "None") {
    drawPattern(ctx, W, H, screen.backgroundPattern, project.primaryColor ?? "#7c5cff");
  }

  const accent = project.primaryColor ?? "rgba(121,85,254,1)";

  for (const group of screen.groups) {
    for (const el of group) {
      const box = {
        x: el.loc.x * W,
        y: el.loc.y * H,
        w: el.loc.w * W,
        h: el.loc.h * H,
      };
      ctx.save();
      if (el.rot) {
        ctx.translate(box.x + box.w / 2, box.y + box.h / 2);
        ctx.rotate((el.rot * Math.PI) / 180);
        ctx.translate(-(box.x + box.w / 2), -(box.y + box.h / 2));
      }

      if (el.type === "title") {
        if (el.decoration && el.decoration !== "None")
          drawDecorationShape(ctx, el.decoration, box, el.decorationColor ?? accent);
        drawTitle(ctx, el, box, W, project.titleFont);
      } else if (el.type === "image") {
        drawDecoration(ctx, el, box, accent, images);
      } else if (el.type === "device") {
        drawDevice(ctx, el, box, output, images);
      }
      ctx.restore();
    }
  }
}

function fontFor(t: ApiText | undefined, fallback: string | undefined, size: number) {
  const family =
    !t?.font || t.font === "Global" ? fallback || "Geist Sans" : t.font;
  const weight = t?.bold ? 700 : 500;
  const style = t?.italic ? "italic " : "";
  return `${style}${weight} ${size}px "${family}", "Geist Sans", sans-serif`;
}

/** CSS-style angle to a canvas linear gradient across a box. */
function linearGradient(
  ctx: CanvasRenderingContext2D,
  deg: number,
  box: { x: number; y: number; w: number; h: number },
  colors: string[],
) {
  const rad = ((deg - 90) * Math.PI) / 180;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const len = (Math.abs(box.w * Math.cos(rad)) + Math.abs(box.h * Math.sin(rad))) / 2;
  const g = ctx.createLinearGradient(
    cx - Math.cos(rad) * len,
    cy - Math.sin(rad) * len,
    cx + Math.cos(rad) * len,
    cy + Math.sin(rad) * len,
  );
  colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
  return g;
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  pattern: string,
  accent: string,
) {
  ctx.save();
  ctx.strokeStyle = tint(accent, 0.18);
  ctx.fillStyle = tint(accent, 0.18);
  const step = W / 18;
  if (pattern === "Dots") {
    for (let x = step / 2; x < W; x += step)
      for (let y = step / 2; y < H; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, step * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
  } else if (pattern === "Grid") {
    ctx.lineWidth = Math.max(1, W * 0.002);
    for (let x = 0; x < W; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  } else if (pattern === "Diagonal Lines") {
    ctx.lineWidth = Math.max(1, W * 0.004);
    for (let x = -H; x < W; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + H, H);
      ctx.stroke();
    }
  } else if (pattern === "Waves") {
    ctx.lineWidth = Math.max(1, W * 0.004);
    for (let y = step; y < H; y += step) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += W / 60) {
        const py = y + Math.sin((x / W) * Math.PI * 6) * step * 0.25;
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** Shape drawn behind a caption, per the Decoration dropdown. */
function drawDecorationShape(
  ctx: CanvasRenderingContext2D,
  kind: string,
  box: { x: number; y: number; w: number; h: number },
  color: string,
) {
  ctx.save();
  ctx.fillStyle = tint(color, 0.18);
  ctx.strokeStyle = tint(color, 0.9);
  ctx.lineWidth = Math.max(2, box.h * 0.02);
  const { x, y, w, h } = box;

  if (kind.startsWith("Laurel")) {
    ctx.beginPath();
    const r = Math.min(w, h) * 0.46;
    const cx = x + w / 2;
    const cy = y + h / 2;
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(cx + dir * w * 0.34, cy, r, dir === -1 ? -1.2 : Math.PI - 1.9, dir === -1 ? 1.2 : Math.PI + 1.9);
      ctx.stroke();
    }
  } else if (kind === "Rectangle" || kind === "Square") {
    ctx.fillRect(x, y, w, h);
  } else if (kind === "Rounded Rectangle" || kind === "Rounded Square") {
    roundRect(ctx, x, y, w, h, Math.min(w, h) * 0.16);
    ctx.fill();
  } else if (kind === "Oval" || kind === "Circle") {
    ctx.beginPath();
    const r = kind === "Circle" ? Math.min(w, h) / 2 : 0;
    if (r) ctx.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2);
    else ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "Badge") {
    roundRect(ctx, x, y, w, h, h / 2);
    ctx.fill();
  } else if (kind.startsWith("Comment") || kind.startsWith("Chat Bubble")) {
    const left = kind.endsWith("Left");
    const r = kind.startsWith("Chat") ? h * 0.32 : h * 0.14;
    roundRect(ctx, x, y, w, h * 0.86, r);
    ctx.fill();
    ctx.beginPath();
    const tx = left ? x + w * 0.18 : x + w * 0.72;
    ctx.moveTo(tx, y + h * 0.86);
    ctx.lineTo(tx + w * 0.06, y + h * 0.86);
    ctx.lineTo(left ? tx - w * 0.02 : tx + w * 0.12, y + h);
    ctx.closePath();
    ctx.fill();
  } else if (kind === "Star Background") {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const R = Math.min(w, h) * 0.62;
    ctx.beginPath();
    for (let i = 0; i < 20; i += 1) {
      const a = (i * Math.PI) / 10 - Math.PI / 2;
      const rr = i % 2 ? R * 0.55 : R;
      const px = cx + Math.cos(a) * rr;
      const py = cy + Math.sin(a) * rr * (h / Math.min(w, h)) * 0.6;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** Draws an image into a box honouring Fit and Vertical position. */
function drawFitted(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  box: { x: number; y: number; w: number; h: number },
  fit: "contain" | "cover" | "fill",
  vPos: "top" | "center" | "bottom",
) {
  if (fit === "fill") {
    ctx.drawImage(img, box.x, box.y, box.w, box.h);
    return;
  }
  const scale =
    fit === "cover"
      ? Math.max(box.w / img.naturalWidth, box.h / img.naturalHeight)
      : Math.min(box.w / img.naturalWidth, box.h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = box.x + (box.w - dw) / 2;
  const dy =
    vPos === "top" ? box.y : vPos === "bottom" ? box.y + box.h - dh : box.y + (box.h - dh) / 2;
  ctx.save();
  roundRect(ctx, box.x, box.y, box.w, box.h, 0);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function paint(
  ctx: CanvasRenderingContext2D,
  t: ApiText,
  box: { x: number; y: number; w: number; h: number },
) {
  if (t.gradient) {
    const stops = [
      ...t.gradient.matchAll(
        /(rgba?\([^)]*\)|#[0-9a-f]{3,8})\s*(\d+(?:\.\d+)?)?%?/gi,
      ),
    ].map((m) => ({ color: m[1], at: m[2] ? Number(m[2]) / 100 : null }));

    if (stops.length >= 2) {
      // CSS gradient angles run clockwise from "to top"; canvas wants points.
      const deg = Number(t.gradient.match(/(-?\d+(?:\.\d+)?)deg/)?.[1] ?? 180);
      const rad = ((deg - 90) * Math.PI) / 180;
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      const len =
        (Math.abs(box.w * Math.cos(rad)) + Math.abs(box.h * Math.sin(rad))) / 2;
      const g = ctx.createLinearGradient(
        cx - Math.cos(rad) * len,
        cy - Math.sin(rad) * len,
        cx + Math.cos(rad) * len,
        cy + Math.sin(rad) * len,
      );
      stops.forEach((s, i) =>
        g.addColorStop(
          Math.min(1, Math.max(0, s.at ?? i / (stops.length - 1))),
          s.color,
        ),
      );
      return g;
    }
  }
  return t.color || "#111827";
}

function drawTitle(
  ctx: CanvasRenderingContext2D,
  el: ApiElement,
  box: { x: number; y: number; w: number; h: number },
  W: number,
  fallbackFont?: string,
) {
  const t = el.title;
  if (!t?.text) return;

  // Fit the headline to its box: start large and shrink until it fits.
  let size = box.h * 0.42;
  let lines: string[] = [];
  const lineFactor = t.lineHeight && t.lineHeight > 0 ? t.lineHeight * 1.16 : 1.16;
  for (let i = 0; i < 40; i += 1) {
    ctx.font = fontFor(t, fallbackFont, size);
    lines = wrap(ctx, t.text, box.w);
    if (lines.length * size * lineFactor <= box.h || size < W * 0.02) break;
    size *= 0.94;
  }

  const subSize = size * 0.42;
  const sub = el.subtitle?.text ? wrapWith(ctx, el.subtitle, fallbackFont, subSize, box.w) : [];
  const blockH =
    lines.length * size * lineFactor +
    (sub.length ? size * 0.5 + sub.length * subSize * 1.3 : 0);

  const align = t.align ?? "left";
  const x = align === "center" ? box.x + box.w / 2 : align === "right" ? box.x + box.w : box.x;
  const pos = el.position ?? (el.loc.anchor === "middle" ? "center" : "top");
  let y =
    pos === "top"
      ? box.y
      : pos === "bottom"
        ? box.y + box.h - blockH
        : box.y + (box.h - blockH) / 2;

  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.font = fontFor(t, fallbackFont, size);

  if (t.background) {
    ctx.save();
    ctx.fillStyle = t.background;
    for (let i = 0; i < lines.length; i += 1) {
      const lw = ctx.measureText(lines[i]).width;
      const lx = align === "center" ? x - lw / 2 : align === "right" ? x - lw : x;
      const ly = y + i * size * lineFactor;
      const pad = size * 0.16;
      roundRect(ctx, lx - pad, ly - pad * 0.5, lw + pad * 2, size * 1.16 + pad, pad * 0.9);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.fillStyle = paint(ctx, t, box);
  for (const line of lines) {
    ctx.fillText(line, x, y);
    if (t.underline) {
      const lw = ctx.measureText(line).width;
      const ux = align === "center" ? x - lw / 2 : align === "right" ? x - lw : x;
      ctx.fillRect(ux, y + size * 1.04, lw, Math.max(2, size * 0.055));
    }
    y += size * lineFactor;
  }

  if (sub.length && el.subtitle) {
    y += size * 0.5;
    ctx.font = fontFor(el.subtitle, fallbackFont, subSize);
    ctx.fillStyle = paint(ctx, el.subtitle, box);
    for (const line of sub) {
      ctx.fillText(line, x, y);
      y += subSize * 1.3;
    }
  }
}

function wrapWith(
  ctx: CanvasRenderingContext2D,
  t: ApiText,
  fallbackFont: string | undefined,
  size: number,
  maxWidth: number,
) {
  ctx.font = fontFor(t, fallbackFont, size);
  return wrap(ctx, t.text, maxWidth);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const out: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) continue;
    let line = words[0];
    for (let i = 1; i < words.length; i += 1) {
      const next = `${line} ${words[i]}`;
      if (ctx.measureText(next).width > maxWidth) {
        out.push(line);
        line = words[i];
      } else line = next;
    }
    out.push(line);
  }
  return out;
}

/**
 * Decorative slots. The reference's artwork stays on its own servers, so each
 * slot renders a tinted placeholder in the template's accent colour; users can
 * drop their own artwork into the slot from the Decoration panel.
 */
function drawDecoration(
  ctx: CanvasRenderingContext2D,
  el: ApiElement,
  box: { x: number; y: number; w: number; h: number },
  accent: string,
  images: Map<string, HTMLImageElement>,
) {
  const custom = el.device?.screenshot ?? undefined;
  if (custom && images.has(custom)) {
    drawFitted(ctx, images.get(custom)!, box, el.fit ?? "contain", el.vPos ?? "center");
    return;
  }

  const shapeColor = el.svgColor ?? accent;
  // Full-bleed slots sit behind everything, so keep them faint enough that
  // captions authored against the real artwork stay legible.
  const bleed = el.loc.w >= 0.95 || el.loc.h >= 0.95;
  ctx.fillStyle = tint(shapeColor, bleed ? 0.08 : 0.16);
  ctx.strokeStyle = tint(shapeColor, 0.55);

  switch (el.assetShape) {
    case "blob": {
      ctx.beginPath();
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      const rx = box.w / 2;
      const ry = box.h / 2;
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 24) {
        const wob = 1 + 0.12 * Math.sin(a * 3) + 0.07 * Math.cos(a * 5);
        const px = cx + Math.cos(a) * rx * wob;
        const py = cy + Math.sin(a) * ry * wob;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "sparkle": {
      const n = 3;
      for (let i = 0; i < n; i += 1) {
        const s = box.w * (i === 0 ? 0.34 : 0.2);
        const cx = box.x + box.w * (0.2 + i * 0.32);
        const cy = box.y + box.h * (i % 2 ? 0.7 : 0.32);
        ctx.beginPath();
        ctx.moveTo(cx, cy - s / 2);
        ctx.quadraticCurveTo(cx, cy, cx + s / 2, cy);
        ctx.quadraticCurveTo(cx, cy, cx, cy + s / 2);
        ctx.quadraticCurveTo(cx, cy, cx - s / 2, cy);
        ctx.quadraticCurveTo(cx, cy, cx, cy - s / 2);
        ctx.closePath();
        ctx.fillStyle = tint(shapeColor, 0.9);
        ctx.fill();
      }
      break;
    }
    case "wave": {
      ctx.beginPath();
      ctx.lineWidth = Math.max(2, box.h * 0.3);
      ctx.lineCap = "round";
      const steps = 24;
      for (let i = 0; i <= steps; i += 1) {
        const px = box.x + (box.w * i) / steps;
        const py = box.y + box.h / 2 + Math.sin((i / steps) * Math.PI * 4) * box.h * 0.35;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = tint(shapeColor, 0.9);
      ctx.stroke();
      break;
    }
    default: {
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.ellipse(
        box.x + box.w / 2,
        box.y + box.h / 2,
        box.w / 2,
        box.h / 2,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}

function tint(color: string, alpha: number) {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const [r, g, b] = m[1].split(",").map((n) => parseFloat(n));
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
}

function drawDevice(
  ctx: CanvasRenderingContext2D,
  el: ApiElement,
  box: { x: number; y: number; w: number; h: number },
  output: OutputSize,
  images: Map<string, HTMLImageElement>,
) {
  const kind = output.frame === "none" ? "iphone" : output.frame;
  const spec = FRAME_SPECS[kind as keyof typeof FRAME_SPECS];
  if (!spec) return;

  // Fit the device into the element box, preserving the frame's aspect ratio.
  let w = box.w;
  let h = w * spec.aspect;
  if (h > box.h) {
    h = box.h;
    w = h / spec.aspect;
  }
  const x = box.x + (box.w - w) / 2;
  const y = el.loc.anchor === "middle" ? box.y + (box.h - h) / 2 : box.y;

  const radius = w * spec.radius;
  const bezel = w * spec.bezel;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = w * 0.08;
  ctx.shadowOffsetY = w * 0.025;
  const light =
    el.device?.style === "real-light" || el.device?.style === "flat-light" ||
    el.device?.colour === "white";
  ctx.fillStyle = light ? "#f2f2f5" : "#101014";
  roundRect(ctx, x, y, w, h, radius);
  ctx.fill();
  ctx.restore();

  const sx = x + bezel;
  const sy = y + bezel;
  const sw = w - bezel * 2;
  const sh = h - bezel * 2;

  ctx.save();
  roundRect(ctx, sx, sy, sw, sh, Math.max(radius - bezel, 2));
  ctx.clip();
  const shot = el.device?.screenshot;
  const img = shot ? images.get(shot) : undefined;
  if (img) {
    drawFitted(
      ctx,
      img,
      { x: sx, y: sy, w: sw, h: sh },
      el.fit ?? "cover",
      el.vPos ?? "center",
    );
  } else {
    drawPlaceholderUi(ctx, sx, sy, sw, sh);
  }
  ctx.restore();

  if (spec.notch && el.device?.style !== "flat-dark" && el.device?.style !== "flat-light") {
    const nw = sw * 0.34;
    const nh = sw * 0.085;
    ctx.fillStyle = light ? "#f2f2f5" : "#101014";
    roundRect(ctx, sx + (sw - nw) / 2, sy + nh * 0.35, nw, nh, nh / 2);
    ctx.fill();
  }
}

/** Neutral app-screen stand-in, matching the reference's placeholder look. */
function drawPlaceholderUi(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.fillStyle = "#f7f7fa";
  ctx.fillRect(x, y, w, h);

  const pad = w * 0.06;
  ctx.fillStyle = "#e6e6ee";
  ctx.beginPath();
  ctx.arc(x + pad + w * 0.04, y + h * 0.075, w * 0.04, 0, Math.PI * 2);
  ctx.fill();
  roundRect(ctx, x + pad + w * 0.11, y + h * 0.055, w * 0.62, h * 0.04, h * 0.02);
  ctx.fill();

  for (let i = 0; i < 6; i += 1) {
    const cy = y + h * (0.13 + i * 0.028);
    ctx.beginPath();
    ctx.arc(x + pad + w * 0.06 + i * w * 0.14, cy, w * 0.045, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 6; i += 1) {
    const ry = y + h * (0.28 + i * 0.1);
    ctx.beginPath();
    ctx.arc(x + pad + w * 0.06, ry, w * 0.055, 0, Math.PI * 2);
    ctx.fill();
    roundRect(ctx, x + pad + w * 0.17, ry - h * 0.022, w * 0.5, h * 0.018, h * 0.01);
    ctx.fill();
    roundRect(ctx, x + pad + w * 0.17, ry + h * 0.005, w * 0.62, h * 0.018, h * 0.01);
    ctx.fill();
  }

  ctx.fillStyle = "#ededf4";
  ctx.fillRect(x, y + h * 0.93, w, h * 0.07);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
