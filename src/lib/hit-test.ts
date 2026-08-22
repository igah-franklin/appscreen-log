import type { ApiElement, ApiScreen } from "./api";

export type ElementRef = { g: number; i: number; el: ApiElement };

/** Fractional bounds of an element, clamped for hit-testing. */
export function boundsOf(el: ApiElement) {
  return { x: el.loc.x, y: el.loc.y, w: el.loc.w, h: el.loc.h };
}

/**
 * Finds the topmost element under a point given in 0..1 screen fractions.
 * Later layer groups paint over earlier ones, so they are searched first.
 */
export function hitTest(
  screen: ApiScreen,
  fx: number,
  fy: number,
): ElementRef | null {
  for (let g = screen.groups.length - 1; g >= 0; g -= 1) {
    const group = screen.groups[g];
    for (let i = group.length - 1; i >= 0; i -= 1) {
      const el = group[i];
      if (el.type === "spacer") continue;
      const b = boundsOf(el);
      if (fx >= b.x && fx <= b.x + b.w && fy >= b.y && fy <= b.y + b.h) {
        return { g, i, el };
      }
    }
  }
  return null;
}

export const elementKey = (g: number, i: number) => `${g}-${i}`;
