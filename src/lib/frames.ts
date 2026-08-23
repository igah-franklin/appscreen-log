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

/** Output size → the reference's own frame folder, as observed in its sandbox. */
const FRAME_FOR_OUTPUT: Record<string, string> = {
  "iphone-4-7": "iosphone",
  "iphone-5-5": "iosphone",
  "iphone-5-8": "iosphonex",
  "iphone-6-1": "iosphone61",
  "iphone-6-3": "iosphone67noisland",
  "iphone-6-5": "iosphone",
  "iphone-6-9": "iosphone67island",
  "ipad-pro-12-9": "iostab",
  "ipad-13": "iostabx",
  "android-phone-16-9": "andgals25",
  "android-tablet-7-16-9": "andgaltabs8",
  "android-tablet-10-16-9": "andgaltabs8",
  "apple-watch": "ioswatchultra",
  macos: "iosmacos",
  "apple-tv": "appletv",
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
  /** Screen cutout as fractions of the frame image. */
  screen: { x: number; y: number; w: number; h: number };
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
 * Loads a frame and measures its screen cutout.
 *
 * The cutout is the transparent region in the middle of the image; scanning the
 * centre row and column for the transparent run is enough, and far cheaper than
 * walking every pixel of a 1800×3700 frame.
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

    const alphaAt = (data: Uint8ClampedArray, i: number) => data[i * 4 + 3];

    const midRow = ctx.getImageData(0, Math.floor(h / 2), w, 1).data;
    let left = 0;
    while (left < w && alphaAt(midRow, left) > 8) left += 1;
    let right = w - 1;
    while (right > left && alphaAt(midRow, right) > 8) right -= 1;

    const midCol = ctx.getImageData(Math.floor(w / 2), 0, 1, h).data;
    let top = 0;
    while (top < h && alphaAt(midCol, top) > 8) top += 1;
    let bottom = h - 1;
    while (bottom > top && alphaAt(midCol, bottom) > 8) bottom -= 1;

    /* A frame with no transparent interior is unusable as an overlay. */
    if (right - left < w * 0.2 || bottom - top < h * 0.2) return null;

    return {
      image,
      screen: {
        x: left / w,
        y: top / h,
        w: (right - left + 1) / w,
        h: (bottom - top + 1) / h,
      },
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
