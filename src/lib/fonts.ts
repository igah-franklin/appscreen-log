/**
 * Web-font loading for the canvas renderer.
 *
 * Captured layouts name the Google font each caption was authored in, so the
 * designer has to have that face available before it measures or paints text —
 * canvas silently falls back to the default family otherwise, which changes
 * both the look and the line wrapping.
 */

/** Faces the reference hosts itself rather than pulling from Google. */
const SELF_HOSTED = new Set(["Geist Sans", "Geist Mono", "Global"]);

const requested = new Set<string>();
const loaded = new Map<string, Promise<void>>();

function familyId(family: string) {
  return family.trim().replace(/\s+/g, "+");
}

/** Adds the stylesheet for a family once per document. */
function injectStylesheet(family: string) {
  if (typeof document === "undefined") return;
  const id = `gf-${familyId(family)}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${familyId(
    family,
  )}:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,700&display=swap`;
  document.head.appendChild(link);
}

/**
 * Ensures a family is ready to paint. Resolves even when the face cannot be
 * fetched, so one missing font never blocks a render.
 */
export function ensureFont(family: string | undefined | null): Promise<void> {
  if (!family || SELF_HOSTED.has(family)) return Promise.resolve();
  const existing = loaded.get(family);
  if (existing) return existing;

  requested.add(family);
  injectStylesheet(family);

  const task = (async () => {
    if (typeof document === "undefined" || !document.fonts) return;
    const weights = ["400", "500", "600", "700", "800"];
    await Promise.all(
      weights.map((w) =>
        document.fonts.load(`${w} 32px "${family}"`).catch(() => undefined),
      ),
    );
    await document.fonts.ready.catch(() => undefined);
  })();

  loaded.set(family, task);
  return task;
}

/** Ensures every family a screen references, in parallel. */
export function ensureFonts(families: (string | undefined | null)[]) {
  return Promise.all(families.map(ensureFont)).then(() => undefined);
}

/** The families one screen's captions need. */
export function screenFonts(
  screen: { groups: { title?: { font?: string }; subtitle?: { font?: string } }[][] },
  ...fallbacks: (string | undefined | null)[]
): string[] {
  const out = new Set<string>();
  for (const f of fallbacks) if (f) out.add(f);
  for (const group of screen.groups) {
    for (const el of group) {
      if (el.title?.font) out.add(el.title.font);
      if (el.subtitle?.font) out.add(el.subtitle.font);
    }
  }
  return [...out];
}
