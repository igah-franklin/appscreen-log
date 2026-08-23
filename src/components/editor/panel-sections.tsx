"use client";

import { useRef } from "react";
import type { ApiElement, ApiProject, ApiScreen, ApiText } from "@/lib/api";
import { buildGradient, parseGradient, type SimpleGradient } from "@/lib/gradient";
import { assetUrl } from "@/lib/assets";
import {
  BACKGROUND_PATTERNS,
  DECORATIONS,
  DEVICE_STYLES,
  DEVICE_COLOURS,
  DEVICE_TYPES,
  FITS,
  FLOATING_POSITIONS,
  FONT_FAMILIES,
  MATCH_TEXT_SIZE,
  ORIENTATIONS,
  VERTICAL_POSITIONS,
} from "@/lib/design-options";

export /** The standard list, plus whatever font this caption is already using. */
function fontOptions(current?: string) {
  const list: string[] = [...FONT_FAMILIES];
  if (current && !list.includes(current)) list.splice(2, 0, current);
  return list;
}

const field =
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

  /**
   * Captured captions carry per-line, per-run styling, which the renderer
   * prefers over the plain text. Editing has to keep the two in step: text
   * edits rebuild the lines (keeping each line's own run styling where it
   * still applies), and styling edits that apply to the whole caption clear
   * the per-run overrides they would otherwise be masked by.
   */
  const setTitle = (p: Partial<ApiText>) =>
    patch((x) => {
      const prev = x.title ?? ({ text: "" } as ApiText);
      const next: ApiText = { ...prev, ...p };

      if (p.text !== undefined && prev.lines?.length) {
        next.lines = p.text.split("\n").map((line, i) => {
          const before = prev.lines?.[i];
          const style = before?.runs?.[0] ?? {};
          return {
            runs: [{ ...style, text: line }],
            align: before?.align ?? null,
          };
        });
      }

      /* A caption-wide colour or gradient beats any run-level colour. */
      if ((p.color !== undefined || p.gradient !== undefined) && next.lines?.length) {
        next.lines = next.lines.map((line) => ({
          ...line,
          runs: line.runs.map((r) => ({ ...r, color: undefined, gradient: undefined })),
        }));
      }

      /* Alignment set from the toolbar applies to every line. */
      if (p.align !== undefined && next.lines?.length) {
        next.lines = next.lines.map((line) => ({ ...line, align: p.align ?? null }));
      }

      return { ...x, title: next };
    });

  /* The subtitle carries the same run styling, so keep its lines in step too. */
  const setSubtitle = (p: Partial<ApiText>) =>
    patch((x) => {
      const prev = x.subtitle ?? ({ text: "" } as ApiText);
      const next: ApiText = { ...prev, ...p };
      if (p.text !== undefined && prev.lines?.length) {
        next.lines = p.text.split("\n").map((line, i) => ({
          runs: [{ ...(prev.lines?.[i]?.runs?.[0] ?? {}), text: line }],
          align: prev.lines?.[i]?.align ?? null,
        }));
      }
      if ((p.color !== undefined || p.gradient !== undefined) && next.lines?.length) {
        next.lines = next.lines.map((line) => ({
          ...line,
          runs: line.runs.map((r) => ({ ...r, color: undefined, gradient: undefined })),
        }));
      }
      if (p.align !== undefined && next.lines?.length) {
        next.lines = next.lines.map((line) => ({ ...line, align: p.align ?? null }));
      }
      return { ...x, subtitle: next };
    });

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
        <div className="mt-3 rounded-lg bg-gray-50 p-3">
          <Labeled label="Subtitle">
            <input
              className={field}
              value={el.subtitle.text}
              onChange={(e) => setSubtitle({ text: e.target.value })}
            />
          </Labeled>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Labeled label="Subtitle font">
              <select
                className={field}
                value={el.subtitle.font ?? "Global"}
                onChange={(e) => setSubtitle({ font: e.target.value })}
              >
                {fontOptions(el.subtitle.font).map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </Labeled>
            <Labeled label="Subtitle colour">
              <input
                type="color"
                aria-label="Subtitle colour"
                value={toHex(el.subtitle.color)}
                onChange={(e) => setSubtitle({ color: e.target.value, gradient: null })}
                className="h-9 w-full cursor-pointer rounded-md border border-gray-300"
              />
            </Labeled>
          </div>
          <div className="mt-3 flex items-center gap-1">
            {QUILL_BUTTONS.map((b) => (
              <button
                key={b.key}
                type="button"
                aria-label={`Subtitle ${b.label.toLowerCase()}`}
                aria-pressed={Boolean(el.subtitle?.[b.key])}
                onClick={() =>
                  setSubtitle({ [b.key]: !el.subtitle?.[b.key] } as Partial<ApiText>)
                }
                className={`h-7 w-7 rounded text-sm ${b.cls} ${
                  el.subtitle?.[b.key]
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {b.glyph}
              </button>
            ))}
            <span className="mx-1 h-5 w-px bg-gray-300" />
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                type="button"
                aria-label={`Subtitle align ${a}`}
                aria-pressed={el.subtitle?.align === a}
                onClick={() => setSubtitle({ align: a })}
                className={`h-7 w-7 rounded text-xs ${
                  el.subtitle?.align === a
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {a === "left" ? "⇤" : a === "center" ? "≡" : "⇥"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Labeled label={`Letter spacing (${((t.charSpacing ?? 0) * 100).toFixed(0)}%)`}>
          <input
            type="range"
            min={-5}
            max={40}
            value={Math.round((t.charSpacing ?? 0) * 100)}
            onChange={(e) => setTitle({ charSpacing: +e.target.value / 100 })}
            className="w-full accent-indigo-600"
          />
        </Labeled>
        <Labeled label={`Max size (${((t.maxFontSize ?? 0.2) * 100).toFixed(0)}% of height)`}>
          <input
            type="range"
            min={2}
            max={40}
            value={Math.round((t.maxFontSize ?? 0.2) * 100)}
            onChange={(e) => setTitle({ maxFontSize: +e.target.value / 100 })}
            className="w-full accent-indigo-600"
          />
        </Labeled>
      </div>

      <div className="mt-3">
        <Labeled label="Font Family">
          <select
            className={field}
            value={t.font ?? "Global"}
            onChange={(e) => setTitle({ font: e.target.value })}
          >
            {fontOptions(t.font).map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </Labeled>
      </div>

      <div className="mt-3">
        <Labeled label="Decoration">
          <select
            className={field}
            value={el.decoration ?? "none"}
            onChange={(e) => patch((x) => ({ ...x, decoration: e.target.value }))}
          >
            {DECORATIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </Labeled>
      </div>

      {el.decoration && el.decoration !== "none" && (
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
            value={
              d.variant === "none"
                ? "No Device"
                : d.variant === "dynamic"
                  ? "Dynamic Frame"
                  : (d.style ?? "real-dark").startsWith("flat")
                    ? "Flat Device Mockup"
                    : "Real Device Mockup"
            }
            onChange={(e) => {
              const choice = e.target.value;
              if (choice === "No Device") {
                setDevice({ variant: "none" });
                return;
              }
              if (choice === "Dynamic Frame") {
                setDevice({ variant: "dynamic" });
                return;
              }
              /* Keep the light/dark half of the style, swap flat vs real. */
              const dark = !(d.style ?? "real-dark").endsWith("light");
              const family = choice === "Flat Device Mockup" ? "flat" : "real";
              setDevice({
                variant: "full",
                style: `${family}-${dark ? "dark" : "light"}` as NonNullable<
                  ApiElement["device"]
                >["style"],
              });
            }}
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
        <Labeled label="Frame colour">
          <select
            className={field}
            value={d.colour ?? "black"}
            onChange={(e) => setDevice({ colour: e.target.value })}
          >
            {DEVICE_COLOURS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
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

      {d.variant === "dynamic" && (
        <div className="mt-3 rounded-lg bg-gray-50 p-3">
          <p className="mb-2 text-xs font-semibold text-gray-700">Dynamic frame</p>
          <div className="grid grid-cols-2 gap-3">
            <Labeled label="Frame colour">
              <input
                type="color"
                aria-label="Dynamic frame colour"
                value={toHex(d.frameColor ?? "#000000")}
                onChange={(e) => setDevice({ frameColor: e.target.value })}
                className="h-9 w-full cursor-pointer rounded-md border border-gray-300"
              />
            </Labeled>
            <Labeled label="Padding colour">
              <input
                type="color"
                aria-label="Dynamic frame padding colour"
                value={toHex(d.paddingColor ?? "#ffffff")}
                onChange={(e) => setDevice({ paddingColor: e.target.value })}
                className="h-9 w-full cursor-pointer rounded-md border border-gray-300"
              />
            </Labeled>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Labeled label={`Frame width (${((d.frameSize ?? 0.02) * 100).toFixed(1)}%)`}>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((d.frameSize ?? 0.02) * 1000)}
                onChange={(e) => setDevice({ frameSize: +e.target.value / 1000 })}
                className="w-full accent-indigo-600"
              />
            </Labeled>
            <Labeled label={`Padding (${((d.padding ?? 0) * 100).toFixed(1)}%)`}>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((d.padding ?? 0) * 1000)}
                onChange={(e) => setDevice({ padding: +e.target.value / 1000 })}
                className="w-full accent-indigo-600"
              />
            </Labeled>
          </div>
        </div>
      )}

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

/** None / solid / gradient, mirroring the reference's SVG style popover. */
type FillMode = "none" | "solid" | "gradient";

function fillMode(value: string | undefined): FillMode {
  if (!value) return "none";
  return parseGradient(value) ? "gradient" : "solid";
}

function ModeButtons({
  mode,
  onChange,
  label,
}: {
  mode: FillMode;
  onChange: (m: FillMode) => void;
  label: string;
}) {
  const modes: { id: FillMode; glyph: string; title: string }[] = [
    { id: "none", glyph: "⃠", title: "None" },
    { id: "solid", glyph: "🎨", title: "Solid colour" },
    { id: "gradient", glyph: "▦", title: "Gradient" },
  ];
  return (
    <div className="flex gap-2" role="group" aria-label={label}>
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          aria-label={`${label}: ${m.title}`}
          aria-pressed={mode === m.id}
          onClick={() => onChange(m.id)}
          className={`btn h-9 w-10 justify-center ${
            mode === m.id ? "btn-primary" : "btn-secondary"
          }`}
        >
          {m.glyph}
        </button>
      ))}
    </div>
  );
}

/**
 * The Image panel.
 *
 * Mirrors the reference's own: a transparency-checkered preview of the
 * artwork, Fit and Vertical position, and an SVG style block with an
 * independent colour overlay and border/stroke, each none / solid / gradient.
 */
export function ImageSection({
  el,
  patch,
}: {
  el: ApiElement;
  patch: (fn: (el: ApiElement) => ApiElement) => void;
}) {
  const file = useRef<HTMLInputElement>(null);

  const overlayMode = fillMode(el.svgColor);
  const overlayGradient = parseGradient(el.svgColor);
  const strokeMode = fillMode(el.svgStrokeColor);
  const strokeGradient = parseGradient(el.svgStrokeColor);

  const setOverlay = (mode: FillMode) =>
    patch((x) => {
      if (mode === "none") return { ...x, svgColor: undefined };
      const from = parseGradient(x.svgColor)?.from ?? x.svgColor ?? "#7c5cff";
      if (mode === "solid") return { ...x, svgColor: from };
      return {
        ...x,
        svgColor: buildGradient({
          from,
          to: parseGradient(x.svgColor)?.to ?? from,
          angle: parseGradient(x.svgColor)?.angle ?? 270,
        }),
      };
    });

  const patchOverlay = (part: Partial<SimpleGradient>) =>
    patch((x) => {
      const base = parseGradient(x.svgColor);
      if (!base) return { ...x, svgColor: part.from ?? x.svgColor };
      return { ...x, svgColor: buildGradient({ ...base, ...part }) };
    });

  const setStroke = (mode: FillMode) =>
    patch((x) => {
      if (mode === "none") return { ...x, svgStrokeColor: undefined };
      const from = parseGradient(x.svgStrokeColor)?.from ?? x.svgStrokeColor ?? "#1f2937";
      const width = x.svgStrokeWidth || 0.0075;
      if (mode === "solid") return { ...x, svgStrokeColor: from, svgStrokeWidth: width };
      return {
        ...x,
        svgStrokeWidth: width,
        svgStrokeColor: buildGradient({
          from,
          to: parseGradient(x.svgStrokeColor)?.to ?? from,
          angle: parseGradient(x.svgStrokeColor)?.angle ?? 270,
        }),
      };
    });

  const patchStroke = (part: Partial<SimpleGradient>) =>
    patch((x) => {
      const base = parseGradient(x.svgStrokeColor);
      if (!base) return { ...x, svgStrokeColor: part.from ?? x.svgStrokeColor };
      return { ...x, svgStrokeColor: buildGradient({ ...base, ...part }) };
    });

  const preview = assetUrl(el.asset);

  return (
    <>
      <div className="flex gap-3">
        {/* Transparency checkerboard behind the artwork, as the reference shows it. */}
        <div
          className="h-28 w-28 shrink-0 rounded-md border border-gray-200 bg-white"
          style={{
            backgroundImage:
              "linear-gradient(45deg,#e5e7eb 25%,transparent 25%,transparent 75%,#e5e7eb 75%)," +
              "linear-gradient(45deg,#e5e7eb 25%,transparent 25%,transparent 75%,#e5e7eb 75%)",
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0, 8px 8px",
          }}
        >
          {preview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={preview}
              alt="Selected artwork"
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-[11px] text-gray-400">
              No image
            </span>
          )}
        </div>

        <div className="flex-1 space-y-3">
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
      </div>

      <p className="mb-1.5 mt-4 text-xs font-semibold text-gray-700">Colour overlay</p>
      <ModeButtons mode={overlayMode} onChange={setOverlay} label="Colour overlay" />
      {overlayMode !== "none" && (
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Labeled label={overlayMode === "gradient" ? "From" : "Colour"}>
            <input
              type="color"
              aria-label="Overlay colour"
              value={toHex(overlayGradient?.from ?? el.svgColor)}
              onChange={(e) =>
                overlayGradient
                  ? patchOverlay({ from: e.target.value })
                  : patch((x) => ({ ...x, svgColor: e.target.value }))
              }
              className="h-9 w-full cursor-pointer rounded-md border border-gray-300"
            />
          </Labeled>
          {overlayMode === "gradient" && (
            <Labeled label="To">
              <input
                type="color"
                aria-label="Overlay second colour"
                value={toHex(overlayGradient?.to)}
                onChange={(e) => patchOverlay({ to: e.target.value })}
                className="h-9 w-full cursor-pointer rounded-md border border-gray-300"
              />
            </Labeled>
          )}
        </div>
      )}
      {overlayMode === "gradient" && (
        <div className="mt-2 flex items-center gap-2">
          <Labeled label={`Angle (${overlayGradient?.angle ?? 270}°)`}>
            <input
              type="range"
              min={0}
              max={360}
              value={overlayGradient?.angle ?? 270}
              onChange={(e) => patchOverlay({ angle: +e.target.value })}
              className="w-full accent-indigo-600"
            />
          </Labeled>
          <button
            type="button"
            aria-label="Swap overlay colours"
            onClick={() =>
              overlayGradient &&
              patchOverlay({ from: overlayGradient.to, to: overlayGradient.from })
            }
            className="btn btn-secondary mt-4 h-9 w-10 justify-center"
          >
            ⇄
          </button>
        </div>
      )}

      <p className="mb-1.5 mt-4 text-xs font-semibold text-gray-700">Border / stroke</p>
      <ModeButtons mode={strokeMode} onChange={setStroke} label="Border / stroke" />
      {strokeMode !== "none" && (
        <>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Labeled label={strokeMode === "gradient" ? "From" : "Colour"}>
              <input
                type="color"
                aria-label="Stroke colour"
                value={toHex(strokeGradient?.from ?? el.svgStrokeColor)}
                onChange={(e) =>
                  strokeGradient
                    ? patchStroke({ from: e.target.value })
                    : patch((x) => ({ ...x, svgStrokeColor: e.target.value }))
                }
                className="h-9 w-full cursor-pointer rounded-md border border-gray-300"
              />
            </Labeled>
            {strokeMode === "gradient" && (
              <Labeled label="To">
                <input
                  type="color"
                  aria-label="Stroke second colour"
                  value={toHex(strokeGradient?.to)}
                  onChange={(e) => patchStroke({ to: e.target.value })}
                  className="h-9 w-full cursor-pointer rounded-md border border-gray-300"
                />
              </Labeled>
            )}
          </div>
          <div className="mt-2">
            <Labeled label={`Width (${((el.svgStrokeWidth ?? 0) * 100).toFixed(2)}%)`}>
              <input
                type="range"
                min={0}
                max={40}
                value={Math.round((el.svgStrokeWidth ?? 0) * 1000)}
                onChange={(e) =>
                  patch((x) => ({ ...x, svgStrokeWidth: +e.target.value / 1000 }))
                }
                className="w-full accent-indigo-600"
              />
            </Labeled>
          </div>
        </>
      )}

      <input
        ref={file}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f)
            readFile(f, (data) =>
              /* Replaces the slot's artwork; a photo is not tinted like an SVG. */
              patch((x) => ({ ...x, asset: data, svgColor: undefined })),
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
        {el.asset && (
          <button
            type="button"
            onClick={() => patch((x) => ({ ...x, asset: null }))}
            className="btn btn-light h-9"
          >
            Remove
          </button>
        )}
      </div>
    </>
  );
}

/**
 * The Shape panel — fill, border and corner radius for a shape layer.
 *
 * Fill and border each take a colour or a gradient, matching how the reference
 * stores them.
 */
export function ShapeSection({
  el,
  patch,
}: {
  el: ApiElement;
  patch: (fn: (el: ApiElement) => ApiElement) => void;
}) {
  const shape = el.shape ?? { kind: "rectangle" };
  const setShape = (p: Partial<NonNullable<ApiElement["shape"]>>) =>
    patch((x) => ({ ...x, shape: { ...(x.shape ?? { kind: "rectangle" }), ...p } }));

  const fillGradient = parseGradient(shape.fill);
  const strokeGradient = parseGradient(shape.stroke);

  const setFillMode = (mode: FillMode) => {
    if (mode === "none") return setShape({ fill: null });
    const from = fillGradient?.from ?? shape.fill ?? "#7c5cff";
    if (mode === "solid") return setShape({ fill: from });
    return setShape({
      fill: buildGradient({ from, to: fillGradient?.to ?? from, angle: fillGradient?.angle ?? 90 }),
    });
  };

  const setStrokeMode = (mode: FillMode) => {
    if (mode === "none") return setShape({ stroke: null });
    const from = strokeGradient?.from ?? shape.stroke ?? "#1f2937";
    const width = shape.strokeWidth || 4;
    if (mode === "solid") return setShape({ stroke: from, strokeWidth: width });
    return setShape({
      strokeWidth: width,
      stroke: buildGradient({
        from,
        to: strokeGradient?.to ?? from,
        angle: strokeGradient?.angle ?? 90,
      }),
    });
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Labeled label="Shape">
          <select
            className={field}
            value={shape.kind}
            onChange={(e) => setShape({ kind: e.target.value })}
          >
            <option value="rectangle">Rectangle</option>
            <option value="ellipse">Ellipse</option>
            <option value="line">Line</option>
          </select>
        </Labeled>
        {shape.kind === "line" ? (
          <Labeled label="Direction">
            <select
              className={field}
              value={shape.lineDirection ?? "horizontal"}
              onChange={(e) => setShape({ lineDirection: e.target.value })}
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </Labeled>
        ) : (
          <Labeled label={`Corner radius (${shape.cornerRadius ?? 0}px)`}>
            <input
              type="range"
              min={0}
              max={200}
              value={shape.cornerRadius ?? 0}
              onChange={(e) => setShape({ cornerRadius: +e.target.value })}
              className="w-full accent-indigo-600"
            />
          </Labeled>
        )}
      </div>

      <p className="mb-1.5 mt-4 text-xs font-semibold text-gray-700">Fill</p>
      <ModeButtons mode={fillMode(shape.fill ?? undefined)} onChange={setFillMode} label="Fill" />
      {shape.fill && (
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Labeled label={fillGradient ? "From" : "Colour"}>
            <input
              type="color"
              aria-label="Fill colour"
              value={toHex(fillGradient?.from ?? shape.fill)}
              onChange={(e) =>
                fillGradient
                  ? setShape({ fill: buildGradient({ ...fillGradient, from: e.target.value }) })
                  : setShape({ fill: e.target.value })
              }
              className="h-9 w-full cursor-pointer rounded-md border border-gray-300"
            />
          </Labeled>
          {fillGradient && (
            <Labeled label="To">
              <input
                type="color"
                aria-label="Fill second colour"
                value={toHex(fillGradient.to)}
                onChange={(e) =>
                  setShape({ fill: buildGradient({ ...fillGradient, to: e.target.value }) })
                }
                className="h-9 w-full cursor-pointer rounded-md border border-gray-300"
              />
            </Labeled>
          )}
        </div>
      )}
      {fillGradient && (
        <div className="mt-2">
          <Labeled label={`Fill angle (${fillGradient.angle}°)`}>
            <input
              type="range"
              min={0}
              max={360}
              value={fillGradient.angle}
              onChange={(e) =>
                setShape({ fill: buildGradient({ ...fillGradient, angle: +e.target.value }) })
              }
              className="w-full accent-indigo-600"
            />
          </Labeled>
        </div>
      )}

      <p className="mb-1.5 mt-4 text-xs font-semibold text-gray-700">Border</p>
      <ModeButtons
        mode={fillMode(shape.stroke ?? undefined)}
        onChange={setStrokeMode}
        label="Border"
      />
      {shape.stroke && (
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Labeled label={strokeGradient ? "From" : "Colour"}>
            <input
              type="color"
              aria-label="Border colour"
              value={toHex(strokeGradient?.from ?? shape.stroke)}
              onChange={(e) =>
                strokeGradient
                  ? setShape({ stroke: buildGradient({ ...strokeGradient, from: e.target.value }) })
                  : setShape({ stroke: e.target.value })
              }
              className="h-9 w-full cursor-pointer rounded-md border border-gray-300"
            />
          </Labeled>
          <Labeled label={`Width (${shape.strokeWidth ?? 0}px)`}>
            <input
              type="range"
              min={0}
              max={40}
              value={shape.strokeWidth ?? 0}
              onChange={(e) => setShape({ strokeWidth: +e.target.value })}
              className="w-full accent-indigo-600"
            />
          </Labeled>
        </div>
      )}
    </>
  );
}

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

  /* A captured background may be a whole CSS gradient; expose its ends and
     angle here and rebuild the string on edit so it stays editable. */
  const captured = parseGradient(screen.background);
  const angle = captured?.angle ?? screen.backgroundAngle ?? 160;

  const setBackground = (part: Partial<SimpleGradient> & { solid?: string }) =>
    patchScreen((s) => {
      if (part.solid !== undefined && !captured) {
        return { ...s, background: part.solid };
      }
      const base =
        captured ?? {
          from: s.background ?? "#ffffff",
          to: s.backgroundColor2 ?? "#ffffff",
          angle,
        };
      return {
        ...s,
        background: buildGradient({
          ...base,
          ...(part.solid !== undefined ? { from: part.solid } : {}),
          ...part,
        }),
      };
    });

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
              value={toHex(captured?.from ?? screen.background ?? project.background)}
              onChange={(e) => setBackground({ solid: e.target.value })}
              className="h-9 w-full cursor-pointer rounded-md border border-gray-300"
            />
          </Labeled>
          {style === "gradient" && (
            <Labeled label="Second colour">
              <input
                type="color"
                aria-label="Second background colour"
                value={toHex(captured?.to ?? screen.backgroundColor2 ?? "#ffffff")}
                onChange={(e) =>
                  captured
                    ? setBackground({ to: e.target.value })
                    : patchScreen((s) => ({ ...s, backgroundColor2: e.target.value }))
                }
                className="h-9 w-full cursor-pointer rounded-md border border-gray-300"
              />
            </Labeled>
          )}
        </div>
      )}

      {style === "gradient" && (
        <div className="mt-2">
          <Labeled label={`Angle (${angle}°)`}>
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) =>
                captured
                  ? setBackground({ angle: +e.target.value })
                  : patchScreen((s) => ({ ...s, backgroundAngle: +e.target.value }))
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

      {screen.backgroundImage && (
        <div className="mt-3">
          <Labeled label="Background image fit">
            <select
              className={field}
              value={screen.backgroundFit ?? "cover"}
              onChange={(e) =>
                patchScreen((s) => ({
                  ...s,
                  backgroundFit: e.target.value as ApiScreen["backgroundFit"],
                }))
              }
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
            </select>
          </Labeled>
        </div>
      )}

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
