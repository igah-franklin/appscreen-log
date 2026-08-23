/**
 * CSS gradient strings.
 *
 * Captured designs store a background or caption fill as a whole CSS gradient
 * (`linear-gradient(90deg, rgba(…) 0%, rgba(…) 100%)`). The renderer needs its
 * stops, and the edit panels need to take it apart and put it back together so
 * a captured gradient stays editable.
 */

export type GradientStop = { color: string; at: number | null };

export type SimpleGradient = { from: string; to: string; angle: number };

const COLOR = /(rgba?\([^)]*\)|#[0-9a-f]{3,8})\s*(\d+(?:\.\d+)?)?%?/gi;

/** True for a value stored as a whole CSS gradient rather than a colour. */
export function isGradient(value: string | undefined | null): value is string {
  return typeof value === "string" && /^\s*(linear|radial|conic)-gradient\(/i.test(value);
}

export function gradientStops(value: string): GradientStop[] {
  return [...value.matchAll(COLOR)].map((m) => ({
    color: m[1],
    at: m[2] ? Number(m[2]) / 100 : null,
  }));
}

export function gradientAngle(value: string): number {
  return Number(value.match(/(-?\d+(?:\.\d+)?)deg/)?.[1] ?? 180);
}

/** The first and last stop plus the angle — what the panels expose. */
export function parseGradient(value: string | undefined | null): SimpleGradient | null {
  if (!isGradient(value)) return null;
  const stops = gradientStops(value);
  if (stops.length < 2) return null;
  return {
    from: stops[0].color,
    to: stops[stops.length - 1].color,
    angle: gradientAngle(value),
  };
}

export function buildGradient({ from, to, angle }: SimpleGradient) {
  return `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;
}
