"use client";

import { useEffect, useRef } from "react";

export type CreateOption = "ai" | "account" | "sandbox";

const OPTIONS: {
  id: CreateOption;
  title: string;
  body: string;
  tone: string;
  glyph: React.ReactNode;
}[] = [
  {
    id: "ai",
    title: "AI Screenshot creator",
    body: "Automate the creation of your screenshots using AI.",
    tone: "bg-green-500",
    glyph: (
      <svg viewBox="0 0 512 512" fill="currentColor" className="h-5 w-5">
        <path d="M327.5 85.2c-4.5 1.7-7.5 6-7.5 10.8s3 9.1 7.5 10.8L384 128l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L448 128l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L448 64 426.8 7.5C425.1 3 420.8 0 416 0s-9.1 3-10.8 7.5L384 64 327.5 85.2zM205.1 73.3c-2.6-5.7-8.3-9.3-14.5-9.3s-11.9 3.6-14.5 9.3L123.3 187.3 9.3 240C3.6 242.6 0 248.3 0 254.6s3.6 11.9 9.3 14.5l114.1 52.7L176 435.8c2.6 5.7 8.3 9.3 14.5 9.3s11.9-3.6 14.5-9.3l52.7-114.1 114.1-52.7c5.7-2.6 9.3-8.3 9.3-14.5s-3.6-11.9-9.3-14.5L257.8 187.4 205.1 73.3zM384 384l-56.5 21.2c-4.5 1.7-7.5 6-7.5 10.8s3 9.1 7.5 10.8L384 448l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L448 448l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L448 384l-21.2-56.5c-1.7-4.5-6-7.5-10.8-7.5s-9.1 3-10.8 7.5L384 384z" />
      </svg>
    ),
  },
  {
    id: "account",
    title: "Copy Template to Account",
    body: "Copy template and save to your account.",
    tone: "bg-blue-500",
    glyph: (
      <svg viewBox="0 0 512 512" fill="currentColor" className="h-5 w-5">
        <path d="M0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM64 96l0 96 128 0 0-96L64 96zm384 0L256 96l0 96 192 0 0-96zM192 256L64 256l0 160 128 0 0-160zm64 160l192 0 0-160-192 0 0 160z" />
      </svg>
    ),
  },
  {
    id: "sandbox",
    title: "Copy Template to Sandbox",
    body: "Copy template and edit in sandbox",
    tone: "bg-indigo-500",
    glyph: (
      <svg viewBox="0 0 576 512" fill="currentColor" className="h-5 w-5">
        <path d="M234.7 42.7 197 56.8c-3 1.1-5 4-5 7.2s2 6.1 5 7.2l37.7 14.1L248.8 123c1.1 3 4 5 7.2 5s6.1-2 7.2-5l14.1-37.7L315 71.2c3-1.1 5-4 5-7.2s-2-6.1-5-7.2L277.3 42.7 263.2 5c-1.1-3-4-5-7.2-5s-6.1 2-7.2 5L234.7 42.7zM46.1 395.4c-18.7 18.7-18.7 49.1 0 67.9l34.6 34.6c18.7 18.7 49.1 18.7 67.9 0L529.9 116.5c18.7-18.7 18.7-49.1 0-67.9L495.3 14.1c-18.7-18.7-49.1-18.7-67.9 0L46.1 395.4zM484.6 82.6l-105 105-23.3-23.3 105-105 23.3 23.3zM7.5 117.2C3 118.9 0 123.2 0 128s3 9.1 7.5 10.8L64 160l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L128 160l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L128 96 106.8 39.5C105.1 35 100.8 32 96 32s-9.1 3-10.8 7.5L64 96 7.5 117.2zm352 256c-4.5 1.7-7.5 6-7.5 10.8s3 9.1 7.5 10.8L416 416l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L480 416l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L480 352l-21.2-56.5c-1.7-4.5-6-7.5-10.8-7.5s-9.1 3-10.8 7.5L416 352l-56.5 21.2z" />
      </svg>
    ),
  },
];

/**
 * "Start with Template" dialog — mirrors the reference's project-create sheet.
 */
export function CreateProjectDialog({
  onPick,
  onClose,
  busy,
  error,
  hideAi,
}: {
  onPick: (option: CreateOption) => void;
  onClose: () => void;
  busy?: CreateOption | null;
  error?: string | null;
  hideAi?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const options = hideAi ? OPTIONS.filter((o) => o.id !== "ai") : OPTIONS;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (!ref.current?.contains(e.target as Node)) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Start with template"
        className="w-full max-w-[560px] divide-y divide-gray-100 rounded-xl bg-white shadow-xl"
      >
        <ul id="options" role="listbox" className="max-h-96 scroll-py-3 overflow-y-auto p-3">
          {options.map((o) => (
            <li key={o.id} role="option" aria-selected={false}>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => onPick(o.id)}
                className="group flex w-full cursor-pointer select-none rounded-xl p-3 text-left hover:bg-gray-100 disabled:cursor-progress"
              >
                <span className="flex h-10 w-10 flex-none items-center justify-center self-center rounded-lg">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-lg text-white ring-4 ring-white ${o.tone}`}
                  >
                    {busy === o.id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      o.glyph
                    )}
                  </span>
                </span>
                <span className="ml-4 flex-auto">
                  <span className="block text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {o.title}
                  </span>
                  <span className="block text-sm text-gray-500 group-hover:text-gray-700">
                    {o.body}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {error && (
          <p role="alert" className="px-6 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex p-4 py-2 text-center text-sm text-gray-500">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm font-semibold text-gray-800 hover:bg-gray-100"
          >
            Cancel
          </button>
          <div className="flex-grow" />
        </div>
      </div>
    </div>
  );
}
