import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const M = (d: string, viewBox = "0 0 24 24") =>
  function Icon(p: P) {
    return (
      <svg viewBox={viewBox} fill="currentColor" aria-hidden="true" {...p}>
        <path d={d} />
      </svg>
    );
  };

/* Material glyphs used by the designer chrome */
export const CheckIcon = M("M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z");
export const RefreshIcon = M(
  "M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z",
);
export const CopyIcon = M(
  "M16 1H4a2 2 0 0 0-2 2v14h2V3h12zm3 4H8a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m0 16H8V7h11z",
);
export const DownloadIcon = M("M19 9h-4V3H9v6H5l7 7zM5 18v2h14v-2z");
export const PasteGoIcon = M(
  "M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7v-2H5V5h2v3h10V5h2v6h2V5a2 2 0 0 0-2-2m-7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2m6 11-1.41 1.41L18.17 17H14v2h4.17l-1.58 1.59L18 22l4-4z",
);
export const TrashIcon = M(
  "M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z",
);
export const EditIcon = M(
  "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z",
);
export const ZoomInIcon = M(
  "M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14M12 10h-2v2H9v-2H7V9h2V7h1v2h2z",
);
export const ZoomOutIcon = M(
  "M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14M7 9h5v1H7z",
);
export const KeyboardIcon = M(
  "M20 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-9 3h2v2h-2zm0 3h2v2h-2zM8 8h2v2H8zm0 3h2v2H8zm-1 2H5v-2h2zm0-3H5V8h2zm9 7H8v-2h8zm0-4h-2v-2h2zm0-3h-2V8h2zm3 3h-2v-2h2zm0-3h-2V8h2z",
);
export const ChevronIcon = M("M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z");
export const ChevronLeftIcon = M("M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z");
export const SaveIcon = M(
  "M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7zm-5 16a3 3 0 1 1 0-6 3 3 0 0 1 0 6m3-10H5V5h10z",
);
export const SwapIcon = M("M6.99 11 3 15l3.99 4v-3H14v-2H6.99zM21 9l-3.99-4v3H10v2h7.01v3z");
export const HistoryIcon = M(
  "M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6a7 7 0 1 1 2.05 4.95l-1.42 1.42A9 9 0 1 0 13 3m-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8z",
);
export const EraserIcon = M(
  "M15.14 3a1.99 1.99 0 0 0-1.41.59L2.59 14.73a2 2 0 0 0 0 2.83L5.03 20H10l9.41-9.41a2 2 0 0 0 0-2.83l-2.86-2.86A1.99 1.99 0 0 0 15.14 3M6.41 18l-2.4-2.42 5.66-5.65 4.24 4.24L10.35 18z",
);
export const SparklesIcon = M(
  "M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25zM11.5 9.5 9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25z",
);
export const GlobeIcon = M(
  "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m6.93 6h-2.95a15.7 15.7 0 0 0-1.38-3.56A8 8 0 0 1 18.92 8M12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96M4.26 14A7.8 7.8 0 0 1 4 12c0-.69.1-1.36.26-2h3.38a16.5 16.5 0 0 0 0 4zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A8 8 0 0 1 5.08 16m2.95-8H5.08a8 8 0 0 1 4.33-3.56A15.7 15.7 0 0 0 8.03 8M12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82A15.6 15.6 0 0 1 12 19.96M14.34 14H9.66a14.7 14.7 0 0 1 0-4h4.68a14.7 14.7 0 0 1 0 4m.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8 8 0 0 1-4.33 3.56M16.36 14a16.5 16.5 0 0 0 0-4h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2z",
);
export const GearIcon = M(
  "m19.14 12.94.06-.94-.06-.94 2.03-1.58a.5.5 0 0 0 .12-.61l-1.92-3.32a.5.5 0 0 0-.59-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.59.22L2.7 8.87a.5.5 0 0 0 .12.61l2.03 1.58-.06.94.06.94-2.03 1.58a.5.5 0 0 0-.12.61l1.92 3.32c.12.22.39.3.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.4.24.25.42.5.42h3.84c.25 0 .46-.18.5-.42l.36-2.54c.59-.24 1.12-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.5.5 0 0 0-.12-.61zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2",
);
export const PanoramaIcon = M(
  "M23 18V6c0-1.1-.9-2-2-2H3a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h18a2 2 0 0 0 2-2M8.9 12.98l2.1 2.53 3.1-3.99L19 17H5z",
);
export const IdCardIcon = M(
  "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m-9 3h7v2h-7zm0 4h7v2h-7zm-4-4a2 2 0 1 1 0 4 2 2 0 0 1 0-4m4 10H3v-1c0-1.33 2.67-2 4-2s4 .67 4 2z",
);
export const MobileIcon = M(
  "M17 1H7a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2m0 18H7V5h10z",
);
export const LayersIcon = M(
  "m12 2-10 5 10 5 10-5zM2 12l10 5 10-5-1.9-.95L12 15.1l-8.1-4.05zm0 5 10 5 10-5-1.9-.95L12 20.1l-8.1-4.05z",
);
export const ImageIcon = M(
  "M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2M8.5 13.5l2.5 3 3.5-4.5 4.5 6H5z",
);
export const TextSizeIcon = M("M9 4v3h5v12h3V7h5V4zm-6 8h3v7h3v-7h3V9H3z");
export const PlusCircleIcon = M(
  "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m5 11h-4v4h-2v-4H7v-2h4V7h2v4h4z",
);
export const MoveIcon = M(
  "m10 9h4V6h3l-5-5-5 5h3zm-1 1H6V7l-5 5 5 5v-3h3zm14 2-5-5v3h-3v2h3v3zm-9 3h-4v3H7l5 5 5-5h-3z",
);
export const RulerIcon = M(
  "M1.39 18.36 3.16 20.13 20.13 3.16 18.36 1.39zM5.64 18.36l1.06-1.06-1.77-1.77 1.42-1.42 1.77 1.77 1.06-1.06-1.77-1.77 1.41-1.41 1.77 1.77 1.06-1.06-1.77-1.77 1.42-1.42 1.77 1.77 1.06-1.06-1.77-1.77 1.41-1.41 1.77 1.77 1.06-1.06L18.36 5.64z",
);
export const ContrastIcon = M(
  "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 18V4a8 8 0 0 1 0 16",
);
export const RotateIcon = M(
  "M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8",
);
export const PinIcon = M("M16 9V4h1V2H7v2h1v5l-2 2v2h5.2v7h1.6v-7H18v-2z");
export const DesktopIcon = M(
  "M21 2H3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h7v2H8v2h8v-2h-2v-2h7a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2m0 13H3V4h18z",
);

/** Tablet + phone glyph used by the size menu's "Add more sizes" row. */
export function DevicesIcon(p: P) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...p}
    >
      <rect x="1.5" y="5.5" width="13" height="13" rx="1.6" />
      <path d="M5.5 15.5h5" />
      <rect x="17" y="9" width="5.5" height="9.5" rx="1.2" />
    </svg>
  );
}
