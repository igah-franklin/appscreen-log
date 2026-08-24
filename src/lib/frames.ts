import { API_BASE } from "./api";
import { loadImage } from "./render";

/**
 * Photographic device frames.
 *
 * The reference composites a real device PNG per output size — the frame has a
 * transparent screen cutout, so the app screen is drawn into the cutout and the
 * frame laid over the top. The files come through the API's `/api/frames`
 * proxy, which adds the CORS header the originals lack so the export canvas
 * stays untainted.
 */

/**
 * Output size → the reference's own frame folder.
 *
 * The four the reference was observed loading directly are marked; the rest are
 * matched on the shape of the frame's screen cutout, which has to agree with
 * the store size or the app screen is cropped into the wrong body. Cutout
 * aspects, measured from the frames themselves:
 *
 *   iosphone 0.5625 · iosphonex 0.4636 · iosphone61 0.4597
 *   iosphone67island / iosphone67noisland 0.4597
 *   iostab 0.7513 · iostabx 0.7495 · ioswatchultra 0.8294
 *   iosmacos / appletv 1.7774 · andgals25 0.4618 · andgaltabs8 0.6244
 *
 * Android is the exception: the reference uses the Galaxy bodies for the 16:9
 * exports even though their cutouts are taller, so those follow observation
 * rather than aspect.
 */
const FRAME_FOR_OUTPUT: Record<string, string> = {
  "iphone-4-7": "iosphone", //          750×1334  0.5622
  "iphone-5-5": "iosphone", //         1242×2208  0.5625
  "iphone-5-8": "iosphonex", //        1125×2436  0.4618
  "iphone-6-1": "iosphone61", //       1179×2556  0.4613
  "iphone-6-3": "iosphone67noisland", //1206×2622 0.4600
  "iphone-6-5": "iosphonex", //        1242×2688  0.4621
  "iphone-6-9": "iosphone67island", // observed
  "ipad-pro-12-9": "iostab", //        2048×2732  0.7496
  "ipad-13": "iostabx", // observed
  "android-phone-16-9": "andgals25", // observed
  "android-tablet-7-16-9": "andgaltabs8",
  "android-tablet-10-16-9": "andgaltabs8", // observed
  "apple-watch": "ioswatchultra", //     410×502  0.8167
  macos: "iosmacos", //                2880×1800  1.6000
  "apple-tv": "appletv", //            3840×2160  1.7778
};

/** Colours the reference ships a frame for. */
const FRAME_COLOURS = new Set([
  "black", "dark", "space", "silver", "light", "reallight",
  "gold", "realgold", "rose", "coral", "green", "earth", "strawberry",
]);

/** Only these variants exist as photographs; `dynamic` and `none` are drawn. */
const FRAME_VARIANTS = new Set(["full", "warpleft", "warpright"]);

export type DeviceFrame = {
  image: HTMLImageElement;
  /** Natural size of the frame image, the space `path` is drawn in. */
  size: { w: number; h: number };
  /** Screen cutout bounds, in frame-image pixels. */
  screen: { x: number; y: number; w: number; h: number };
  /** The cutout's exact outline, in frame-image pixels. */
  path: Path2D;
};

const cache = new Map<string, Promise<DeviceFrame | null>>();

export function frameUrl(
  outputId: string,
  variant = "full",
  colour = "black",
): string | null {
  const device = FRAME_FOR_OUTPUT[outputId];
  if (!device) return null;
  const v = FRAME_VARIANTS.has(variant) ? variant : "full";
  const c = FRAME_COLOURS.has(colour) ? colour : "black";
  return `${API_BASE}/api/frames/${v}/${device}/${c}.png`;
}

/**
 * Loads a frame and traces its screen cutout.
 *
 * The PNG is a device on a transparent background, so the transparent pixels
 * *outside* the body look exactly like the screen cutout — scanning inward
 * from the edges finds nothing, and the cutout's bounding-box corners land
 * outside the body, where the image is transparent too. So instead of fitting
 * a corner radius, this traces the cutout row by row and keeps the outline as
 * a path: the screen is then clipped to its real rounded shape.
 *
 * Each row is measured from two reference columns a quarter of the way in from
 * each side. Those sit inside the screen but clear of the side buttons and of
 * a notch or Dynamic Island, which are opaque and sit *within* the screen area
 * and would otherwise cut the row short.
 */
export function loadFrame(url: string): Promise<DeviceFrame | null> {
  const existing = cache.get(url);
  if (existing) return existing;

  const task = (async (): Promise<DeviceFrame | null> => {
    let image: HTMLImageElement;
    try {
      image = await loadImage(url);
    } catch {
      return null;
    }

    const w = image.naturalWidth;
    const h = image.naturalHeight;
    if (!w || !h) return null;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(image, 0, 0);

    const OPAQUE = 8;
    const { data } = ctx.getImageData(0, 0, w, h);
    const clear = (x: number, y: number) => data[(y * w + x) * 4 + 3] <= OPAQUE;

    const cx = w >> 1;
    const cy = h >> 1;
    if (!clear(cx, cy)) return null;

    let left = cx;
    while (left > 0 && clear(left - 1, cy)) left -= 1;
    let right = cx;
    while (right < w - 1 && clear(right + 1, cy)) right += 1;

    const leftRef = Math.floor(left + (right - left) * 0.25);
    const rightRef = Math.floor(right - (right - left) * 0.25);

    let top = cy;
    while (top > 0 && clear(leftRef, top - 1)) top -= 1;
    let bottom = cy;
    while (bottom < h - 1 && clear(leftRef, bottom + 1)) bottom += 1;

    const sw = right - left + 1;
    const sh = bottom - top + 1;
    if (sw < w * 0.2 || sh < h * 0.2) return null;

    /* Trace the outline: left edge down one side, right edge back up. */
    const step = Math.max(1, Math.round(sh / 600));
    const lefts: [number, number][] = [];
    const rights: [number, number][] = [];
    for (let y = top; y <= bottom; y += step) {
      if (!clear(leftRef, y) || !clear(rightRef, y)) continue;
      let x = leftRef;
      while (x > 0 && clear(x - 1, y)) x -= 1;
      lefts.push([x, y]);
      let x2 = rightRef;
      while (x2 < w - 1 && clear(x2 + 1, y)) x2 += 1;
      rights.push([x2 + 1, y]);
    }
    if (lefts.length < 2) return null;

    const path = new Path2D();
    path.moveTo(lefts[0][0], lefts[0][1]);
    for (const [x, y] of lefts) path.lineTo(x, y);
    for (let i = rights.length - 1; i >= 0; i -= 1) {
      path.lineTo(rights[i][0], rights[i][1]);
    }
    path.closePath();

    return {
      image,
      size: { w, h },
      screen: { x: left, y: top, w: sw, h: sh },
      path,
    };
  })();

  cache.set(url, task);
  return task;
}

/** Frames a screen already has loaded, for synchronous drawing. */
const ready = new Map<string, DeviceFrame>();

export function readyFrame(url: string | null): DeviceFrame | undefined {
  return url ? ready.get(url) : undefined;
}

export async function warmFrame(url: string | null) {
  if (!url || ready.has(url)) return;
  const frame = await loadFrame(url);
  if (frame) ready.set(url, frame);
}
