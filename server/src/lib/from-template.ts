import type { ScreenLayout } from "../models/layout.js";

type TemplateLike = {
  name: string;
  shots: number;
  orientation?: string[];
  theme?: string[];
  background?: string | null;
  primaryColor?: string | null;
  screens?: ScreenLayout[];
  hasLayout?: boolean;
};

const THEME_BACKDROP: Record<string, string> = {
  light: "rgba(244,242,255,1)",
  dark: "rgba(27,27,34,1)",
  colourful: "rgba(121,85,254,0.18)",
};

/**
 * Produces the screens for a new project. Templates with a captured layout are
 * deep-copied verbatim; the rest fall back to a generated starter layout that
 * still respects the template's palette and shot count.
 */
export function buildScreensFromTemplate(t: TemplateLike): ScreenLayout[] {
  if (t.hasLayout && t.screens?.length) {
    return JSON.parse(JSON.stringify(t.screens)) as ScreenLayout[];
  }

  const theme = t.theme?.[0] ?? "colourful";
  const background = t.background ?? THEME_BACKDROP[theme] ?? THEME_BACKDROP.colourful;
  const accent = t.primaryColor ?? "rgba(121,85,254,1)";
  const orientation: "portrait" | "landscape" = t.orientation?.includes(
    "landscape",
  )
    ? "landscape"
    : "portrait";

  return Array.from({ length: Math.max(t.shots, 1) }, (_, i) => ({
    order: i,
    layout: "Blank",
    orientation,
    background,
    groups: [
      [
        {
          type: "title" as const,
          loc: { w: 0.86, h: 0.2, x: 0.07, y: 0.04, anchor: "middle" as const },
          title: {
            text: `Headline ${i + 1}`,
            color: accent,
            bold: true,
            align: "center" as const,
            lineHeight: 1,
          },
        },
      ],
      [
        {
          type: "device" as const,
          loc: { w: 0.9, h: 0.7, x: 0.05, y: 0.28, anchor: "topLeft" as const },
          device: { variant: "full", colour: "black" },
        },
      ],
    ],
  }));
}
