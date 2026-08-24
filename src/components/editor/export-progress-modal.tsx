"use client";

import { CheckIcon } from "./editor-icons";

export type ExportProgress = {
  active: boolean;
  done: number;
  total: number;
  message: string;
  isComplete?: boolean;
};

export function ExportProgressModal({
  progress,
  onClose,
}: {
  progress: ExportProgress;
  onClose?: () => void;
}) {
  if (!progress.active) return null;

  const pct =
    progress.total > 0
      ? Math.min(100, Math.round((progress.done / progress.total) * 100))
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900 p-6 text-white shadow-2xl shadow-black/50">
        <div className="flex flex-col items-center text-center">
          {progress.isComplete ? (
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40">
              <CheckIcon className="h-8 w-8" />
            </div>
          ) : (
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
              <span className="absolute text-xs font-bold text-indigo-300 tabular-nums">
                {pct}%
              </span>
            </div>
          )}

          <h3 className="text-lg font-bold text-zinc-100">
            {progress.isComplete
              ? "Export Complete!"
              : "Generating Screenshots"}
          </h3>

          <p className="mt-1.5 text-xs text-zinc-400 font-medium">
            {progress.message || "Preparing your store-ready screenshot assets..."}
          </p>

          {!progress.isComplete && (
            <div className="mt-5 w-full">
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5 font-mono">
                <span>Progress</span>
                <span>
                  {progress.done} / {progress.total} screens ({pct}%)
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 transition-all duration-300 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {progress.isComplete && (
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 active:scale-[0.98]"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
