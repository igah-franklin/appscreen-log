"use client";

export function ChatLauncher() {
  return (
    <button
      type="button"
      aria-label="Open chat"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#7c3aed] text-white shadow-[0_4px_12px_rgba(0,0,0,.35)] transition-transform duration-200 hover:scale-105"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
      </svg>
    </button>
  );
}
