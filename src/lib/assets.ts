const BUCKET = "appscreens-7d372.appspot.com";

/**
 * Captured layouts reference artwork and app screens by their storage path.
 * The reference serves both publicly (and with `access-control-allow-origin: *`,
 * so drawing them keeps the export canvas untainted).
 */
export function assetUrl(id: string | null | undefined): string | null {
  if (!id) return null;
  if (/^(https?:|data:|blob:)/.test(id)) return id;
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(
    id,
  )}?alt=media`;
}

/** Every remote image one screen needs, in load order. */
export function screenAssetUrls(screen: {
  backgroundImage?: string;
  groups: {
    asset?: string | null;
    device?: { screenshot?: string };
  }[][];
}): string[] {
  const out: string[] = [];
  const push = (id: string | null | undefined) => {
    const url = assetUrl(id);
    if (url && !out.includes(url)) out.push(url);
  };
  push(screen.backgroundImage);
  for (const group of screen.groups) {
    for (const el of group) {
      push(el.asset);
      push(el.device?.screenshot);
    }
  }
  return out;
}
