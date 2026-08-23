"use client";

import { useState } from "react";
import { OUTPUT_SIZES, orderOutputs } from "@/lib/devices";

/**
 * The reference's "Output Sizes" sheet, reached from Setup and from the
 * "Add more sizes" row of the size menu. Shared by both editors.
 */
export function OutputSizesDialog({
  selected,
  onClose,
  onSave,
}: {
  selected: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
}) {
  const [ids, setIds] = useState<string[]>(selected);
  const groups = ["Apple", "Android", "Custom"] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Output Sizes"
        className="w-full max-w-xl rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="m-0 text-lg font-bold text-gray-900">Output Sizes</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 pb-6">
          <p className="mb-4 text-sm text-gray-500">
            Select the output sizes that you require for export.
          </p>
          {groups.map((g) => {
            const list = OUTPUT_SIZES.filter((o) => o.store === g);
            if (!list.length) return null;
            return (
              <div key={g} className="mb-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  {g}
                </p>
                <div className="space-y-1">
                  {list.map((o) => (
                    <label
                      key={o.id}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={ids.includes(o.id)}
                        onChange={(e) =>
                          setIds((v) =>
                            e.target.checked
                              ? [...v, o.id]
                              : v.filter((x) => x !== o.id),
                          )
                        }
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                      />
                      <span className="flex-1 text-sm text-gray-800">
                        {o.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {o.width}×{o.height}px
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!ids.length}
              onClick={() => {
                onSave(orderOutputs(ids));
                onClose();
              }}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
