import { FRAME_SPECS, type OutputSize } from "./devices";
import type { Screen } from "./editor-model";

/**
 * Draws one screen at full output resolution onto a canvas. The on-screen
 * preview and the exported PNG both go through here, so what you see in the
 * editor is what lands in the file.
 */
export async function drawScreen(
  ctx: CanvasRenderingContext2D,
  screen: Screen,
  output: OutputSize,
  images: Map<string, HTMLImageElement>,
) {
  const W = output.width;
  const H = output.height;

  ctx.clearRect(0, 0, W, H);

  // ---- background -------------------------------------------------------
  const bg = screen.background;
  if (bg.style === "solid") {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, W, H);
  } else if (bg.style === "gradient") {
    const rad = (bg.angle * Math.PI) / 180;
    const cx = W / 2;
    const cy = H / 2;
    const len = Math.abs(W * Math.sin(rad)) + Math.abs(H * Math.cos(rad));
    const dx = (Math.sin(rad) * len) / 2;
    const dy = (-Math.cos(rad) * len) / 2;
    const g = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
    g.addColorStop(0, bg.color);
    g.addColorStop(1, bg.color2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
  }

  if (bg.image) {
    const img = images.get(bg.image);
    if (img) drawCover(ctx, img, 0, 0, W, H);
  }

  const showDevice = screen.layout !== "blank" && output.frame !== "none";
  const showText = screen.layout !== "device-only";

  // ---- title ------------------------------------------------------------
  const pad = W * 0.08;
  const titleScale = W / 1320; // sizes are authored against a 6.9" iPhone
  let textBottom = pad;
  let textTop = pad;

  if (showText) {
    const t = screen.title;
    const fontSize = t.size * titleScale;
    const lineHeight = fontSize * 1.18;
    const maxWidth = W - pad * 2;

    ctx.font = fontSpec(t, fontSize);
    const lines = wrapText(ctx, t.text, maxWidth);
    const subLines = t.showSubtitle
      ? (() => {
          ctx.font = fontSpec(
            { ...t, bold: false, weight: 400 },
            fontSize * 0.46,
          );
          return wrapText(ctx, t.subtitle, maxWidth);
        })()
      : [];

    const blockHeight =
      lines.length * lineHeight +
      (subLines.length ? fontSize * 0.4 + subLines.length * fontSize * 0.6 : 0);

    let y: number;
    if (screen.layout === "text-below") {
      y = H - pad - blockHeight;
    } else if (t.position === "middle") {
      y = (H - blockHeight) / 2;
    } else if (t.position === "bottom") {
      y = H - pad - blockHeight;
    } else {
      y = pad * 1.15;
    }

    textTop = y;
    textBottom = y + blockHeight;

    ctx.fillStyle = t.color;
    ctx.textBaseline = "top";
    ctx.textAlign = t.align;
    const x = t.align === "center" ? W / 2 : t.align === "right" ? W - pad : pad;

    ctx.font = fontSpec(t, fontSize);
    lines.forEach((line, i) => {
      const ly = y + i * lineHeight;
      ctx.fillText(line, x, ly);
      if (t.underline) {
        const w = ctx.measureText(line).width;
        const ux =
          t.align === "center" ? x - w / 2 : t.align === "right" ? x - w : x;
        ctx.fillRect(ux, ly + fontSize * 1.02, w, Math.max(2, fontSize * 0.05));
      }
    });

    if (subLines.length) {
      ctx.font = fontSpec({ ...t, bold: false, weight: 400 }, fontSize * 0.46);
      ctx.globalAlpha = 0.85;
      subLines.forEach((line, i) => {
        ctx.fillText(
          line,
          x,
          y + lines.length * lineHeight + fontSize * 0.4 + i * fontSize * 0.6,
        );
      });
      ctx.globalAlpha = 1;
    }
  }

  // ---- device -----------------------------------------------------------
  if (showDevice) {
    const spec = FRAME_SPECS[output.frame as keyof typeof FRAME_SPECS];
    const available =
      screen.layout === "text-below"
        ? { top: pad * 0.6, bottom: textTop - pad * 0.4 }
        : showText
          ? { top: textBottom + pad * 0.5, bottom: H + H * 0.06 }
          : { top: pad, bottom: H - pad };

    const regionH = Math.max(available.bottom - available.top, H * 0.3);
    const byHeight = regionH / spec.aspect;
    const byWidth = W * 0.94;
    let frameW = Math.min(byHeight, byWidth) * screen.device.scale * 1.06;
    frameW = Math.max(frameW, W * 0.25);
    const frameH = frameW * spec.aspect;

    const fx = (W - frameW) / 2;
    const fy =
      available.top +
      (regionH - frameH) / 2 +
      (screen.device.offsetY / 100) * H;

    const img = screen.device.screenshot
      ? images.get(screen.device.screenshot)
      : undefined;
    drawDeviceFrame(ctx, fx, fy, frameW, frameH, output.frame, img, screen.device.shadow);
  }
}

function fontSpec(
  t: { bold: boolean; italic: boolean; weight: number; font: string },
  size: number,
) {
  const style = t.italic ? "italic " : "";
  const weight = t.bold ? 700 : t.weight;
  return `${style}${weight} ${size}px "${t.font}", sans-serif`;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const out: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      out.push("");
      continue;
    }
    let line = words[0];
    for (let i = 1; i < words.length; i += 1) {
      const next = `${line} ${words[i]}`;
      if (ctx.measureText(next).width > maxWidth) {
        out.push(line);
        line = words[i];
      } else {
        line = next;
      }
    }
    out.push(line);
  }
  return out;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
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

function drawDeviceFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  kind: string,
  img: HTMLImageElement | undefined,
  shadow: boolean,
) {
  const spec = FRAME_SPECS[kind as keyof typeof FRAME_SPECS];
  if (!spec) return;
  const radius = w * spec.radius;
  const bezel = w * spec.bezel;
  const body = "#121216";

  const isPhoneOrTablet = kind === "iphone" || kind === "android" || kind === "ipad";

  if (isPhoneOrTablet) {
    /* 1. Hardware side buttons */
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
  if (shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.32)";
    ctx.shadowBlur = w * 0.095;
    ctx.shadowOffsetY = w * 0.035;
  }
  ctx.fillStyle = body;
  roundRect(ctx, x, y, w, h, radius);
  ctx.fill();
  ctx.restore();

  /* 3. Outer Metallic Rim Highlight */
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = Math.max(1, w * 0.005);
  roundRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, radius);
  ctx.stroke();
  ctx.restore();

  /* 4. Top Speaker Earphone Slit */
  if (isPhoneOrTablet) {
    ctx.save();
    const spW = w * 0.12;
    const spH = Math.max(1.5, w * 0.006);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    roundRect(ctx, x + (w - spW) / 2, y + bezel * 0.35, spW, spH, spH / 2);
    ctx.fill();
    ctx.restore();
  }

  // screen well
  const sx = x + bezel;
  const sy = y + bezel;
  const sw = w - bezel * 2;
  const sh = h - bezel * 2;
  const sr = Math.max(radius - bezel, 3);

  ctx.save();
  roundRect(ctx, sx, sy, sw, sh, sr);
  ctx.clip();
  if (img) {
    drawCover(ctx, img, sx, sy, sw, sh);
  } else {
    drawPlaceholderUi(ctx, sx, sy, sw, sh);
  }

  /* Home Bar Indicator */
  if (kind === "iphone" || kind === "ipad") {
    const hw = sw * 0.35;
    const hh = Math.max(3, sw * 0.012);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    roundRect(ctx, sx + (sw - hw) / 2, sy + sh - sw * 0.032, hw, hh, hh / 2);
    ctx.fill();
  }

  ctx.restore();

  // Dynamic Island / Camera Notch
  if (spec.notch) {
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
  } else if (kind === "android") {
    // Android Punch-hole Camera
    ctx.save();
    ctx.beginPath();
    ctx.arc(sx + sw / 2, sy + sw * 0.038, sw * 0.02, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.restore();
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

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
