"use client";

import { useRef, useState } from "react";
import { FONT_OPTIONS, LAYOUTS, type Screen } from "@/lib/editor-model";

type Patch = (fn: (s: Screen) => Screen) => void;

function Section({
  title,
  icon,
  open,
  onToggle,
  actions,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="text-gray-500">{icon}</span>
        <span className="flex-1 text-sm font-semibold text-gray-900">
          {title}
        </span>
        {actions}
        <button
          type="button"
          aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
          aria-expanded={open}
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
            fill="currentColor"
          >
            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41Z" />
          </svg>
        </button>
      </div>
      {open && <div className="border-t border-gray-100 px-4 py-4">{children}</div>}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export function ScreenPanels({
  screen,
  patch,
}: {
  screen: Screen;
  patch: Patch;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    layout: false,
    background: false,
    title: true,
    device: false,
  });
  const toggle = (k: string) =>
    setOpen((o) => ({ ...o, [k]: !o[k] }));

  const bgFile = useRef<HTMLInputElement>(null);
  const shotFile = useRef<HTMLInputElement>(null);

  const readFile = (file: File, cb: (data: string) => void) => {
    const fr = new FileReader();
    fr.onload = () => cb(String(fr.result));
    fr.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <Section
        title="Layouts & Elements"
        open={open.layout}
        onToggle={() => toggle("layout")}
        icon={
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M12 2 2 7l10 5 10-5-10-5Zm0 8.5L4.2 6.6 12 3l7.8 3.6L12 10.5ZM2 12l10 5 10-5-1.9-.95L12 15.1l-8.1-4.05L2 12Zm0 5 10 5 10-5-1.9-.95L12 20.1l-8.1-4.05L2 17Z" />
          </svg>
        }
      >
        <div className="grid grid-cols-2 gap-2">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => patch((s) => ({ ...s, layout: l.id }))}
              className={`rounded-md border px-3 py-2 text-xs font-medium ${
                screen.layout === l.id
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </Section>

      <Section
        title="Background"
        open={open.background}
        onToggle={() => toggle("background")}
        icon={
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2ZM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5Z" />
          </svg>
        }
      >
        <p className="mb-1.5 text-xs font-semibold text-gray-700">
          Panoramic style
        </p>
        <button
          type="button"
          onClick={() => patch((s) => ({ ...s, panoramic: !s.panoramic }))}
          className={`mb-4 rounded-md px-3 py-1.5 text-xs font-medium ${
            screen.panoramic
              ? "bg-indigo-600 text-white"
              : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          }`}
        >
          Panoramic background
        </button>

        <p className="mb-1.5 text-xs font-semibold text-gray-700">
          Background style
        </p>
        <div className="mb-4 flex gap-2">
          {(["none", "solid", "gradient"] as const).map((style) => (
            <button
              key={style}
              type="button"
              aria-label={style}
              onClick={() =>
                patch((s) => ({
                  ...s,
                  background: { ...s.background, style },
                }))
              }
              className={`flex h-9 w-9 items-center justify-center rounded-md text-white ${
                screen.background.style === style
                  ? "ring-2 ring-indigo-500 ring-offset-1"
                  : ""
              } ${
                style === "none"
                  ? "bg-green-500"
                  : style === "solid"
                    ? "bg-indigo-400"
                    : "bg-gradient-to-br from-indigo-400 to-fuchsia-500"
              }`}
            >
              {style === "none" ? "∅" : style === "solid" ? "◼" : "▤"}
            </button>
          ))}
        </div>

        {screen.background.style !== "none" && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <Field label="Colour">
              <input
                type="color"
                value={screen.background.color}
                onChange={(e) =>
                  patch((s) => ({
                    ...s,
                    background: { ...s.background, color: e.target.value },
                  }))
                }
                className="h-9 w-full cursor-pointer rounded-md border border-gray-300"
              />
            </Field>
            {screen.background.style === "gradient" && (
              <Field label="Second colour">
                <input
                  type="color"
                  value={screen.background.color2}
                  onChange={(e) =>
                    patch((s) => ({
                      ...s,
                      background: { ...s.background, color2: e.target.value },
                    }))
                  }
                  className="h-9 w-full cursor-pointer rounded-md border border-gray-300"
                />
              </Field>
            )}
          </div>
        )}

        {screen.background.style === "gradient" && (
          <Field label={`Angle (${screen.background.angle}°)`}>
            <input
              type="range"
              min={0}
              max={360}
              value={screen.background.angle}
              onChange={(e) =>
                patch((s) => ({
                  ...s,
                  background: { ...s.background, angle: +e.target.value },
                }))
              }
              className="w-full accent-indigo-600"
            />
          </Field>
        )}

        <p className="mb-1.5 mt-4 text-xs font-semibold text-gray-700">
          Background image
        </p>
        <input
          ref={bgFile}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f)
              readFile(f, (data) =>
                patch((s) => ({
                  ...s,
                  background: { ...s.background, image: data },
                })),
              );
          }}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => bgFile.current?.click()}
            className="flex-1 rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            Select Background
          </button>
          {screen.background.image && (
            <button
              type="button"
              onClick={() =>
                patch((s) => ({
                  ...s,
                  background: { ...s.background, image: undefined },
                }))
              }
              className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
            >
              Clear
            </button>
          )}
        </div>
      </Section>

      <Section
        title="Title"
        open={open.title}
        onToggle={() => toggle("title")}
        icon={
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M5 4v3h5.5v12h3V7H19V4H5Z" />
          </svg>
        }
      >
        <div className="mb-3 grid grid-cols-2 gap-3">
          <Field label="Include Subtitle">
            <select
              className={inputCls}
              value={screen.title.showSubtitle ? "Yes" : "No"}
              onChange={(e) =>
                patch((s) => ({
                  ...s,
                  title: { ...s.title, showSubtitle: e.target.value === "Yes" },
                }))
              }
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </Field>
          <Field label="Floating position">
            <select
              className={inputCls}
              value={screen.title.position}
              onChange={(e) =>
                patch((s) => ({
                  ...s,
                  title: {
                    ...s.title,
                    position: e.target.value as Screen["title"]["position"],
                  },
                }))
              }
            >
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
            </select>
          </Field>
        </div>

        <div className="mb-2 flex flex-wrap items-center gap-1 rounded-t-md border border-gray-300 bg-gray-50 px-2 py-1.5">
          {(
            [
              ["bold", "B", "font-bold"],
              ["italic", "I", "italic"],
              ["underline", "U", "underline"],
            ] as const
          ).map(([key, glyph, cls]) => (
            <button
              key={key}
              type="button"
              aria-label={key}
              aria-pressed={screen.title[key]}
              onClick={() =>
                patch((s) => ({
                  ...s,
                  title: { ...s.title, [key]: !s.title[key] },
                }))
              }
              className={`h-7 w-7 rounded text-sm ${cls} ${
                screen.title[key]
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {glyph}
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-gray-300" />
          {(["left", "center", "right"] as const).map((a) => (
            <button
              key={a}
              type="button"
              aria-label={`Align ${a}`}
              aria-pressed={screen.title.align === a}
              onClick={() =>
                patch((s) => ({ ...s, title: { ...s.title, align: a } }))
              }
              className={`h-7 w-7 rounded text-xs ${
                screen.title.align === a
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {a === "left" ? "⇤" : a === "center" ? "≡" : "⇥"}
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-gray-300" />
          <input
            aria-label="Title colour"
            type="color"
            value={screen.title.color}
            onChange={(e) =>
              patch((s) => ({
                ...s,
                title: { ...s.title, color: e.target.value },
              }))
            }
            className="h-7 w-7 cursor-pointer rounded border border-gray-300 bg-white"
          />
        </div>
        <textarea
          aria-label="Title text"
          value={screen.title.text}
          rows={2}
          onChange={(e) =>
            patch((s) => ({ ...s, title: { ...s.title, text: e.target.value } }))
          }
          className="w-full rounded-b-md border border-t-0 border-gray-300 px-3 py-2 text-center text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
        />

        {screen.title.showSubtitle && (
          <div className="mt-3">
            <Field label="Subtitle">
              <input
                className={inputCls}
                value={screen.title.subtitle}
                onChange={(e) =>
                  patch((s) => ({
                    ...s,
                    title: { ...s.title, subtitle: e.target.value },
                  }))
                }
              />
            </Field>
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Font Family">
            <select
              className={inputCls}
              value={screen.title.font}
              onChange={(e) =>
                patch((s) => ({
                  ...s,
                  title: { ...s.title, font: e.target.value },
                }))
              }
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label={`Text size (${screen.title.size}pt)`}>
            <input
              type="range"
              min={24}
              max={140}
              value={screen.title.size}
              onChange={(e) =>
                patch((s) => ({
                  ...s,
                  title: { ...s.title, size: +e.target.value },
                }))
              }
              className="mt-2 w-full accent-indigo-600"
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Device"
        open={open.device}
        onToggle={() => toggle("device")}
        icon={
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M17 1H7a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm0 18H7V5h10v14Z" />
          </svg>
        }
      >
        <input
          ref={shotFile}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f)
              readFile(f, (data) =>
                patch((s) => ({
                  ...s,
                  device: { ...s.device, screenshot: data },
                })),
              );
          }}
        />
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => shotFile.current?.click()}
            className="flex-1 rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            Upload app screen
          </button>
          {screen.device.screenshot && (
            <button
              type="button"
              onClick={() =>
                patch((s) => ({
                  ...s,
                  device: { ...s.device, screenshot: undefined },
                }))
              }
              className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
            >
              Remove
            </button>
          )}
        </div>

        <Field label={`Device size (${Math.round(screen.device.scale * 100)}%)`}>
          <input
            type="range"
            min={40}
            max={130}
            value={Math.round(screen.device.scale * 100)}
            onChange={(e) =>
              patch((s) => ({
                ...s,
                device: { ...s.device, scale: +e.target.value / 100 },
              }))
            }
            className="w-full accent-indigo-600"
          />
        </Field>
        <Field label={`Vertical offset (${screen.device.offsetY}%)`}>
          <input
            type="range"
            min={-25}
            max={25}
            value={screen.device.offsetY}
            onChange={(e) =>
              patch((s) => ({
                ...s,
                device: { ...s.device, offsetY: +e.target.value },
              }))
            }
            className="w-full accent-indigo-600"
          />
        </Field>
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={screen.device.shadow}
            onChange={(e) =>
              patch((s) => ({
                ...s,
                device: { ...s.device, shadow: e.target.checked },
              }))
            }
            className="h-4 w-4 rounded border-gray-300 text-indigo-600"
          />
          Drop shadow
        </label>
      </Section>
    </div>
  );
}
