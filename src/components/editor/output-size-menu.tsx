"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { OUTPUT_BY_ID } from "@/lib/devices";
import { DevicesIcon } from "./editor-icons";

/** Where the menu should sit, measured from its trigger. */
type Anchor = { top: number; right: number };

function useAnchor(open: boolean): Anchor | null {
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const trigger = document.querySelector("[data-size-trigger]");
      if (!trigger) return;
      const r = trigger.getBoundingClientRect();
      setAnchor({ top: r.bottom + 8, right: window.innerWidth - r.right });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open]);

  return anchor;
}

/**
 * The size switcher that drops out of the toolbar's output pill.
 *
 * Mirrors the reference: the project's selected sizes as plain labels — the
 * active one in bold — closed by an "Add more sizes" row that opens the Output
 * Sizes sheet. Rendered through a portal because the toolbar scrolls
 * horizontally and would otherwise clip it.
 */
export function OutputSizeMenu({
  outputs,
  activeOutput,
  onSelect,
  onAddMore,
  onDismiss,
}: {
  outputs: string[];
  activeOutput: string;
  onSelect: (id: string) => void;
  onAddMore: () => void;
  onDismiss: () => void;
}) {
  const anchor = useAnchor(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  if (typeof document === "undefined" || !anchor) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close size menu"
        tabIndex={-1}
        onClick={onDismiss}
        className="fixed inset-0 z-[60] cursor-default"
      />
      <div
        role="menu"
        style={{ top: anchor.top, right: anchor.right }}
        className="fixed z-[61] w-[280px] overflow-hidden rounded-2xl bg-white py-2 shadow-[0_10px_38px_rgba(24,24,27,0.22)]"
      >
        {outputs.map((id) => {
          const o = OUTPUT_BY_ID.get(id);
          if (!o) return null;
          const active = id === activeOutput;
          return (
            <button
              key={id}
              role="menuitemradio"
              aria-checked={active}
              type="button"
              onClick={() => onSelect(id)}
              className={`block w-full px-6 py-3 text-left text-[15px] leading-6 hover:bg-gray-50 ${
                active ? "font-bold text-zinc-900" : "font-normal text-zinc-700"
              }`}
            >
              {o.label}
            </button>
          );
        })}
        <button
          role="menuitem"
          type="button"
          onClick={onAddMore}
          className="mt-1 flex w-full items-center gap-3 px-6 py-3 text-left text-[15px] font-bold leading-6 text-indigo-600 hover:bg-gray-50"
        >
          <DevicesIcon className="h-6 w-6 shrink-0" />
          Add more sizes
        </button>
      </div>
    </>,
    document.body,
  );
}
