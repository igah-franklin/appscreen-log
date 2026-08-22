/**
 * Captured layouts record the reference's own target ids; the editor works in
 * export-preset ids. Anything unrecognised falls back to the defaults.
 */
const TARGET_TO_OUTPUT: Record<string, string> = {
  andgenericphone: "android-phone-16-9",
  andgenerictablet7: "android-tablet-7-16-9",
  andgenerictablet10: "android-tablet-10-16-9",
  andfeaturegraphic: "google-feature-graphic",
  iosphone55: "iphone-5-5",
  iosphone61: "iphone-6-1",
  iosphone63: "iphone-6-3",
  iosphone65: "iphone-6-5",
  iosphone67: "iphone-6-9",
  iosphone69: "iphone-6-9",
  iostab: "ipad-pro-12-9",
  iostabx: "ipad-13",
  ioswatch: "apple-watch",
  macos: "macos",
  appletv: "apple-tv",
  visionpro: "apple-vision-pro",
};

export const DEFAULT_OUTPUTS = [
  "android-phone-16-9",
  "android-tablet-10-16-9",
  "iphone-6-9",
  "ipad-13",
];

/** Phones first, then tablets/desktop — the order the designer presents. */
const PRIORITY = [
  "iphone-6-9",
  "iphone-6-5",
  "iphone-6-3",
  "iphone-6-1",
  "iphone-5-5",
  "android-phone-16-9",
  "ipad-13",
  "ipad-pro-12-9",
  "android-tablet-10-16-9",
  "android-tablet-7-16-9",
  "apple-watch",
  "macos",
  "apple-tv",
  "apple-vision-pro",
  "google-feature-graphic",
];

export function mapTargets(targets: string[] | undefined): string[] {
  const mapped = (targets ?? [])
    .map((t) => TARGET_TO_OUTPUT[t])
    .filter((v): v is string => Boolean(v));
  if (!mapped.length) return [...DEFAULT_OUTPUTS];
  const rank = (id: string) => {
    const i = PRIORITY.indexOf(id);
    return i === -1 ? PRIORITY.length : i;
  };
  return [...new Set(mapped)].sort((a, b) => rank(a) - rank(b));
}
