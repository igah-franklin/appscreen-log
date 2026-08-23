import type { ApiElement, ApiScreen, ApiText, ApiTextRun } from "./api";
import type { OutputSize } from "./devices";
import { FRAME_SPECS } from "./devices";
import { assetUrl } from "./assets";
import { gradientAngle, gradientStops, isGradient } from "./gradient";

/**
 * Renders a captured template layout. Every element is positioned as a
 * fraction of the screen, so one layout renders correctly at any store size.
 */
export async function drawLayeredScreen(
  ctx: CanvasRenderingContext2D,
  screen: ApiScreen,
  project: {
    background?: string;
    primaryColor?: string;
    titleFont?: string;
    subtitleFont?: string;
  },
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
  const full = { x: 0, y: 0, w: W, h: H };
  if (style !== "none" && bg) {
    /* A captured background is a colour or a whole CSS gradient string; the
       editor's own gradient mode instead pairs two colours with an angle. */
    if (isGradient(bg)) {
      ctx.fillStyle = cssGradient(ctx, bg, full);
    } else if (style === "gradient") {
      ctx.fillStyle = linearGradient(ctx, screen.backgroundAngle ?? 160, full, [
        bg,
        screen.backgroundColor2 ?? bg,
      ]);
    } else {
      ctx.fillStyle = bg;
    }
    ctx.fillRect(0, 0, W, H);
  }

  if (screen.backgroundImage) {
    const img = lookup(images, screen.backgroundImage);
    if (img) {
      drawFitted(ctx, img, { x: 0, y: 0, w: W, h: H }, screen.backgroundFit ?? "cover", "center");
    }
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
      if (typeof el.opacity === "number" && el.opacity < 1) {
        ctx.globalAlpha = Math.max(0, el.opacity);
      }
      if (el.shadow) {
        /* Shadow offsets and blur are authored as fractions of the box. */
        ctx.shadowColor = el.shadow.color;
        ctx.shadowBlur = el.shadow.blur * box.w;
        ctx.shadowOffsetX = el.shadow.x * box.w;
        ctx.shadowOffsetY = el.shadow.y * box.h;
      }

      if (el.type === "title") {
        if (el.decoration && decorationKind(el.decoration) !== "none") {
          drawDecorationShape(
            ctx,
            el.decoration,
            box,
            el.decorationColor ?? el.title?.color ?? accent,
            el.decorationStrokeWidth,
          );
        }
        const inset = decorationInset(el.decoration, box);
        drawTitle(
          ctx,
          el,
          { ...box, x: box.x + inset, w: box.w - inset * 2 },
          W,
          H,
          project.titleFont,
          project.subtitleFont,
        );
      } else if (el.type === "image") {
        drawDecoration(ctx, el, box, accent, images);
      } else if (el.type === "device") {
        drawDevice(ctx, el, box, output, images);
      } else if (el.type === "shape") {
        drawShape(ctx, el, box, W);
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
/** Reference ids and the older human labels both map onto one shape name. */
function decorationKind(kind: string) {
  return kind
    .replace(/\s*-\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/ (.)/g, (_, c: string) => c.toUpperCase());
}

/**
 * Caption decorations.
 *
 * The reference draws these from its own vector set; these are rebuilt to the
 * same silhouettes so a captured caption keeps the shape it was authored with.
 */
function drawDecorationShape(
  ctx: CanvasRenderingContext2D,
  rawKind: string,
  box: { x: number; y: number; w: number; h: number },
  color: string,
  strokeWidth?: number,
) {
  const kind = decorationKind(rawKind);
  if (kind === "none") return;

  ctx.save();
  ctx.fillStyle = tint(color, 0.18);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, box.h * (strokeWidth || 0.02));
  const { x, y, w, h } = box;

  if (kind.startsWith("laurel")) {
    drawLaurel(ctx, kind, box, color);
  } else if (kind === "rectangle" || kind === "square") {
    ctx.fillRect(x, y, w, h);
  } else if (kind === "roundedRectangle" || kind === "roundedSquare") {
    roundRect(ctx, x, y, w, h, Math.min(w, h) * 0.16);
    ctx.fill();
  } else if (kind === "oval" || kind === "circle") {
    ctx.beginPath();
    if (kind === "circle") {
      ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
    } else {
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    }
    ctx.fill();
  } else if (kind === "badge") {
    roundRect(ctx, x, y, w, h, h / 2);
    ctx.fill();
  } else if (kind === "underline") {
    const lw = Math.max(2, h * 0.06);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.04, y + h - lw);
    ctx.quadraticCurveTo(x + w / 2, y + h - lw * 2.4, x + w * 0.96, y + h - lw);
    ctx.stroke();
  } else if (kind === "cloud") {
    ctx.beginPath();
    const r = h * 0.42;
    ctx.moveTo(x + r, y + h - r * 0.6);
    for (let i = 0; i <= 4; i += 1) {
      const cx = x + w * (0.16 + i * 0.17);
      const cy = y + h * (i % 2 ? 0.38 : 0.52);
      ctx.arc(cx, cy, r * (i % 2 ? 0.95 : 0.75), 0, Math.PI * 2);
    }
    ctx.fill();
  } else if (kind.startsWith("comment") || kind.startsWith("chatBubble")) {
    const left = kind.endsWith("Left");
    const r = kind.startsWith("chat") ? h * 0.32 : h * 0.14;
    roundRect(ctx, x, y, w, h * 0.86, r);
    ctx.fill();
    ctx.beginPath();
    const tx = left ? x + w * 0.18 : x + w * 0.72;
    ctx.moveTo(tx, y + h * 0.86);
    ctx.lineTo(tx + w * 0.06, y + h * 0.86);
    ctx.lineTo(left ? tx - w * 0.02 : tx + w * 0.12, y + h);
    ctx.closePath();
    ctx.fill();
  } else if (kind === "starBackground") {
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

/**
 * A pair of laurel branches flanking the caption.
 *
 * Variants differ in how far the branches sit from the text and how tightly
 * the leaves are packed: "compact" hugs the caption, "wide"/"wider" pushes the
 * branches outwards.
 */
function drawLaurel(
  ctx: CanvasRenderingContext2D,
  kind: string,
  box: { x: number; y: number; w: number; h: number },
  color: string,
) {
  const spread = kind.includes("Wider") ? 0.5 : kind.includes("Wide") ? 0.47 : 0.44;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const height = box.h * (kind.includes("Compact") ? 0.86 : 1);
  const half = height / 2;
  const leaves = 8;

  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";

  for (const dir of [-1, 1]) {
    /* Stem: bottom to top, bowing away from the caption. */
    const stemX = cx + dir * box.w * spread;
    const bow = height * 0.16;
    ctx.beginPath();
    ctx.lineWidth = Math.max(1.5, height * 0.045);
    ctx.moveTo(stemX, cy + half);
    ctx.quadraticCurveTo(stemX + dir * bow, cy, stemX, cy - half);
    ctx.stroke();

    for (let i = 0; i < leaves; i += 1) {
      const t = (i + 0.5) / leaves;
      /* Point on the quadratic stem. */
      const u = 1 - t;
      const px = u * u * stemX + 2 * u * t * (stemX + dir * bow) + t * t * stemX;
      const py = u * u * (cy + half) + 2 * u * t * cy + t * t * (cy - half);

      /* Leaves are longest mid-branch and always point up and outward. */
      const len = height * 0.26 * (0.55 + 0.45 * Math.sin(Math.PI * t));
      /* Leaves fan upward and away from the caption, tightening at the tip. */
      const angle = -dir * (Math.PI / 2) + dir * (0.9 - 0.55 * t);

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(len * 0.55, 0, len * 0.55, len * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

/** Horizontal room a decoration needs on each side of the caption. */
function decorationInset(rawKind: string | undefined, box: { w: number }) {
  if (!rawKind) return 0;
  const kind = decorationKind(rawKind);
  if (kind.startsWith("laurel")) return box.w * 0.16;
  if (kind === "badge" || kind === "roundedRectangle" || kind === "rectangle") {
    return box.w * 0.04;
  }
  return 0;
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

/**
 * A CSS gradient string as a canvas gradient across `box`.
 *
 * Angles run clockwise from "to top" in CSS; canvas wants two points, so the
 * angle becomes a line through the box centre.
 */
function cssGradient(
  ctx: CanvasRenderingContext2D,
  value: string,
  box: { x: number; y: number; w: number; h: number },
): CanvasGradient | string {
  const stops = gradientStops(value);
  if (stops.length < 2) return stops[0]?.color ?? "#ffffff";

  const rad = ((gradientAngle(value) - 90) * Math.PI) / 180;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const len = (Math.abs(box.w * Math.cos(rad)) + Math.abs(box.h * Math.sin(rad))) / 2;
  const g = ctx.createLinearGradient(
    cx - Math.cos(rad) * len,
    cy - Math.sin(rad) * len,
    cx + Math.cos(rad) * len,
    cy + Math.sin(rad) * len,
  );
  stops.forEach((s, i) =>
    g.addColorStop(Math.min(1, Math.max(0, s.at ?? i / (stops.length - 1))), s.color),
  );
  return g;
}

function paint(
  ctx: CanvasRenderingContext2D,
  t: ApiText,
  box: { x: number; y: number; w: number; h: number },
) {
  if (t.gradient) return cssGradient(ctx, t.gradient, box);
  if (t.color && isGradient(t.color)) return cssGradient(ctx, t.color, box);
  return t.color || "#111827";
}

/** A caption line broken into its styled runs, ready to measure and paint. */
type LaidLine = { runs: ApiTextRun[]; align: "left" | "center" | "right" };

/** Explicit authored lines when present, otherwise the wrapped plain text. */
function layout(
  ctx: CanvasRenderingContext2D,
  t: ApiText,
  maxWidth: number,
): LaidLine[] {
  const fallbackAlign = t.align ?? "left";
  if (t.lines?.length) {
    const out: LaidLine[] = [];
    for (const line of t.lines) {
      const align = (line.align ?? fallbackAlign) as LaidLine["align"];
      /* An authored line still wraps if it cannot fit the box. */
      for (const runs of wrapRuns(ctx, line.runs, maxWidth)) {
        out.push({ runs, align });
      }
    }
    return out;
  }
  return wrap(ctx, t.text, maxWidth).map((text) => ({
    runs: [{ text }],
    align: fallbackAlign,
  }));
}

/** Greedy word wrap that keeps each word's own run styling. */
function wrapRuns(
  ctx: CanvasRenderingContext2D,
  runs: ApiTextRun[],
  maxWidth: number,
): ApiTextRun[][] {
  const words: ApiTextRun[] = [];
  for (const run of runs) {
    const parts = run.text.split(/(\s+)/).filter((p) => p !== "");
    for (const part of parts) words.push({ ...run, text: part });
  }
  const lines: ApiTextRun[][] = [];
  let line: ApiTextRun[] = [];
  let width = 0;
  for (const word of words) {
    const w = measureRun(ctx, word);
    if (line.length && width + w > maxWidth && word.text.trim()) {
      lines.push(line);
      line = [];
      width = 0;
      if (!word.text.trim()) continue;
    }
    line.push(word);
    width += w;
  }
  if (line.length) lines.push(line);
  return lines.length ? lines : [[]];
}

function measureRun(ctx: CanvasRenderingContext2D, run: ApiTextRun) {
  const saved = ctx.font;
  ctx.font = runFont(saved, run);
  const w = ctx.measureText(run.text).width;
  ctx.font = saved;
  return w;
}

/** Swaps the weight/style of the current font for one run's own. */
function runFont(base: string, run: ApiTextRun) {
  if (!run.bold && !run.italic) return base;
  const match = base.match(/^(italic\s+)?(\d+)\s+(.*)$/);
  if (!match) return base;
  const weight = run.bold ? 700 : Number(match[2]);
  const italic = run.italic || Boolean(match[1]) ? "italic " : "";
  return `${italic}${weight} ${match[3]}`;
}

function lineWidth(ctx: CanvasRenderingContext2D, runs: ApiTextRun[], spacing: number) {
  return runs.reduce(
    (sum, r) => sum + measureRun(ctx, r) + spacing * r.text.length,
    0,
  );
}

/**
 * Paints a caption.
 *
 * Captured layouts carry the authored line breaks, per-line alignment and
 * per-run styling, plus a `maxFontSize` ceiling expressed as a fraction of the
 * screen height — all of which the reference honours, so this does too. Text
 * still shrinks to fit its box when a translation runs long.
 */
function drawTitle(
  ctx: CanvasRenderingContext2D,
  el: ApiElement,
  box: { x: number; y: number; w: number; h: number },
  W: number,
  H: number,
  fallbackFont?: string,
  fallbackSubtitleFont?: string,
) {
  const t = el.title;
  if (!t?.text) return;

  const lineFactor = t.lineHeight && t.lineHeight > 0 ? t.lineHeight * 1.16 : 1.16;
  const ceiling = t.maxFontSize ? H * t.maxFontSize : Infinity;

  const sub = el.subtitle;

  /* Shrink until the caption *and* its subtitle fit the box together. */
  let size = Math.min(box.h * 0.72, ceiling);
  let lines: LaidLine[] = [];
  let subLines: LaidLine[] = [];
  let blockH = 0;
  for (let i = 0; i < 80; i += 1) {
    ctx.font = fontFor(t, fallbackFont, size);
    lines = layout(ctx, t, box.w);

    subLines = [];
    const subSize = size * 0.42;
    if (sub?.text) {
      ctx.font = fontFor(sub, fallbackSubtitleFont ?? fallbackFont, subSize);
      subLines = layout(ctx, sub, box.w);
      ctx.font = fontFor(t, fallbackFont, size);
    }

    blockH =
      lines.length * size * lineFactor +
      (subLines.length ? size * 0.5 + subLines.length * subSize * 1.3 : 0);

    const widthFits = lines.every(
      (l) => lineWidth(ctx, l.runs, size * (t.charSpacing ?? 0)) <= box.w + 0.5,
    );
    if ((blockH <= box.h && widthFits) || size < W * 0.012) break;
    size *= 0.96;
  }

  const spacing = size * (t.charSpacing ?? 0);
  const subSize = size * 0.42;

  const pos = el.position ?? (el.loc.anchor === "middle" ? "center" : "top");
  let y =
    pos === "top"
      ? box.y
      : pos === "bottom"
        ? box.y + box.h - blockH
        : box.y + (box.h - blockH) / 2;

  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  ctx.font = fontFor(t, fallbackFont, size);
  y = drawLines(ctx, lines, t, box, y, size, lineFactor, spacing, fallbackFont);

  if (subLines.length && sub) {
    y += size * 0.5;
    ctx.font = fontFor(sub, fallbackSubtitleFont ?? fallbackFont, subSize);
    drawLines(
      ctx,
      subLines,
      sub,
      box,
      y,
      subSize,
      1.3,
      subSize * (sub.charSpacing ?? 0),
      fallbackSubtitleFont ?? fallbackFont,
    );
  }
}

/** Draws one block of laid-out lines, run by run. Returns the next baseline. */
function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: LaidLine[],
  t: ApiText,
  box: { x: number; y: number; w: number; h: number },
  top: number,
  size: number,
  lineFactor: number,
  spacing: number,
  fallbackFont?: string,
) {
  const base = fontFor(t, fallbackFont, size);
  let y = top;

  for (const line of lines) {
    const width = lineWidth(ctx, line.runs, spacing);
    const startX =
      line.align === "center"
        ? box.x + (box.w - width) / 2
        : line.align === "right"
          ? box.x + box.w - width
          : box.x;

    if (t.background) {
      ctx.save();
      ctx.fillStyle = t.background;
      const pad = size * 0.16;
      roundRect(ctx, startX - pad, y - pad * 0.5, width + pad * 2, size * 1.16 + pad, pad * 0.9);
      ctx.fill();
      ctx.restore();
    }

    let x = startX;
    for (const run of line.runs) {
      ctx.font = runFont(base, run);
      ctx.fillStyle = run.gradient
        ? paint(ctx, { ...t, gradient: run.gradient }, box)
        : run.color ?? paint(ctx, t, box);

      if (spacing) {
        for (const ch of run.text) {
          ctx.fillText(ch, x, y);
          x += ctx.measureText(ch).width + spacing;
        }
      } else {
        ctx.fillText(run.text, x, y);
        x += ctx.measureText(run.text).width;
      }

      if (run.underline || t.underline) {
        const runW = measureRun(ctx, run) + spacing * run.text.length;
        ctx.fillRect(x - runW, y + size * 1.04, runW, Math.max(2, size * 0.055));
      }
    }
    ctx.font = base;
    y += size * lineFactor;
  }
  return y;
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
  /* Real artwork when the slot's asset has loaded, tinted if the layout asks. */
  const art = lookup(images, el.asset) ?? lookup(images, el.device?.screenshot);
  if (art) {
    drawArtwork(
      ctx,
      art,
      box,
      el.fit ?? "contain",
      el.vPos ?? "center",
      el.svgColor,
      el.svgStrokeColor && el.svgStrokeWidth
        ? { color: el.svgStrokeColor, width: el.svgStrokeWidth }
        : undefined,
    );
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

/** Frame body colours, keyed by the reference's own device colour names. */
const FRAME_COLOURS: Record<string, string> = {
  black: "#101014",
  dark: "#1c1c20",
  space: "#2b2b30",
  silver: "#dcdce2",
  light: "#f2f2f5",
  reallight: "#f4f4f7",
  white: "#f8f8fa",
  gold: "#e6d2ad",
  realgold: "#e3cda6",
  rose: "#e8c4bd",
  coral: "#e9a08d",
  strawberry: "#d9536a",
  green: "#a8c9a4",
  earth: "#b09a82",
};

function frameColour(device: ApiElement["device"]) {
  const named = device?.colour && FRAME_COLOURS[device.colour];
  if (named) return named;
  const light =
    device?.style === "real-light" ||
    device?.style === "flat-light" ||
    device?.colour === "white";
  return light ? "#f2f2f5" : "#101014";
}

/**
 * Draws the device element.
 *
 * The reference offers several frame treatments and captured layouts use all
 * of them: `full` is the device body with its bezel, `dynamic` is a thin
 * coloured border of the layout's own choosing, and `none` is a frameless
 * screenshot with just rounded corners.
 */
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

  const variant = el.device?.variant ?? "full";
  const frameless = variant === "none";
  const dynamic = variant === "dynamic";

  /* Fit the device into the element box, preserving the frame's aspect ratio. */
  let w = box.w;
  let h = w * spec.aspect;
  if (h > box.h) {
    h = box.h;
    w = h / spec.aspect;
  }
  const x = box.x + (box.w - w) / 2;
  const y = el.loc.anchor === "middle" ? box.y + (box.h - h) / 2 : box.y;

  const body = frameColour(el.device);
  const isLight =
    el.device?.style === "real-light" ||
    el.device?.style === "flat-light" ||
    el.device?.colour === "white" ||
    el.device?.colour === "silver" ||
    el.device?.colour === "light";

  const bezel = frameless
    ? 0
    : dynamic
      ? w * (el.device?.frameSize ?? 0.02)
      : w * spec.bezel;
  const radius = w * (frameless ? spec.radius * 0.42 : spec.radius);

  if (!frameless && !dynamic) {
    /* 1. Hardware side buttons (Power button right, Volume & Action buttons left) */
    const isPhoneOrTablet = kind === "iphone" || kind === "android" || kind === "ipad";
    const flat = el.device?.style === "flat-dark" || el.device?.style === "flat-light";
    if (isPhoneOrTablet && !flat) {
      ctx.save();
      ctx.fillStyle = body;
      const btnW = Math.max(2, w * 0.014);

      // Right Side Power Button
      const pY = y + h * 0.22;
      const pH = h * 0.11;
      roundRect(ctx, x + w, pY, btnW, pH, btnW / 2);
      ctx.fill();

      // Left Side Action Button
      const aY = y + h * 0.14;
      const aH = h * 0.038;
      roundRect(ctx, x - btnW, aY, btnW, aH, btnW / 2);
      ctx.fill();

      // Left Side Volume Up
      const v1Y = y + h * 0.21;
      const vH = h * 0.065;
      roundRect(ctx, x - btnW, v1Y, btnW, vH, btnW / 2);
      ctx.fill();

      // Left Side Volume Down
      const v2Y = y + h * 0.295;
      roundRect(ctx, x - btnW, v2Y, btnW, vH, btnW / 2);
      ctx.fill();
      ctx.restore();
    }

    /* 2. Device Body with Soft Ambient Shadow */
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.32)";
    ctx.shadowBlur = w * 0.095;
    ctx.shadowOffsetY = w * 0.035;
    ctx.fillStyle = body;
    roundRect(ctx, x, y, w, h, radius);
    ctx.fill();
    ctx.restore();

    /* 3. Outer Metallic Rim Highlight */
    ctx.save();
    ctx.strokeStyle = isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.16)";
    ctx.lineWidth = Math.max(1, w * 0.005);
    roundRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, radius);
    ctx.stroke();
    ctx.restore();

    /* 4. Top Speaker Earphone Slit */
    if (isPhoneOrTablet && !flat) {
      ctx.save();
      const spW = w * 0.12;
      const spH = Math.max(1.5, w * 0.006);
      ctx.fillStyle = isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.2)";
      roundRect(ctx, x + (w - spW) / 2, y + bezel * 0.35, spW, spH, spH / 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (!frameless) {
    /* Dynamic frame */
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = w * 0.08;
    ctx.shadowOffsetY = w * 0.025;
    ctx.fillStyle = el.device?.frameColor ?? body;
    roundRect(ctx, x, y, w, h, radius);
    ctx.fill();
    ctx.restore();
  }

  /* A dynamic frame can sit on a padded plate of its own colour. */
  const pad = dynamic ? w * (el.device?.padding ?? 0) : 0;
  if (pad > 0) {
    ctx.save();
    ctx.fillStyle = el.device?.paddingColor ?? "rgba(255,255,255,0.2)";
    roundRect(ctx, x + bezel, y + bezel, w - bezel * 2, h - bezel * 2, Math.max(radius - bezel, 2));
    ctx.fill();
    ctx.restore();
  }

  /* 5. Screen Well / Screenshot Clipping */
  const inset = bezel + pad;
  const sx = x + inset;
  const sy = y + inset;
  const sw = w - inset * 2;
  const sh = h - inset * 2;
  const sr = Math.max(radius - inset, 3);

  ctx.save();
  roundRect(ctx, sx, sy, sw, sh, sr);
  ctx.clip();
  const img = lookup(images, el.device?.screenshot);
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

  /* 6. Home Bar Indicator (over screenshot near bottom) */
  const flat = el.device?.style === "flat-dark" || el.device?.style === "flat-light";
  if (!frameless && !flat && (kind === "iphone" || kind === "ipad")) {
    const hw = sw * 0.35;
    const hh = Math.max(3, sw * 0.012);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    roundRect(ctx, sx + (sw - hw) / 2, sy + sh - sw * 0.032, hw, hh, hh / 2);
    ctx.fill();
  }

  ctx.restore();

  /* 7. Dynamic Island / Camera Notch (over screen top) */
  if (spec.notch && !frameless && !dynamic && !flat) {
    ctx.save();
    const nw = sw * 0.28;
    const nh = sw * 0.062;
    const nx = sx + (sw - nw) / 2;
    const ny = sy + sw * 0.022;

    // Dynamic Island Pill
    ctx.fillStyle = "#000000";
    roundRect(ctx, nx, ny, nw, nh, nh / 2);
    ctx.fill();

    // Camera Lens Reflection inside Island
    ctx.beginPath();
    ctx.arc(nx + nw * 0.72, ny + nh / 2, nh * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = "#0a0a14";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(nx + nw * 0.72 + nh * 0.05, ny + nh / 2 - nh * 0.05, nh * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = "#1e2238";
    ctx.fill();
    ctx.restore();
  } else if (kind === "android" && !frameless && !dynamic && !flat) {
    // Android Punch-hole Camera
    ctx.save();
    ctx.beginPath();
    ctx.arc(sx + sw / 2, sy + sw * 0.038, sw * 0.02, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.restore();
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

/**
 * Shape layers — rectangles (optionally rounded), ellipses and rules.
 *
 * `cornerRadius` and `strokeWidth` are authored in pixels against the
 * reference's own 1320px-wide canvas, so both scale with the output width.
 */
function drawShape(
  ctx: CanvasRenderingContext2D,
  el: ApiElement,
  box: { x: number; y: number; w: number; h: number },
  W: number,
) {
  const shape = el.shape;
  if (!shape) return;
  const scale = W / 1320;
  const fill = shape.fill
    ? isGradient(shape.fill)
      ? cssGradient(ctx, shape.fill, box)
      : shape.fill
    : null;
  const stroke = shape.stroke
    ? isGradient(shape.stroke)
      ? cssGradient(ctx, shape.stroke, box)
      : shape.stroke
    : null;
  const lineWidth = (shape.strokeWidth ?? 0) * scale;

  ctx.save();
  if (shape.kind === "ellipse" || shape.kind === "circle") {
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
  } else if (shape.kind === "line") {
    const horizontal = (shape.lineDirection ?? "horizontal") === "horizontal";
    ctx.beginPath();
    if (horizontal) {
      const y = box.y + box.h / 2;
      ctx.moveTo(box.x, y);
      ctx.lineTo(box.x + box.w, y);
    } else {
      const x = box.x + box.w / 2;
      ctx.moveTo(x, box.y);
      ctx.lineTo(x, box.y + box.h);
    }
    ctx.strokeStyle = stroke ?? fill ?? "#111827";
    ctx.lineWidth = Math.max(1, lineWidth || box.h);
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();
    return;
  } else {
    roundRect(ctx, box.x, box.y, box.w, box.h, (shape.cornerRadius ?? 0) * scale);
  }

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke && lineWidth > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.restore();
}

/** Image cache lookup that accepts either a storage path or a full URL. */
function lookup(
  images: Map<string, HTMLImageElement>,
  id: string | null | undefined,
): HTMLImageElement | undefined {
  if (!id) return undefined;
  const url = assetUrl(id);
  return (url ? images.get(url) : undefined) ?? images.get(id);
}

/**
 * Draws a decoration asset.
 *
 * The reference's SVG style has two independent parts, both reproduced here:
 * a colour overlay (a flat colour or a gradient, applied by using the artwork
 * as a mask) and a border/stroke drawn around the same silhouette. Stroke
 * width is a fraction of the element's width, as authored.
 */
function drawArtwork(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  box: { x: number; y: number; w: number; h: number },
  fit: "contain" | "cover" | "fill",
  vPos: "top" | "center" | "bottom",
  overlay?: string,
  stroke?: { color: string; width: number },
) {
  if (!overlay && !stroke) {
    drawFitted(ctx, img, box, fit, vPos);
    return;
  }

  const strokePx = stroke ? Math.max(1, stroke.width * box.w) : 0;
  const pad = Math.ceil(strokePx) + 2;
  const w = Math.max(1, Math.ceil(box.w) + pad * 2);
  const h = Math.max(1, Math.ceil(box.h) + pad * 2);
  const inner = { x: pad, y: pad, w: box.w, h: box.h };

  const layer = document.createElement("canvas");
  layer.width = w;
  layer.height = h;
  const lctx = layer.getContext("2d");
  if (!lctx) {
    drawFitted(ctx, img, box, fit, vPos);
    return;
  }

  /* The border: the silhouette dilated by offsetting it around a ring. */
  if (stroke && strokePx > 0) {
    const mask = document.createElement("canvas");
    mask.width = w;
    mask.height = h;
    const mctx = mask.getContext("2d");
    if (mctx) {
      const steps = 16;
      for (let i = 0; i < steps; i += 1) {
        const a = (i / steps) * Math.PI * 2;
        drawFitted(
          mctx,
          img,
          {
            ...inner,
            x: inner.x + Math.cos(a) * strokePx,
            y: inner.y + Math.sin(a) * strokePx,
          },
          fit,
          vPos,
        );
      }
      mctx.globalCompositeOperation = "source-in";
      mctx.fillStyle = isGradient(stroke.color)
        ? cssGradient(mctx, stroke.color, { x: 0, y: 0, w, h })
        : stroke.color;
      mctx.fillRect(0, 0, w, h);
      lctx.drawImage(mask, 0, 0);
    }
  }

  /* The artwork itself, recoloured when an overlay is set. */
  const artwork = document.createElement("canvas");
  artwork.width = w;
  artwork.height = h;
  const actx = artwork.getContext("2d");
  if (!actx) {
    drawFitted(ctx, img, box, fit, vPos);
    return;
  }
  drawFitted(actx, img, inner, fit, vPos);
  if (overlay) {
    actx.globalCompositeOperation = "source-in";
    actx.fillStyle = isGradient(overlay)
      ? cssGradient(actx, overlay, { x: 0, y: 0, w, h })
      : overlay;
    actx.fillRect(0, 0, w, h);
  }
  lctx.drawImage(artwork, 0, 0);

  ctx.drawImage(layer, box.x - pad, box.y - pad);
}
