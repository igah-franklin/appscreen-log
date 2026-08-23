"use client";

import type { ApiProject } from "@/lib/api";
import { FONT_FAMILIES } from "@/lib/design-options";

/**
 * Project-wide styling — the reference's "Globals".
 *
 * Captions that were authored with the "Global" font follow these, so changing
 * them restyles every screen at once.
 */
export function GlobalsDialog({
  project,
  onClose,
  onChange,
}: {
  project: ApiProject;
  onClose: () => void;
  onChange: (patch: Partial<ApiProject>) => void;
}) {
  const field =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none";

  const fontOptions = (current?: string) => {
    const list: string[] = [...FONT_FAMILIES];
    if (current && !list.includes(current)) list.splice(2, 0, current);
    return list;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Globals"
        className="w-full max-w-md rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="m-0 text-lg font-bold text-gray-900">Globals</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4 px-6 pb-6">
          <p className="text-sm text-gray-500">
            Applied across every screenshot. Captions set to the{" "}
            <span className="font-semibold">Global</span> font follow these.
          </p>

          <label className="block text-xs font-semibold text-gray-700">
            Title font
            <select
              className={`${field} mt-1`}
              value={project.titleFont ?? "Geist Sans"}
              onChange={(e) => onChange({ titleFont: e.target.value })}
            >
              {fontOptions(project.titleFont).map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold text-gray-700">
            Subtitle font
            <select
              className={`${field} mt-1`}
              value={project.subtitleFont ?? "Geist Sans"}
              onChange={(e) => onChange({ subtitleFont: e.target.value })}
            >
              {fontOptions(project.subtitleFont).map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block text-xs font-semibold text-gray-700">
              Project background
              <input
                type="color"
                aria-label="Project background"
                value={toHex(project.background)}
                onChange={(e) => onChange({ background: e.target.value })}
                className="mt-1 h-9 w-full cursor-pointer rounded-md border border-gray-300"
              />
            </label>
            <label className="block text-xs font-semibold text-gray-700">
              Accent colour
              <input
                type="color"
                aria-label="Accent colour"
                value={toHex(project.primaryColor)}
                onChange={(e) => onChange({ primaryColor: e.target.value })}
                className="mt-1 h-9 w-full cursor-pointer rounded-md border border-gray-300"
              />
            </label>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** `rgba()` / `#rgb` down to the `#rrggbb` a colour input needs. */
function toHex(value: string | undefined) {
  if (!value) return "#ffffff";
  const rgb = value.match(/rgba?\(([^)]+)\)/);
  if (rgb) {
    const [r, g, b] = rgb[1].split(",").map((n) => Math.round(parseFloat(n)));
    return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  }
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return `#${value
      .slice(1)
      .split("")
      .map((c) => c + c)
      .join("")}`;
  }
  return "#ffffff";
}
