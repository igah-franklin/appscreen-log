"use client";

import { useRef } from "react";
import type { ApiElement, ApiProject, ApiScreen, ApiText } from "@/lib/api";
import {
  BACKGROUND_PATTERNS,
  DECORATIONS,
  DEVICE_STYLES,
  DEVICE_TYPES,
  FITS,
  FLOATING_POSITIONS,
  FONT_FAMILIES,
  MATCH_TEXT_SIZE,
  ORIENTATIONS,
  VERTICAL_POSITIONS,
} from "@/lib/design-options";

export const field =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>
      {children}
    </label>
  );
}

export function toHex(color?: string | null) {
  if (!color) return "#ffffff";
  if (color.startsWith("#")) return color.slice(0, 7);
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return "#ffffff";
  const [r, g, b] = m[1].split(",").map((n) => Math.round(parseFloat(n)));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function readFile(file: File, cb: (data: string) => void) {
  const fr = new FileReader();
  fr.onload = () => cb(String(fr.result));
  fr.readAsDataURL(file);
}

/* ------------------------------------------------------------------ Title */

const QUILL_BUTTONS = [
  { key: "bold", label: "Bold", glyph: "B", cls: "font-bold" },
  { key: "italic", label: "Italic", glyph: "I", cls: "italic" },
  { key: "underline", label: "Underline", glyph: "U", cls: "underline" },
] as const;

export function TitleSection({
  el,
  patch,
}: {
  el: ApiElement;
  patch: (fn: (el: ApiElement) => ApiElement) => void;
}) {
  const t = el.title ?? ({ text: "" } as ApiText);
  const setTitle = (p: Partial<ApiText>) =>
    patch((x) => ({ ...x, title: { ...x.title!, ...p } }));

  return (
    <>
      <div className="mb-3 grid grid-cols-2 gap-3">
        <Labeled label="Include Subtitle">
          <select
            className={field}
            value={el.subtitle ? "Yes" : "No"}
            onChange={(e) =>
              patch((x) => ({
                ...x,
                subtitle:
                  e.target.value === "Yes"
                    ? (x.subtitle ?? { text: "Add a supporting line", align: t.align })
                    : undefined,
              }))
            }
          >
            <option>Yes</option>
            <option>No</option>
          </select>
        </Labeled>
        <Labeled label="Floating position">
          <select
            className={field}
            value={
              (el.position ?? "center") === "center"
                ? "Middle"
                : el.position === "top"
                  ? "Top"
                  : "Bottom"
            }
            onChange={(e) =>
              patch((x) => ({
                ...x,
                position:
                  e.target.value === "Middle"
                    ? "center"
                    : e.target.value === "Top"
                      ? "top"
                      : "bottom",
              }))
            }
          >
            {FLOATING_POSITIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Labeled>
      </div>

      <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-gray-300 bg-gray-50 px-2 py-1.5">
        {QUILL_BUTTONS.map((b) => (
          <button
            key={b.key}
            type="button"
            aria-label={b.label}
            aria-pressed={Boolean(t[b.key])}
            onClick={() => setTitle({ [b.key]: !t[b.key] } as Partial<ApiText>)}
            className={`h-7 w-7 rounded text-sm ${b.cls} ${
              t[b.key] ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {b.glyph}
          </button>
        ))}
        <label
          title="Text color"
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded hover:bg-gray-200"
        >
          <span aria-hidden="true" className="text-sm">🎨</span>
          <input
            type="color"
            aria-label="Text color"
            className="sr-only"
            value={toHex(t.color)}
            onChange={(e) => setTitle({ color: e.target.value, gradient: null })}
          />
        </label>
        <button
          type="button"
          aria-label="Text gradient"
          aria-pressed={Boolean(t.gradient)}
          onClick={() =>
            setTitle({
              gradient: t.gradient
                ? null
                : `linear-gradient(270deg, ${toHex(t.color)} 0%, ${toHex(t.color)}b3 100%)`,
            })
          }
          className={`h-7 rounded px-1.5 text-[11px] font-semibold ${
            t.gradient ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          ▦
        </button>
        <span className="mx-1 h-5 w-px bg-gray-300" />
        {(["left", "center", "right"] as const).map((a) => (
          <button
            key={a}
            type="button"
            aria-label={`Align ${a}`}
            aria-pressed={t.align === a}
            onClick={() => setTitle({ align: a })}
            className={`h-7 w-7 rounded text-xs ${
              t.align === a ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {a === "left" ? "⇤" : a === "center" ? "≡" : "⇥"}
          </button>
        ))}
        <button
          type="button"
          aria-label="Line spacing"
          onClick={() =>
            setTitle({ lineHeight: ((t.lineHeight ?? 1) >= 1.6 ? 1 : (t.lineHeight ?? 1) + 0.2) })
          }
          className="h-7 rounded px-1.5 text-[11px] text-gray-600 hover:bg-gray-200"
        >
          ↕{(t.lineHeight ?? 1).toFixed(1)}
        </button>
        <label
          title="Text background"
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded hover:bg-gray-200"
        >
          <span aria-hidden="true" className="text-xs font-bold">A</span>
          <input
            type="color"
            aria-label="Text background"
            className="sr-only"
            value={toHex(t.background ?? "#ffffff")}
            onChange={(e) => setTitle({ background: e.target.value })}
          />
        </label>
        {t.background && (
          <button
            type="button"
            aria-label="Clear text background"
            onClick={() => setTitle({ background: null })}
            className="h-7 rounded px-1.5 text-[11px] text-gray-600 hover:bg-gray-200"
          >
            ⌫
          </button>
        )}
      </div>
      <textarea
        aria-label="Title text"
        rows={2}
        className="w-full rounded-b-md border border-t-0 border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
        value={t.text}
        onChange={(e) => setTitle({ text: e.target.value })}
      />

      {el.subtitle && (
        <div className="mt-3">
          <Labeled label="Subtitle">
            <input
              className={field}
              value={el.subtitle.text}
              onChange={(e) =>
                patch((x) => ({
                  ...x,
                  subtitle: { ...x.subtitle!, text: e.target.value },
                }))
              }
            />
          </Labeled>
        </div>
      )}

      <div className="mt-3">
        <Labeled label="Font Family">
          <select
            className={field}
            value={t.font ?? "Global"}
            onChange={(e) => setTitle({ font: e.target.value })}
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </Labeled>
      </div>

      <div className="mt-3">
        <Labeled label="Decoration">
          <select
            className={field}
            value={el.decoration ?? "None"}
            onChange={(e) => patch((x) => ({ ...x, decoration: e.target.value }))}
          >
            {DECORATIONS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Labeled>
      </div>

      {el.decoration && el.decoration !== "None" && (
        <div className="mt-2">
          <Labeled label="Decoration colour">
            <input
              type="color"
              aria-label="Decoration colour"
              value={toHex(el.decorationColor ?? "#7c5cff")}
              onChange={(e) =>
                patch((x) => ({ ...x, decorationColor: e.target.value }))
              }
              className="h-9 w-16 cursor-pointer rounded-md border border-gray-300"
            />
          </Labeled>
        </div>
      )}

      <div className="mt-3">
        <Labeled label="Match text size">
          <select
            className={field}
            value={el.matchTextSize === false ? MATCH_TEXT_SIZE[1] : MATCH_TEXT_SIZE[0]}
            onChange={(e) =>
              patch((x) => ({ ...x, matchTextSize: e.target.value === MATCH_TEXT_SIZE[0] }))
            }
          >
            {MATCH_TEXT_SIZE.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Labeled>
      </div>
    </>
  );
}

/* ----------------------------------------------------------------- Device */

export function DeviceSection({
  el,
  patch,
}: {
  el: ApiElement;
  patch: (fn: (el: ApiElement) => ApiElement) => void;
}) {
  const file = useRef<HTMLInputElement>(null);
  const d = el.device ?? {};
  const setDevice = (p: Partial<NonNullable<ApiElement["device"]>>) =>
    patch((x) => ({ ...x, device: { ...x.device, ...p } }));

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Labeled label="Device type">
          <select
            className={field}
            value={d.variant === "none" ? "No Device" : DEVICE_TYPES[0]}
            onChange={(e) =>
              setDevice({ variant: e.target.value === "No Device" ? "none" : "full" })
            }
          >
            {DEVICE_TYPES.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Labeled>
        <Labeled label="Device style">
          <select
            className={field}
            value={d.style ?? "real-dark"}
            onChange={(e) =>
              setDevice({ style: e.target.value as NonNullable<ApiElement["device"]>["style"] })
            }
          >
            {DEVICE_STYLES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </Labeled>
        <Labeled label="Device orientation">
          <select
            className={field}
            value={d.orientation === "landscape" ? "Landscape" : "Portrait"}
            onChange={(e) =>
              setDevice({
                orientation: e.target.value === "Landscape" ? "landscape" : "portrait",
              })
            }
          >
            {ORIENTATIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Labeled>
        <Labeled label="Fit">
          <select
            className={field}
            value={el.fit ?? "cover"}
            onChange={(e) =>
              patch((x) => ({ ...x, fit: e.target.value as ApiElement["fit"] }))
            }
          >
            {FITS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </Labeled>
        <Labeled label="Vertical position">
          <select
            className={field}
            value={el.vPos ?? "center"}
            onChange={(e) =>
              patch((x) => ({ ...x, vPos: e.target.value as ApiElement["vPos"] }))
            }
          >
            {VERTICAL_POSITIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </Labeled>
      </div>

      <input
        ref={file}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) readFile(f, (data) => setDevice({ screenshot: data }));
        }}
      />
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => file.current?.click()}
          className="btn btn-secondary h-9 flex-1 justify-center"
        >
          Add screenshots
        </button>
        {d.screenshot && (
          <button
            type="button"
            onClick={() => setDevice({ screenshot: undefined })}
            className="btn btn-light h-9"
          >
            Remove
          </button>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ Image */

export function ImageSection({
  el,
  patch,
}: {
  el: ApiElement;
  patch: (fn: (el: ApiElement) => ApiElement) => void;
}) {
  const file = useRef<HTMLInputElement>(null);
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Labeled label="Fit">
          <select
            className={field}
            value={el.fit ?? "contain"}
            onChange={(e) =>
              patch((x) => ({ ...x, fit: e.target.value as ApiElement["fit"] }))
            }
          >
            {FITS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </Labeled>
        <Labeled label="Vertical position">
          <select
            className={field}
            value={el.vPos ?? "center"}
            onChange={(e) =>
              patch((x) => ({ ...x, vPos: e.target.value as ApiElement["vPos"] }))
            }
          >
            {VERTICAL_POSITIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </Labeled>
      </div>

      <div className="mt-3">
        <Labeled label="SVG style">
          <input
            type="color"
            aria-label="SVG colour"
            value={toHex(el.svgColor ?? "#7c5cff")}
            onChange={(e) => patch((x) => ({ ...x, svgColor: e.target.value }))}
            className="h-9 w-16 cursor-pointer rounded-md border border-gray-300"
          />
        </Labeled>
      </div>

      <input
        ref={file}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f)
            readFile(f, (data) =>
              patch((x) => ({ ...x, device: { ...x.device, screenshot: data } })),
            );
        }}
      />
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => file.current?.click()}
          className="btn btn-secondary h-9 flex-1 justify-center"
        >
          Select Image
        </button>
        {el.device?.screenshot && (
          <button
            type="button"
            onClick={() =>
              patch((x) => ({ ...x, device: { ...x.device, screenshot: undefined } }))
            }
            className="btn btn-light h-9"
          >
            Remove
          </button>
        )}
      </div>
      <p className="mt-2 text-[11px] leading-4 text-gray-400">
        Decoration slot ({el.assetShape ?? "generic"}) — a placeholder shape renders
        until you supply artwork.
      </p>
    </>
  );
}

/* ------------------------------------------------------------- Background */

export function BackgroundSection({
  screen,
  project,
  patchScreen,
  patchProject,
}: {
  screen: ApiScreen;
  project: ApiProject;
  patchScreen: (fn: (s: ApiScreen) => ApiScreen) => void;
  patchProject: (fn: (p: ApiProject) => ApiProject) => void;
}) {
  const file = useRef<HTMLInputElement>(null);
  const style = screen.backgroundStyle ?? "solid";

  return (
    <>
      <p className="mb-1.5 text-xs font-semibold text-gray-700">Panoramic style</p>
      <button
        type="button"
        aria-pressed={Boolean(screen.panoramic)}
        onClick={() => patchScreen((s) => ({ ...s, panoramic: !s.panoramic }))}
        className={`btn h-8 ${screen.panoramic ? "btn-primary" : "btn-secondary"}`}
      >
        Panoramic background
      </button>

      <p className="mb-1.5 mt-4 text-xs font-semibold text-gray-700">Background style</p>
      <div className="flex gap-2">
        {(
          [
            ["none", "∅", "None"],
            ["solid", "◼", "Solid colour"],
            ["gradient", "▦", "Gradient"],
          ] as const
        ).map(([id, glyph, label]) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-pressed={style === id}
            onClick={() => patchScreen((s) => ({ ...s, backgroundStyle: id }))}
            className={`btn h-9 w-10 justify-center ${
              style === id ? "btn-primary" : "btn-secondary"
            }`}
          >
            {glyph}
          </button>
        ))}
      </div>

      {style !== "none" && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Labeled label="Colour">
            <input
              type="color"
              aria-label="Background colour"
              value={toHex(screen.background ?? project.background)}
              onChange={(e) =>
                patchScreen((s) => ({ ...s, background: e.target.value }))
              }
              className="h-9 w-full cursor-pointer rounded-md border border-gray-300"
            />
          </Labeled>
          {style === "gradient" && (
            <Labeled label="Second colour">
              <input
                type="color"
                aria-label="Second background colour"
                value={toHex(screen.backgroundColor2 ?? "#ffffff")}
                onChange={(e) =>
                  patchScreen((s) => ({ ...s, backgroundColor2: e.target.value }))
                }
                className="h-9 w-full cursor-pointer rounded-md border border-gray-300"
              />
            </Labeled>
          )}
        </div>
      )}

      {style === "gradient" && (
        <div className="mt-2">
          <Labeled label={`Angle (${screen.backgroundAngle ?? 160}°)`}>
            <input
              type="range"
              min={0}
              max={360}
              value={screen.backgroundAngle ?? 160}
              onChange={(e) =>
                patchScreen((s) => ({ ...s, backgroundAngle: +e.target.value }))
              }
              className="w-full accent-indigo-600"
            />
          </Labeled>
        </div>
      )}

      <input
        ref={file}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) readFile(f, (data) => patchScreen((s) => ({ ...s, backgroundImage: data })));
        }}
      />
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => file.current?.click()}
          className="btn btn-secondary h-9 flex-1 justify-center"
        >
          Select Background
        </button>
        {screen.backgroundImage && (
          <button
            type="button"
            onClick={() => patchScreen((s) => ({ ...s, backgroundImage: undefined }))}
            className="btn btn-light h-9"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-3">
        <Labeled label="Pattern">
          <select
            className={field}
            value={screen.backgroundPattern ?? "None"}
            onChange={(e) =>
              patchScreen((s) => ({ ...s, backgroundPattern: e.target.value }))
            }
          >
            {BACKGROUND_PATTERNS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Labeled>
      </div>

      <div className="mt-3">
        <Labeled label="Accent (decorations)">
          <input
            type="color"
            aria-label="Accent colour"
            value={toHex(project.primaryColor ?? "#7c5cff")}
            onChange={(e) => patchProject((p) => ({ ...p, primaryColor: e.target.value }))}
            className="h-9 w-16 cursor-pointer rounded-md border border-gray-300"
          />
        </Labeled>
      </div>
    </>
  );
}
