export type OutputSize = {
  id: string;
  label: string;
  store: "Android" | "Apple" | "Custom";
  width: number;
  height: number;
  /** Device frame used when previewing this output. */
  frame: "android" | "iphone" | "ipad" | "watch" | "desktop" | "none";
  note?: string;
};

/** Export presets offered by the reference editor's "Output Sizes" dialog. */
export const OUTPUT_SIZES: OutputSize[] = [
  {
    id: "android-phone-16-9",
    label: 'Android Phones - 16:9',
    store: "Android",
    width: 2160,
    height: 3840,
    frame: "android",
    note: 'Display: Samsung Galaxy S25 - 6.2" devices',
  },
  {
    id: "android-tablet-7-16-9",
    label: 'Android 7" Tablets - 16:9',
    store: "Android",
    width: 2160,
    height: 3840,
    frame: "ipad",
    note: 'Display: Samsung Galaxy Tab S8 Ultra - 14.6" devices',
  },
  {
    id: "android-tablet-10-16-9",
    label: 'Android 10" Tablets - 16:9',
    store: "Android",
    width: 2160,
    height: 3840,
    frame: "ipad",
    note: 'Display: Samsung Galaxy Tab S8 Ultra - 14.6" devices',
  },
  {
    id: "apple-watch",
    label: "Apple Watch",
    store: "Apple",
    width: 410,
    height: 502,
    frame: "watch",
    note: "Display: Apple Watch Ultra devices",
  },
  {
    id: "iphone-4-7",
    label: 'iPhones - 4.7"',
    store: "Apple",
    width: 750,
    height: 1334,
    frame: "iphone",
    note: "Display: iPhone SE devices",
  },
  {
    id: "iphone-5-5",
    label: 'iPhones - 5.5"',
    store: "Apple",
    width: 1242,
    height: 2208,
    frame: "iphone",
  },
  {
    id: "iphone-5-8",
    label: 'iPhones - 5.8"',
    store: "Apple",
    width: 1125,
    height: 2436,
    frame: "iphone",
  },
  {
    id: "iphone-6-1",
    label: 'iPhones - 6.1"',
    store: "Apple",
    width: 1179,
    height: 2556,
    frame: "iphone",
  },
  {
    id: "iphone-6-3",
    label: 'iPhones - 6.3"',
    store: "Apple",
    width: 1206,
    height: 2622,
    frame: "iphone",
    note: 'Display: iPhones - 6.3" (No Island) devices',
  },
  {
    id: "iphone-6-5",
    label: 'iPhones - 6.5" (1242 × 2688px)',
    store: "Apple",
    width: 1242,
    height: 2688,
    frame: "iphone",
    note: 'Display: iPhone 11 Pro Max / XS Max - 6.5" devices (1242 × 2688px)',
  },
  {
    id: "iphone-6-9",
    label: 'iPhones - 6.9"',
    store: "Apple",
    width: 1320,
    height: 2868,
    frame: "iphone",
    note: 'Display: iPhones - 6.9" (No Island) devices',
  },
  {
    id: "ipad-pro-12-9",
    label: 'iPad Pro (2nd) - 12.9"',
    store: "Apple",
    width: 2048,
    height: 2732,
    frame: "ipad",
  },
  {
    id: "ipad-13",
    label: 'iPad - 13"',
    store: "Apple",
    width: 2064,
    height: 2752,
    frame: "ipad",
  },
  {
    id: "macos",
    label: "Mac OS",
    store: "Apple",
    width: 2880,
    height: 1800,
    frame: "desktop",
    note: "Display: Mac Studio Display devices",
  },
  {
    id: "apple-tv",
    label: "Apple TV",
    store: "Apple",
    width: 3840,
    height: 2160,
    frame: "none",
  },
  {
    id: "apple-vision-pro",
    label: "Apple Vision Pro",
    store: "Apple",
    width: 3840,
    height: 2160,
    frame: "none",
    note: "Display: Apple Vision Pro (frameless) devices",
  },
  {
    id: "google-feature-graphic",
    label: "Google Play Feature Graphic",
    store: "Android",
    width: 1024,
    height: 500,
    frame: "none",
  },
];

export const OUTPUT_BY_ID = new Map(OUTPUT_SIZES.map((o) => [o.id, o]));

/**
 * The order the reference lists sizes in: Apple phones smallest-first, then
 * iPads, then Android phones and tablets, then the one-off surfaces.
 */
const OUTPUT_ORDER = [
  "iphone-4-7",
  "iphone-5-5",
  "iphone-5-8",
  "iphone-6-1",
  "iphone-6-3",
  "iphone-6-5",
  "iphone-6-9",
  "ipad-pro-12-9",
  "ipad-13",
  "android-phone-16-9",
  "android-tablet-7-16-9",
  "android-tablet-10-16-9",
  "apple-watch",
  "macos",
  "apple-tv",
  "apple-vision-pro",
  "google-feature-graphic",
];

/** Sorts a set of output ids into the reference's menu order. */
export function orderOutputs(ids: string[]): string[] {
  const rank = (id: string) => {
    const i = OUTPUT_ORDER.indexOf(id);
    return i === -1 ? OUTPUT_ORDER.length : i;
  };
  return [...new Set(ids)].sort((a, b) => rank(a) - rank(b));
}

export const DEFAULT_OUTPUTS = [
  "iphone-6-5",
  "iphone-6-9",
  "ipad-13",
  "android-phone-16-9",
  "android-tablet-10-16-9",
];

/** Geometry for the drawn device frames, expressed as fractions of frame width. */
export const FRAME_SPECS = {
  iphone: { radius: 0.13, bezel: 0.028, notch: true, aspect: 2868 / 1320 },
  android: { radius: 0.09, bezel: 0.024, notch: false, aspect: 3840 / 2160 },
  ipad: { radius: 0.05, bezel: 0.035, notch: false, aspect: 2752 / 2064 },
  watch: { radius: 0.28, bezel: 0.06, notch: false, aspect: 502 / 410 },
  desktop: { radius: 0.02, bezel: 0.02, notch: false, aspect: 1800 / 2880 },
} as const;

export type FrameKind = keyof typeof FRAME_SPECS | "none";
